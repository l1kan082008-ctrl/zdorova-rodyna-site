import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const readSource = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("database stores keep values out of SQL text", async () => {
  const storePaths = [
    "app/api/banners/bannerStore.ts",
    "app/api/bookings/bookingStore.ts",
    "app/api/doctors/doctorStore.ts",
    "app/api/locations/branchServiceStore.ts",
    "app/api/locations/locationStore.ts",
    "app/api/prices/priceStore.ts",
    "app/api/services/serviceStore.ts",
  ];
  const stores = await Promise.all(storePaths.map(readSource));

  for (const [index, source] of stores.entries()) {
    assert.doesNotMatch(
      source,
      /\.prepare\(\s*`[^`]*\$\{/,
      `${storePaths[index]} must not interpolate values into SQL`,
    );
  }

  const catalog = stores.join("\n");
  assert.match(catalog, /VALUES\s*\(\s*(?:\?,\s*){5,}\?/);
  assert.match(catalog, /WHERE id = \?[\s\S]*?\.bind\(id\)/);
  assert.match(catalog, /SET status = \?[\s\S]*?\.bind\(status, id\)/);
  assert.doesNotMatch(catalog, /const where = .*WHERE/);
});

test("AI operator API awaits the admin authorization check", async () => {
  const routes = await Promise.all([
    readSource("app/api/admin/ai-operator/realtime/route.ts"),
    readSource("app/api/admin/ai-operator/tools/route.ts"),
  ]);

  for (const route of routes) {
    assert.match(route, /await isAuthorizedAdmin\(request\)/);
    assert.doesNotMatch(route, /if \(!isAuthorizedAdmin\(request\)\)/);
  }
});

test("admin authentication is hardened end to end", async () => {
  const [session, route, auth, worker, migration] = await Promise.all([
    readSource("lib/adminSession.ts"),
    readSource("app/api/admin/session/route.ts"),
    readSource("app/api/admin/adminAuth.ts"),
    readSource("worker/index.ts"),
    readSource("drizzle/0010_outgoing_scorpion.sql"),
  ]);

  assert.match(session, /pbkdf2-sha256/);
  assert.match(session, /PASSWORD_HASH_ITERATIONS = 100_000/);
  assert.doesNotMatch(route, /ADMIN_PASSWORD\??:/);
  assert.match(route, /ADMIN_PASSWORD_HASH/);
  assert.match(session, /__Host-zr_admin_session/);
  assert.match(session, /SameSite=Strict/);
  assert.match(session, /crypto\.getRandomValues/);
  assert.match(session, /CREATE TABLE IF NOT EXISTS admin_sessions/);
  assert.match(session, /CREATE TABLE IF NOT EXISTS admin_login_attempts/);
  assert.match(route, /jsonError\([^;]*429/s);
  assert.match(auth, /isTrustedAdminMutation/);
  assert.match(worker, /frame-ancestors 'none'/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS `admin_sessions`/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS `admin_login_attempts`/);
});

test("mobile homepage keeps section copy in the viewport", async () => {
  const css = await readSource("app/globals.css");

  assert.match(
    css,
    /@media \(max-width: 720px\)[\s\S]*?\.doctors-heading,\s*\.pricing-heading\s*\{[\s\S]*?flex-direction:\s*column/,
  );
  assert.match(
    css,
    /\.doctors-heading > div,[\s\S]*?\.pricing-heading > p\s*\{[\s\S]*?width:\s*100%/,
  );
  assert.match(
    css,
    /@media \(max-width: 720px\)[\s\S]*?\.hero-art\s*\{[\s\S]*?background-position:\s*78% center/,
  );
});

test("homepage search covers services, doctors, prices and locations", async () => {
  const [page, search, smartSearch, css] = await Promise.all([
    readSource("app/page.tsx"),
    readSource("app/components/HomeSearch.tsx"),
    readSource("app/search/medicalSearch.ts"),
    readSource("app/globals.css"),
  ]);

  assert.match(page, /<HomeSearch items=\{searchItems\}/);
  assert.match(page, /\.\.\.serviceDetails\.map/);
  assert.match(page, /\.\.\.showcaseDoctors\.map/);
  assert.match(page, /\.\.\.priceItems/);
  assert.match(page, /\.\.\.centerLocations\.map/);
  assert.match(search, /Послуга, лікар, аналіз або відділення/);
  assert.match(search, /Часто шукають/);
  assert.match(search, /Послуги[\s\S]*Лікарі[\s\S]*Дослідження[\s\S]*Відділення/);
  assert.match(search, /if \(!normalizedQuery\)[\s\S]*openSearch\(\)/);
  assert.match(search, /addPriceCalculatorSelection\(itemId\)/);
  assert.match(search, /removePriceCalculatorSelection\(itemId\)/);
  assert.match(search, /item\.kind === "doctor"[\s\S]*item\.imageUrl/);
  assert.doesNotMatch(search, /home-search-submit/);
  assert.doesNotMatch(search, /groupLabels\[item\.kind\]\.slice/);
  assert.match(search, /aria-pressed=\{selectedPriceIds\.includes\(item\.id\)\}/);
  assert.match(search, /selectedPriceIds\.includes\(item\.id\) \? "Додано" : "Додати"/);
  assert.match(search, /panelRef\.current\?\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/);
  assert.match(search, /className="home-search-result-action-label"/);
  assert.match(search, /className="home-search-result-action-icon"/);
  assert.match(search, /aria-label="Очистити пошук"/);
  assert.match(search, /const clearQuery = \(input: "desktop" \| "mobile"\)/);
  assert.match(search, /desktopInputRef/);
  assert.match(css, /\.home-search-clear\s*\{[\s\S]*?place-items:\s*center/);
  assert.match(
    css,
    /\.home-search-mobile-head form\s*\{[\s\S]*?grid-template-columns:\s*34px minmax\(0, 1fr\) auto/,
  );
  assert.match(smartSearch, /const latinToUkrainianKeyboard/);
  assert.match(smartSearch, /const searchAliases/);
  assert.match(smartSearch, /ангеография:\s*\["ангіографія"\]/);
  assert.match(smartSearch, /ангиография:\s*\["ангіографія"\]/);
  assert.match(smartSearch, /const editDistance/);
  assert.match(search, /scoreMedicalSearch/);
  assert.match(search, /exactResult \?\? \(allResults\.length === 1/);
  assert.match(
    css,
    /\.home-search-result-action\.is-added\s*\{[\s\S]*?border-color:\s*var\(--orange\);[\s\S]*?background:\s*var\(--orange\);/,
  );
  assert.match(search, /className="home-search-group-all"/);
  assert.match(search, /service: "\/services"/);
  assert.match(search, /doctor: "\/doctors"/);
  assert.match(search, /price: "\/prices"/);
  assert.match(search, /location: "\/contacts"/);
  assert.match(search, /doctor: "Переглянути всіх"/);
  assert.match(page, /actionHref: `\/services\/\$\{service\.slug\}`/);
  assert.match(page, /imageUrl: doctor\.photoUrl/);
  assert.match(
    css,
    /@media \(max-width: 720px\)[\s\S]*?\.home-search-panel\s*\{[\s\S]*?position:\s*fixed/,
  );
  assert.match(
    css,
    /\.home-search-mobile-head input\s*\{[\s\S]*?font-size:\s*16px/,
  );
  assert.match(
    css,
    /\.home-search-panel\s*\{[\s\S]*?max-width:\s*100vw;[\s\S]*?overflow-x:\s*hidden/,
  );
  assert.match(
    css,
    /\.home-search-result-action\s*\{[\s\S]*?display:\s*grid;[\s\S]*?place-items:\s*center;[\s\S]*?gap:\s*0;/,
  );
});

test("price search has an accessible clear control", async () => {
  const [catalog, css] = await Promise.all([
    readSource("app/prices/PriceCatalog.tsx"),
    readSource("app/globals.css"),
  ]);

  assert.match(catalog, /const searchInputRef = useRef<HTMLInputElement>\(null\)/);
  assert.match(catalog, /const clearSearch = \(\) =>/);
  assert.match(catalog, /className="price-search-clear"/);
  assert.match(catalog, /aria-label="Очистити пошук"/);
  assert.match(catalog, /window\.requestAnimationFrame\(\(\) => searchInputRef\.current\?\.focus\(\)\)/);
  assert.match(css, /\.price-search-clear\s*\{[\s\S]*?place-items:\s*center/);
});

test("smart medical search finds angiography despite language and spelling variants", async () => {
  const [{ scoreMedicalSearch }, { officialPriceItems }] = await Promise.all([
    import(new URL("../app/search/medicalSearch.ts", import.meta.url)),
    import(new URL("../app/prices/officialPriceData.ts", import.meta.url)),
  ]);

  for (const query of [
    "ангеография",
    "ангіографія",
    "ангиография",
    "ангеографии сосудов",
  ]) {
    const matches = officialPriceItems.filter(
      (item) =>
        scoreMedicalSearch(
          query,
          item.name,
          `${item.categoryLabel} ${item.duration}`,
        ) > 0,
    );

    assert.ok(matches.length > 0, `No angiography matches for: ${query}`);
    assert.ok(
      matches.some((item) => item.name.includes("ангіографія")),
      `Unexpected angiography results for: ${query}`,
    );
  }
});

test("smart medical search understands ZAK as a complete blood count", async () => {
  const [{ scoreMedicalSearch }, { officialPriceItems }] = await Promise.all([
    import(new URL("../app/search/medicalSearch.ts", import.meta.url)),
    import(new URL("../app/prices/officialPriceData.ts", import.meta.url)),
  ]);

  for (const query of ["ЗАК", "зак"]) {
    const matches = officialPriceItems
      .map((item) => ({
        item,
        score: scoreMedicalSearch(
          query,
          item.name,
          `${item.categoryLabel} ${(item.aliases ?? []).join(" ")}`,
        ),
      }))
      .filter(({ score }) => score > 0)
      .sort((first, second) => second.score - first.score);

    assert.ok(matches.length > 0, `No complete blood count matches for: ${query}`);
    assert.match(matches[0].item.name, /^Загальний розгорнутий аналіз крові/);
    assert.ok(
      matches.every(({ item }) =>
        item.name.startsWith("Загальний розгорнутий аналіз крові"),
      ),
      `Unexpected ZAK results for: ${query}`,
    );
  }
});

test("homepage reception uses the dedicated center photo", async () => {
  const css = await readSource("app/globals.css");

  assert.match(
    css,
    /\.reception-photo\s*\{[\s\S]*?background-image:\s*url\("\/center-reception\.webp"\)/,
  );
  assert.doesNotMatch(
    css,
    /\.reception-photo\s*\{[\s\S]{0,350}?design-reference\.png/,
  );
});

test("about story stays informational without a booking button", async () => {
  const page = await readSource("app/about/page.tsx");
  const story = page.match(
    /<section className="about-route"[\s\S]*?<\/section>/,
  )?.[0] ?? "";

  assert.ok(story);
  assert.doesNotMatch(story, /Записатися на прийом/);
  assert.doesNotMatch(story, /contacts#booking/);
});

test("about heart diagnostics links directly to cardiology services", async () => {
  const page = await readSource("app/about/page.tsx");

  assert.match(
    page,
    /title: "Діагностика серця"[\s\S]*?href: "\/services\/cardiology#cardiology-services"/,
  );
});

test("homepage service cards use calm artwork and open service detail pages", async () => {
  const [page, css, ...assets] = await Promise.all([
    readSource("app/page.tsx"),
    readSource("app/globals.css"),
    ...[
      "ct",
      "mri",
      "ultrasound",
      "lab",
      "consultation",
      "cardiology",
      "family",
    ].map((name) =>
      readFile(new URL(`../public/service-cards/${name}-v2.jpg`, import.meta.url)),
    ),
  ]);

  assert.match(
    css,
    /\.service-card\s*\{[\s\S]*?min-height:\s*184px[\s\S]*?background:\s*#f8fbfa/,
  );
  assert.match(
    css,
    /\.service-card--ct\s*\{[\s\S]*?--service-art:\s*url\("\/service-cards\/ct-v2\.jpg"\)/,
  );
  assert.match(
    css,
    /\.service-card--family\s*\{[\s\S]*?--service-art:\s*url\("\/service-cards\/family-v2\.jpg"\)/,
  );
  assert.match(page, /import \{ primaryServiceDetails \} from "\.\/services\/serviceData"/);
  assert.match(page, /primaryServiceDetails\.map/);
  assert.match(css, /\.service-card--home-nurse\s*\{[\s\S]*?home-nurse\.svg/);
  assert.match(page, /className=\{`service-card service-card--\$\{service\.slug\}`\}/);
  assert.match(page, /href=\{`\/services\/\$\{service\.slug\}`\}/);
  assert.doesNotMatch(page, /<ServiceIcon/);
  assets.forEach((asset) => assert.ok(asset.length > 20_000));
});

test("every homepage service has a detailed information page", async () => {
  const [data, page, servicesPage, css] = await Promise.all([
    readSource("app/services/serviceData.ts"),
    readSource("app/services/[slug]/page.tsx"),
    readSource("app/services/page.tsx"),
    readSource("app/globals.css"),
  ]);

  for (const slug of [
    "ct",
    "mri",
    "ultrasound",
    "lab",
    "consultation",
    "cardiology",
    "holter",
    "home-nurse",
    "family",
  ]) {
    assert.match(data, new RegExp(`slug: "${slug}"`));
  }
  assert.match(page, /generateStaticParams/);
  assert.match(page, /Як підготуватися/);
  assert.match(page, /Як усе відбувається/);
  assert.match(page, /\/contacts\?service=/);
  assert.match(servicesPage, /href=\{`\/services\/\$\{item\.slug\}`\}/);
  assert.match(css, /\.service-detail-hero\s*\{/);
  assert.match(css, /\.service-information-grid\s*\{/);
});

test("diagnostic detail pages link to their matching price results", async () => {
  const page = await readSource("app/services/[slug]/page.tsx");

  assert.match(page, /\/prices\?category=ct#price-calculator/);
  assert.match(
    page,
    /\/prices\?category=heart&search=Холтер#price-calculator/,
  );
  assert.match(page, /\/prices\?category=mri#price-calculator/);
  assert.match(page, /\/prices\?category=ultrasound#price-calculator/);
});

test("ultrasound page uses the technological equipment hero and animated waves", async () => {
  const [page, css, image] = await Promise.all([
    readSource("app/services/[slug]/page.tsx"),
    readSource("app/globals.css"),
    readFile(
      new URL(
        "../public/service-heroes/ultrasound-technological-v1.png",
        import.meta.url,
      ),
    ),
  ]);

  assert.match(page, /service-detail-hero--ultrasound-cinematic/);
  assert.match(page, /ultrasound-cinematic-waves/);
  assert.match(
    css,
    /background-image:\s*url\("\/service-heroes\/ultrasound-technological-v1\.png"\)/,
  );
  assert.match(
    css,
    /\.ultrasound-cinematic-backdrop\s*\{[\s\S]*?inset:\s*-1px;[\s\S]*?background-position:\s*right center;[\s\S]*?background-size:\s*auto 100%/,
  );
  assert.match(
    css,
    /\.service-detail-hero\.service-detail-hero--ultrasound-cinematic\s*\{[\s\S]*?border:\s*0;[\s\S]*?background:\s*#021c22;[\s\S]*?box-shadow:\s*none/,
  );
  assert.match(css, /@keyframes ultrasound-arc-pulse/);
  assert.ok(image.length > 50_000);
});

test("MRI page features the real 2026 Siemens MAGNETOM Flow Plus", async () => {
  const [page, data, css, image] = await Promise.all([
    readSource("app/services/[slug]/page.tsx"),
    readSource("app/services/serviceData.ts"),
    readSource("app/globals.css"),
    readFile(
      new URL(
        "../public/service-heroes/mri-cinematic-v1.png",
        import.meta.url,
      ),
    ),
  ]);

  assert.match(page, /service-detail-hero--mri-cinematic/);
  assert.match(page, /Siemens MAGNETOM Flow Plus 2026 року випуску/);
  assert.match(data, /апараті 2026 року випуску/);
  assert.match(data, /Deep Resolve/);
  assert.match(data, /Quiet Suite/);
  assert.match(
    css,
    /background-image:\s*url\("\/service-heroes\/mri-cinematic-v1\.png"\)/,
  );
  assert.ok(image.length > 50_000);
});

test("cardiology page includes Holter as a fourth service", async () => {
  const [page, data, css, image] = await Promise.all([
    readSource("app/services/[slug]/page.tsx"),
    readSource("app/services/serviceData.ts"),
    readSource("app/globals.css"),
    readFile(
      new URL(
        "../public/service-heroes/cardiology-cinematic-v1.png",
        import.meta.url,
      ),
    ),
  ]);

  assert.match(page, /service-detail-hero--cardiology-cinematic/);
  assert.match(page, /Серце під надійним наглядом/);
  assert.match(page, /\/prices\?category=heart#price-calculator/);
  assert.match(
    css,
    /background-image:\s*url\("\/service-heroes\/cardiology-cinematic-v1\.png"\)/,
  );
  assert.ok(image.length > 50_000);
  assert.match(data, /facts: \["Консультація кардіолога", "ЕКГ", "УЗД серця", "Холтер ЕКГ"\]/);
  assert.match(page, /cardiologyBookingDefinitions/);
  assert.match(page, /cardiologyBookingOptions/);
  assert.match(page, /reference: priceReferences\.primaryConsultation/);
  assert.match(page, /reference: priceReferences\.ecg/);
  assert.match(page, /reference: priceReferences\.echoHeart/);
  assert.match(page, /reference: priceReferences\.holter/);
  assert.match(page, /const item = resolvePriceItem\(/);
  assert.match(page, /title: item\.name/);
  assert.match(page, /price: item\.amount/);
  assert.doesNotMatch(page, /price: (700|280|650|900)/);
  assert.match(page, /isHolter[\s\S]*?className="cardiology-direct-actions"/);
  assert.match(page, /href="\/services\/holter"[\s\S]*?Детальніше/);
  assert.doesNotMatch(page, /cardiology-direct-booking is-primary/);
  assert.match(page, /includes\("кардіолог"\)/);
  assert.match(page, /encodeURIComponent\(option\.title\)/);
  assert.match(page, /encodeURIComponent\(doctor\.name\)/);
  assert.match(page, /id=\{isCardiology \? "cardiology-services"/);
  assert.match(css, /\.service-facts--booking\s*\{[\s\S]*?repeat\(4,/);
  assert.match(css, /\.cardiology-doctor-picker summary\s*\{/);
  assert.match(
    css,
    /\.cardiology-direct-actions\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/,
  );
  assert.match(page, /<GlowPriceCard[\s\S]*?className="cardiology-service-card"/);
  assert.match(page, /cardiology-doctor-avatar[\s\S]*?doctor\.photoUrl/);
  assert.match(page, /isCardiology \? \([\s\S]*?service-overview--cardiology/);
  assert.match(page, /className="cardiology-guide-grid"/);
  assert.match(page, /className="cardiology-guide-symptoms"/);
  assert.doesNotMatch(page, /cardiologyGuideOptions/);
  assert.doesNotMatch(page, /Кардіологічна допомога в одному місці/);
  assert.doesNotMatch(page, /className="cardiology-guide-services"/);
  assert.match(
    page,
    /!isCardiology && !isFamilyMedicine && !isConsultation \? \([\s\S]*?className="service-information-grid"/,
  );
  assert.match(
    page,
    /!isCardiology && !isFamilyMedicine && !isConsultation \? \([\s\S]*?className="service-process"/,
  );
  assert.match(
    css,
    /\.service-overview--cardiology\s*\{[\s\S]*?grid-template-columns:\s*1fr/,
  );
  assert.match(
    css,
    /\.cardiology-guide-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 780px\)/,
  );
});

test("home nurse page uses the chosen cinematic arrival hero", async () => {
  const [page, css, image] = await Promise.all([
    readSource("app/services/[slug]/page.tsx"),
    readSource("app/globals.css"),
    readFile(
      new URL(
        "../public/service-heroes/home-nurse-cinematic-v1.png",
        import.meta.url,
      ),
    ),
  ]);

  assert.match(page, /isHomeNurse/);
  assert.match(page, /service-detail-hero--home-nurse-cinematic/);
  assert.match(page, /Забір аналізів у вас вдома — у погоджений день і час/);
  assert.match(page, /home-nurse-route/);
  assert.match(page, /id="home-nurse-route-main"/);
  assert.match(page, /<animateMotion/);
  assert.match(page, /preserveAspectRatio="xMidYMid meet"/);
  assert.match(
    css,
    /background-image:\s*url\("\/service-heroes\/home-nurse-cinematic-v1\.png"\)/,
  );
  assert.match(css, /@keyframes home-nurse-route-dashes/);
  assert.match(css, /\.home-nurse-route\s*\{[\s\S]*?aspect-ratio:\s*1120 \/ 110/);
  assert.match(
    css,
    /\.home-nurse-route-main\s*\{[\s\S]*?stroke-width:\s*2\.4px;[\s\S]*?vector-effect:\s*non-scaling-stroke/,
  );
  assert.ok(image.length > 100_000);
});

test("popular price cards form a swipeable carousel with a clean teal glow", async () => {
  const [page, card, scroller, css] = await Promise.all([
    readSource("app/page.tsx"),
    readSource("app/components/GlowPriceCard.tsx"),
    readSource("app/components/HorizontalCardScroller.tsx"),
    readSource("app/globals.css"),
  ]);
  const priceCardRule = css.match(/\.price-card\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(
    page,
    /<GlowPriceCard key=\{item\.priceItemId\} className="price-card--plain">/,
  );
  assert.match(
    page,
    /listPublicPriceItems\(\)\.catch\(\(\) => catalogItems\)/,
  );
  assert.match(page, /title: item\.name/);
  assert.match(page, /text: formatPrice\(item\.amount\)/);
  assert.doesNotMatch(page, /className="price-label"/);
  assert.doesNotMatch(page, />Популярне<\/span>/);
  assert.match(page, /<HorizontalCardScroller label=/);
  assert.match(page, /\.slice\(0, 8\)/);
  assert.doesNotMatch(page, /tone=/);
  assert.match(scroller, /scrollBy\(/);
  assert.match(scroller, /behavior: "smooth"/);
  assert.match(css, /\.pricing-grid\.pricing-carousel-track\s*\{[\s\S]*?overflow-x:\s*auto/);
  assert.match(css, /grid-auto-columns:\s*min\(82vw, 330px\)/);
  assert.match(css, /scroll-snap-type:\s*inline mandatory/);
  assert.match(card, /onPointerMove=\{followPointer\}/);
  assert.match(card, /"--spot-x"/);
  assert.match(card, /"--spot-y"/);
  assert.doesNotMatch(css, /\.price-card::before/);
  assert.match(
    css,
    /\.price-card::after\s*\{[\s\S]*?circle at var\(--spot-x\) var\(--spot-y\)/,
  );
  assert.match(
    css,
    /\.price-card\s*\{[\s\S]*?--glow-rgb:\s*17, 121, 122/,
  );
  assert.doesNotMatch(
    priceCardRule,
    /0 22px 48px rgba\(44, 64, 67, 0\.1\)/,
  );
  assert.match(
    css,
    /\.price-card--plain:hover,[\s\S]*?box-shadow:[\s\S]*?inset 0 1px 0[\s\S]*?transform:\s*none/,
  );
  assert.match(
    css,
    /\.price-card--plain\s*\{[\s\S]*?--glow-rgb:\s*255, 121, 0/,
  );
  assert.doesNotMatch(css, /\.price-card--plain::after\s*\{[\s\S]*?display:\s*none/);
  assert.match(
    css,
    /\.price-card \.outline-button:hover,[\s\S]*?background:\s*var\(--orange\)[\s\S]*?0 0 26px rgba\(255, 121, 0, 0\.34\)/,
  );
});

test("doctor pages receive their data during server rendering", async () => {
  const [directory, doctorsPage, profilePage, profileDetails] =
    await Promise.all([
      readSource("app/doctors/DoctorsDirectory.tsx"),
      readSource("app/doctors/page.tsx"),
      readSource("app/doctors/[id]/page.tsx"),
      readSource("app/doctors/[id]/DoctorProfileDetails.tsx"),
    ]);

  assert.match(doctorsPage, /await listDoctors\(\)/);
  assert.match(doctorsPage, /initialDoctors=\{doctors\}/);
  assert.doesNotMatch(directory, /fetch\(["']\/api\/doctors/);
  assert.match(profilePage, /await loadDoctor\(id\)/);
  assert.match(profileDetails, /doctor:\s*Doctor \| null/);
  assert.doesNotMatch(profileDetails, /fetch\(`/);
});

test("homepage all-doctor showcase expands on click and links to profiles", async () => {
  const [page, showcase, css, doctorData, doctorStore, importedPhotos] =
    await Promise.all([
      readSource("app/page.tsx"),
      readSource("app/components/DoctorsShowcase.tsx"),
      readSource("app/globals.css"),
      readSource("app/doctors/doctorData.ts"),
      readSource("app/api/doctors/doctorStore.ts"),
      readdir(new URL("../public/doctors/", import.meta.url)),
    ]);

  assert.match(page, /await Promise\.all\(\[[\s\S]*?listDoctors\(\)/);
  assert.doesNotMatch(page, /\.filter\(\(doctor\)[\s\S]*?specialty/);
  assert.match(page, /<DoctorsShowcase doctors=\{showcaseDoctors\} \/>/);
  assert.match(showcase, /data-doctor-id=\{doctor\.id\}/);
  assert.match(showcase, /type="button"/);
  assert.match(showcase, /onClick=\{\(\) => selectDoctor\(doctor\.id\)\}/);
  assert.match(showcase, /aria-expanded=\{isActive\}/);
  assert.match(showcase, /scrollIntoView\(\{/);
  assert.match(showcase, /disabled=\{activeIndex === 0\}/);
  assert.match(showcase, /disabled=\{activeIndex === doctors\.length - 1\}/);
  assert.doesNotMatch(showcase, /onPointerMove|onMouseEnter|setTimeout/);
  assert.match(showcase, /className="doctor-showcase-copy"/);
  assert.match(showcase, /href=\{`\/doctors\/\$\{doctor\.id\}`\}/);
  assert.doesNotMatch(showcase, /family-doctors-summary/);
  assert.equal(importedPhotos.filter((name) => name.endsWith(".webp")).length, 36);
  assert.match(doctorData, /photoUrl:\s*doctorPhotoUrls\[id\]\s*\?\?\s*""/);
  assert.match(doctorStore, /doctorPhotoUrls\[row\.id\]\s*\?\?\s*""/);
  assert.match(
    css,
    /\.doctor-showcase-panel\.is-active\s*\{[\s\S]*?flex-basis:\s*clamp\(340px, 38vw, 520px\)/,
  );
  assert.match(
    css,
    /\.doctor-showcase-panel:not\(\.is-active\):hover\s*\{[\s\S]*?flex-basis:\s*82px/,
  );
  assert.doesNotMatch(css, /0 0 0 2px rgba\(255, 126, 0, 0\.24\)/);
  assert.match(
    css,
    /flex-basis 500ms cubic-bezier\(0\.65, 0, 0\.35, 1\)/,
  );
});

test("calculator route hash is consumed after opening once", async () => {
  const catalog = await readSource("app/prices/PriceCatalog.tsx");

  assert.match(
    catalog,
    /selectionHydrated && window\.location\.hash === "#calculator"/,
  );
  assert.match(
    catalog,
    /window\.history\.replaceState\([\s\S]*?`\$\{window\.location\.pathname\}\$\{window\.location\.search\}`/,
  );
  assert.match(
    catalog,
    /if \(!selectedIds\.length\) \{[\s\S]*?removeEventListener/,
  );
});

test("calculator can save a PDF, share the selection and proceed to booking", async () => {
  const [catalog, exporter, css] = await Promise.all([
    readSource("app/prices/PriceCatalog.tsx"),
    readSource("app/prices/calculatorExport.ts"),
    readSource("app/globals.css"),
  ]);

  assert.match(catalog, /downloadCalculatorPdf\(calculatorExportItems, total\)/);
  assert.match(catalog, /shareCalculatorSelection\(calculatorExportItems, total\)/);
  assert.match(catalog, /Зберегти список у PDF/);
  assert.match(catalog, /Надіслати/);
  assert.match(catalog, /calculator-action-icon is-file-download/);
  assert.match(catalog, /calculator-action-icon is-share/);
  assert.match(catalog, /Перейти до запису/);
  assert.match(exporter, /new Blob\(\[joinBytes\(parts\)\], \{ type: "application\/pdf" \}\)/);
  assert.match(exporter, /navigator\.canShare\?\.\(\{ files: \[file\] \}\)/);
  assert.match(exporter, /navigator\.clipboard\.writeText\(text\)/);
  assert.match(css, /\.calculator-share-tools/);
  assert.match(css, /\.calculator-share-actions > button:hover[\s\S]*?background: #eaf5f4/);
  assert.doesNotMatch(
    css,
    /\.calculator-share-actions > button:first-child\s*\{[\s\S]*?background:/,
  );
});

test("price list shows the load-more action only for an expanded list with hidden rows", async () => {
  const catalog = await readSource("app/prices/PriceCatalog.tsx");

  assert.match(
    catalog,
    /const hasExpandedDisplayedGroup = displayedGroups\.some\([\s\S]*?!collapsedCategories\.has\(group\.category\)/,
  );
  assert.match(
    catalog,
    /const hasMoreVisibleItems =[\s\S]*?hasExpandedDisplayedGroup[\s\S]*?displayedItemCount < visibleItems\.length/,
  );
  assert.match(catalog, /\) : hasMoreVisibleItems \? \(/);
});

test("successful calculator booking clears its saved selection and header count", async () => {
  const [contacts, selection, catalog] = await Promise.all([
    readSource("app/contacts/page.tsx"),
    readSource("app/prices/calculatorSelection.ts"),
    readSource("app/prices/PriceCatalog.tsx"),
  ]);

  assert.match(
    contacts,
    /if \(selectedServices\) \{[\s\S]*?clearPriceCalculatorSelection\(\)/,
  );
  assert.match(
    contacts,
    /cleanUrl\.searchParams\.delete\("services"\)[\s\S]*?cleanUrl\.searchParams\.delete\("total"\)/,
  );
  assert.match(
    selection,
    /localStorage\.removeItem\(PRICE_CALCULATOR_STORAGE_KEY\)[\s\S]*?announcePriceCalculatorSelection\(\[\]\)/,
  );
  assert.match(
    catalog,
    /if \(event\.newValue === null\) \{[\s\S]*?setSelectedIds\(\[\]\)/,
  );
});

test("admin price list supports validated Excel imports without deleting other rows", async () => {
  const [page, panel, parser, route, store] = await Promise.all([
    readSource("app/admin/prices/page.tsx"),
    readSource("app/admin/prices/PriceImportPanel.tsx"),
    readSource("app/admin/prices/priceImport.ts"),
    readSource("app/api/admin/prices/import/route.ts"),
    readSource("app/api/prices/priceStore.ts"),
  ]);

  assert.match(page, /<PriceImportPanel items=\{items\} onImported=\{handleImported\}/);
  assert.match(panel, /accept="\.xlsx,\.xls,\.csv"/);
  assert.match(panel, /\/api\/admin\/prices\/import/);
  assert.match(panel, /issues\.length > 0/);
  assert.match(parser, /await import\("xlsx"\)/);
  assert.match(parser, /sheet_to_json<unknown\[\]>/);
  assert.match(parser, /const MAX_ROWS = 5000/);
  assert.match(route, /isAuthorizedAdmin\(request\)/);
  assert.match(route, /categoryLabel: categoryOption\.label/);
  assert.match(store, /ON CONFLICT\(id\) DO UPDATE SET/);
  assert.match(store, /env\.DB\.batch\(statements\.slice\(index, index \+ 50\)\)/);
  assert.doesNotMatch(
    store.slice(store.indexOf("export async function importManagedPriceItems")),
    /DELETE FROM price_items/,
  );
});

test("CITO availability is configured per study while the surcharge is calculated by group", async () => {
  const [catalog, calculatorExport, selection, parser, panel, importRoute, store, schema, migration] =
    await Promise.all([
      readSource("app/prices/PriceCatalog.tsx"),
      readSource("app/prices/calculatorExport.ts"),
      readSource("app/prices/calculatorSelection.ts"),
      readSource("app/admin/prices/priceImport.ts"),
      readSource("app/admin/prices/PriceImportPanel.tsx"),
      readSource("app/api/admin/prices/import/route.ts"),
      readSource("app/api/prices/priceStore.ts"),
      readSource("db/schema.ts"),
      readSource("drizzle/0007_fair_spirit.sql"),
    ]);

  assert.match(catalog, /const \[citoSelectedIds, setCitoSelectedIds\]/);
  assert.match(catalog, /role="switch"/);
  assert.match(catalog, /aria-checked=\{citoSelected\}/);
  assert.match(catalog, /setCitoForItem\(item\.id, !citoSelected\)/);
  assert.match(catalog, /const \[citoOnly, setCitoOnly\]/);
  assert.match(catalog, /aria-pressed=\{citoOnly\}/);
  assert.match(catalog, /!citoOnly \|\|[\s\S]*?item\.citoAvailable/);
  assert.match(catalog, /const CITO_CATEGORY_PREVIEW_COUNT = 4/);
  assert.match(catalog, /if \(isCitoOverview\)[\s\S]*?allVisibleGroups\.map/);
  assert.match(
    catalog,
    /const \[expandedPreviewCategories, setExpandedPreviewCategories\]/,
  );
  assert.match(
    catalog,
    /isExpanded[\s\S]*?\? group\.items[\s\S]*?: group\.items\.slice\(0, CITO_CATEGORY_PREVIEW_COUNT\)/,
  );
  assert.match(
    catalog,
    /if \(isInlineOverview\)[\s\S]*?setExpandedPreviewCategories[\s\S]*?return;/,
  );
  assert.match(
    catalog,
    /"Згорнути до короткого списку"[\s\S]*?"Розгорнути повний список"/,
  );
  assert.match(
    catalog,
    /setCitoOnly\(nextCitoOnly\)[\s\S]*?setCollapsedCategories\(new Set\(\)\)/,
  );
  assert.match(catalog, /Доступні CITO/);
  assert.match(catalog, /calculateCitoSurcharge\(citoSelectedCount\)/);
  assert.match(catalog, /amount: item\.amount,/);
  assert.match(catalog, /Доплата CITO \(\$\{citoSelectedCount\}/);
  assert.match(catalog, /calculator-cito-summary/);
  assert.doesNotMatch(catalog, /item\.amount \+ \(cito \? item\.citoSurcharge/);
  assert.match(calculatorExport, /calculateCitoSurcharge\(citoCount\)/);
  assert.match(calculatorExport, /Доплата CITO/);
  assert.match(selection, /PRICE_CALCULATOR_CITO_STORAGE_KEY/);
  assert.match(
    selection,
    /removeItem\(PRICE_CALCULATOR_STORAGE_KEY\)[\s\S]*?removeItem\(PRICE_CALCULATOR_CITO_STORAGE_KEY\)/,
  );
  assert.match(parser, /"citoAvailable"/);
  assert.match(parser, /"citoSurcharge"/);
  assert.match(parser, /legacyCitoSurcharge/);
  assert.doesNotMatch(parser, /для режиму CITO[\s\S]*?окрему доплату/i);
  assert.match(panel, /Доплата розраховується автоматично/);
  assert.match(panel, /citoAvailable: row\.citoAvailable/);
  assert.doesNotMatch(importRoute, /citoAvailable && citoSurcharge <= 0/);
  assert.match(store, /cito_available/);
  assert.match(store, /cito_surcharge/);
  assert.match(schema, /citoAvailable: integer\("cito_available"\)/);
  assert.match(migration, /ADD `cito_available`/);
  assert.match(migration, /ADD `cito_surcharge`/);
});

test("all-services overview expands and collapses categories inline", async () => {
  const catalog = await readSource("app/prices/PriceCatalog.tsx");

  assert.match(
    catalog,
    /const isInlineOverview =[\s\S]*?isAllOverview \|\| isCitoOverview \|\| isGroupedCategoryOverview/,
  );
  assert.match(
    catalog,
    /if \(isAllOverview\)[\s\S]*?expandedPreviewCategories\.has\(group\.category\)[\s\S]*?group\.items\.slice\(0, CATEGORY_PREVIEW_COUNT\)/,
  );
  assert.match(
    catalog,
    /if \(isInlineOverview\)[\s\S]*?setExpandedPreviewCategories[\s\S]*?return;/,
  );
  assert.match(
    catalog,
    /isInlineOverview[\s\S]*?isPreviewExpanded[\s\S]*?"Згорнути до короткого списку"[\s\S]*?"Розгорнути повний список"/,
  );
});

test("CITO categories use the group pricing tiers with legacy storage defaults", async () => {
  const [policy, officialData, parser, importRoute, store, migration, generalMigration] =
    await Promise.all([
      readSource("app/prices/citoPolicy.ts"),
      readSource("app/prices/officialPriceData.ts"),
      readSource("app/admin/prices/priceImport.ts"),
      readSource("app/api/admin/prices/import/route.ts"),
      readSource("app/api/prices/priceStore.ts"),
      readSource("drizzle/0008_enable_cito_defaults.sql"),
      readSource("drizzle/0009_enable_cito_general.sql"),
    ]);

  assert.match(policy, /DEFAULT_CITO_SURCHARGE = 100/);
  assert.match(policy, /CITO_INITIAL_GROUP_SURCHARGE = 200/);
  assert.match(policy, /CITO_ADDITIONAL_STUDY_SURCHARGE = 50/);
  assert.match(policy, /CITO_MAX_GROUP_SURCHARGE = 350/);
  assert.match(policy, /if \(count <= 2\) return CITO_INITIAL_GROUP_SURCHARGE/);
  assert.match(policy, /Math\.min\(/);
  assert.match(policy, /"general"/);
  assert.match(policy, /"biochemistry"/);
  assert.match(policy, /"hormones"/);
  assert.match(officialData, /usesDefaultCitoPolicy\(item\.category\)/);
  assert.match(officialData, /citoAvailable: true/);
  assert.match(parser, /citoAvailable \? DEFAULT_CITO_SURCHARGE : 0/);
  assert.match(importRoute, /defaultCitoEnabled \|\|[\s\S]*?payload\.citoAvailable === true/);
  assert.match(store, /default_cito_policy_version/);
  assert.match(store, /WHERE category IN \(\?, \?, \?\)/);
  assert.match(migration, /WHERE `category` IN \('biochemistry', 'hormones'\)/);
  assert.match(generalMigration, /WHERE `category` = 'general'/);
});
