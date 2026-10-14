import type { Metadata } from "next";

const homeUrl = "https://zdorovarodynaplus.com.ua/";
const title = "Здорова Родина — медичний центр у Рівному";
const description =
  "Медичний центр «Здорова Родина» у Рівному: аналізи, КТ, МРТ, УЗД, Холтер ЕКГ та консультації лікарів. Дізнайтеся ціни, підготовку та запишіться на обстеження.";
const image = {
  url: `${homeUrl}og-center-v2.jpg`,
  type: "image/jpeg",
  width: 1200,
  height: 630,
  alt: "Медичний центр «Здорова Родина» — фасад і головний вхід",
};
const imageId = `${homeUrl}#primaryimage`;

export const homeMetadata: Metadata = {
  title,
  description,
  alternates: { canonical: homeUrl },
  openGraph: {
    title,
    description,
    url: homeUrl,
    locale: "uk_UA",
    type: "website",
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [{ url: image.url, alt: image.alt }],
  },
};

export const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${homeUrl}#webpage`,
      url: homeUrl,
      name: title,
      description,
      inLanguage: "uk-UA",
      primaryImageOfPage: { "@id": imageId },
      image: { "@id": imageId },
    },
    {
      "@type": "ImageObject",
      "@id": imageId,
      url: image.url,
      contentUrl: image.url,
      width: image.width,
      height: image.height,
      encodingFormat: image.type,
      caption: image.alt,
    },
  ],
};
