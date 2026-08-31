import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookie,
  createAdminSession,
  hashAdminPassword,
  isTrustedAdminMutation,
  revokeAdminSession,
  verifyAdminPassword,
  verifyAdminSession,
} from "../lib/adminSession.ts";

class SessionDatabase {
  sessions = new Map();

  prepare(query) {
    const normalized = query.replace(/\s+/g, " ").trim();
    let values = [];
    return {
      bind: (...nextValues) => {
        values = nextValues;
        return this.prepareBound(normalized, () => values);
      },
      run: async () => ({ success: true }),
    };
  }

  prepareBound(query, values) {
    return {
      bind: (...nextValues) => this.prepareBound(query, () => nextValues),
      first: async () => {
        if (query.includes("FROM admin_sessions")) return this.sessions.get(values()[0]) ?? null;
        return null;
      },
      run: async () => {
        const bound = values();
        if (query.startsWith("INSERT INTO admin_sessions")) {
          this.sessions.set(bound[0], {
            expires_at: bound[1],
            idle_expires_at: bound[2],
            created_at: bound[3],
            last_seen_at: bound[4],
          });
        } else if (query === "DELETE FROM admin_sessions WHERE token_hash = ?") {
          this.sessions.delete(bound[0]);
        }
        return { success: true };
      },
    };
  }

  async batch(statements) {
    return Promise.all(statements.map((statement) => statement.run()));
  }
}

test("admin passwords use a salted adaptive hash", async () => {
  const password = "Test-only-long-admin-password-2026!";
  const first = await hashAdminPassword(password);
  const second = await hashAdminPassword(password);
  assert.match(first, /^pbkdf2-sha256\$100000\$/);
  assert.notEqual(first, second);
  assert.equal(await verifyAdminPassword(password, first), true);
  assert.equal(await verifyAdminPassword("not-the-password", first), false);
});

test("admin session cookie uses hardened host-only attributes", () => {
  const cookie = adminSessionCookie("test-token");
  assert.equal(ADMIN_SESSION_COOKIE, "__Host-zr_admin_session");
  assert.match(cookie, /Path=\//);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  assert.doesNotMatch(cookie, /Domain=/i);
});

test("admin mutations require a same-origin browser request", () => {
  const url = "https://example.test/api/admin/services";
  assert.equal(isTrustedAdminMutation(new Request(url)), true);
  assert.equal(isTrustedAdminMutation(new Request(url, { method: "POST" })), false);
  assert.equal(isTrustedAdminMutation(new Request(url, {
    method: "POST",
    headers: { origin: "https://evil.test", "sec-fetch-site": "cross-site" },
  })), false);
  assert.equal(isTrustedAdminMutation(new Request(url, {
    method: "POST",
    headers: { origin: "https://example.test", "sec-fetch-site": "same-origin" },
  })), true);
});

test("admin sessions are random, server-backed and revocable", async () => {
  const db = new SessionDatabase();
  const secret = "test-session-secret-that-is-long-enough-for-hmac";
  const first = await createAdminSession(secret, db);
  const second = await createAdminSession(secret, db);
  assert.notEqual(first, second);
  assert.equal(await verifyAdminSession(first, secret, db), true);
  assert.equal(await verifyAdminSession(`${first}x`, secret, db), false);
  const request = new Request("https://example.test/admin", {
    headers: { cookie: `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(first)}` },
  });
  await revokeAdminSession(request, db);
  assert.equal(await verifyAdminSession(first, secret, db), false);
});
