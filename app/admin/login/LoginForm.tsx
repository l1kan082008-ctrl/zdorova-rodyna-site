"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "./login.module.css";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        setError(data?.error ?? "Не вдалося виконати вхід.");
        return;
      }

      const requested = searchParams.get("next");
      const destination = requested?.startsWith("/admin/") ? requested : "/admin/doctors";
      window.location.assign(destination);
    } catch {
      setError("Не вдалося перевірити пароль. Спробуйте ще раз.");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.mark}>ЗР</div>
        <p className={styles.eyebrow}>Захищений доступ</p>
        <h1 className={styles.title}>Вхід в адмінпанель</h1>
        <p className={styles.description}>Введіть пароль адміністратора, щоб керувати сайтом.</p>
        <form onSubmit={submit}>
          <label className={styles.label} htmlFor="admin-password">Пароль</label>
          <input
            autoComplete="current-password"
            autoFocus
            className={styles.input}
            id="admin-password"
            maxLength={256}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <p className={styles.error} role="alert">{error}</p>
          <button className={styles.submit} disabled={pending} type="submit">
            {pending ? "Перевіряємо…" : "Увійти"}
          </button>
        </form>
        <Link className={styles.back} href="/">← Повернутися на сайт</Link>
      </section>
    </main>
  );
}
