import { readFileSync } from "node:fs";

const origin = "https://zdorova-rodyna-site.zdorova-rodyna.workers.dev";
const credentials = Object.fromEntries(
  readFileSync(new URL("../.admin-credentials.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("="))
    .map((line) => {
      const split = line.indexOf("=");
      return [line.slice(0, split), line.slice(split + 1)];
    }),
);

function check(condition, message) {
  if (!condition) throw new Error(message);
}

const publicResponse = await fetch(`${origin}/`, { redirect: "manual" });
check(publicResponse.status === 200, `Public page returned ${publicResponse.status}`);
check(publicResponse.headers.get("strict-transport-security")?.includes("max-age="), "HSTS missing");
check(publicResponse.headers.get("x-content-type-options") === "nosniff", "nosniff missing");
check(publicResponse.headers.get("x-frame-options") === "DENY", "Clickjacking protection missing");
check(publicResponse.headers.get("content-security-policy")?.includes("object-src 'none'"), "CSP missing");
check(publicResponse.headers.get("permissions-policy")?.includes("camera=()"), "Permissions Policy missing");

const anonymousAdmin = await fetch(`${origin}/admin`, { redirect: "manual" });
check([302, 307, 308].includes(anonymousAdmin.status), `Anonymous admin returned ${anonymousAdmin.status}`);
check(anonymousAdmin.headers.get("location")?.includes("/admin/login"), "Admin redirect missing");

const rejectedCrossSite = await fetch(`${origin}/api/admin/session`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ password: credentials.PASSWORD }),
});
check(rejectedCrossSite.status === 403, `Origin-less login returned ${rejectedCrossSite.status}`);

const login = await fetch(`${origin}/api/admin/session`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    origin,
    referer: `${origin}/admin/login`,
    "sec-fetch-site": "same-origin",
  },
  body: JSON.stringify({ password: credentials.PASSWORD }),
});
check(login.status === 200, `Valid login returned ${login.status}`);
const setCookie = login.headers.get("set-cookie") ?? "";
for (const attribute of ["__Host-zr_admin_session=", "HttpOnly", "Secure", "SameSite=Strict", "Path=/"]) {
  check(setCookie.includes(attribute), `Session cookie missing ${attribute}`);
}
const cookie = setCookie.split(";", 1)[0];

const authenticatedAdmin = await fetch(`${origin}/admin`, {
  headers: { cookie },
  redirect: "manual",
});
check(authenticatedAdmin.status === 200, `Authenticated admin returned ${authenticatedAdmin.status}`);

const logout = await fetch(`${origin}/api/admin/session`, {
  method: "DELETE",
  headers: {
    cookie,
    origin,
    referer: `${origin}/admin`,
    "sec-fetch-site": "same-origin",
  },
});
check(logout.status === 204, `Logout returned ${logout.status}`);

const revokedAdmin = await fetch(`${origin}/admin`, {
  headers: { cookie },
  redirect: "manual",
});
check([302, 307, 308].includes(revokedAdmin.status), `Revoked session returned ${revokedAdmin.status}`);

console.log("Production verification passed: public headers, CSRF rejection, login, protected admin, logout, and revocation.");
