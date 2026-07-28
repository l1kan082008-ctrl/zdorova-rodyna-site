"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  categoryOptions,
  type CategoryId,
  type PriceItem,
} from "../../prices/priceData";

type ManagedPriceItem = PriceItem & {
  isActive: boolean;
  sortOrder: number;
};

type ApiPayload = {
  items?: ManagedPriceItem[];
  error?: string;
};

const emptyItem: ManagedPriceItem = {
  id: "",
  name: "",
  category: "general",
  categoryLabel: "Загальноклінічні",
  amount: 0,
  turnaround: "Уточнюйте",
  aliases: [],
  isActive: true,
  sortOrder: 0,
};

function PriceEditor({
  item,
  onSaved,
}: {
  item: ManagedPriceItem;
  onSaved: (items: ManagedPriceItem[]) => void;
}) {
  const [draft, setDraft] = useState(item);
  const [aliases, setAliases] = useState((item.aliases ?? []).join(", "));
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/prices", {
        method: draft.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...draft,
          aliases: aliases.split(","),
        }),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.items) {
        throw new Error(payload.error || "Не вдалося зберегти позицію");
      }
      onSaved(payload.items);
      setStatus(draft.id ? "Зміни збережено" : "Позицію додано");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Сталася помилка");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-price-editor" onSubmit={save}>
      <div className="admin-price-editor-heading">
        <div>
          <span>{draft.id ? "Редагування" : "Нова позиція"}</span>
          <h2>{draft.name || "Додати дослідження"}</h2>
        </div>
        <label className="admin-active-switch">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                isActive: event.target.checked,
              }))
            }
          />
          <span>{draft.isActive ? "Опубліковано" : "Приховано"}</span>
        </label>
      </div>

      <label>
        Назва послуги або дослідження
        <input
          value={draft.name}
          onChange={(event) =>
            setDraft((current) => ({ ...current, name: event.target.value }))
          }
          required
        />
      </label>

      <div className="admin-price-form-grid">
        <label>
          Категорія
          <select
            value={draft.category}
            onChange={(event) => {
              const category = event.target.value as CategoryId;
              const label =
                categoryOptions.find((option) => option.id === category)
                  ?.label ?? "";
              setDraft((current) => ({
                ...current,
                category,
                categoryLabel: label,
              }));
            }}
          >
            {categoryOptions.map((category) => (
              <option value={category.id} key={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Вартість, ₴
          <input
            type="number"
            min="0"
            step="1"
            value={draft.amount}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                amount: Number(event.target.value),
              }))
            }
            required
          />
        </label>
        <label>
          Термін виконання
          <input
            value={draft.turnaround ?? ""}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                turnaround: event.target.value,
              }))
            }
            placeholder="Наприклад: 1–2 робочі дні"
            required
          />
        </label>
        <label>
          Порядок
          <input
            type="number"
            min="0"
            step="1"
            value={draft.sortOrder}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                sortOrder: Number(event.target.value),
              }))
            }
          />
        </label>
      </div>

      <label>
        Інші назви для пошуку
        <input
          value={aliases}
          onChange={(event) => setAliases(event.target.value)}
          placeholder="Наприклад: ОАК, ЗАК, загальний аналіз крові"
        />
        <small>Вводьте синоніми через кому — пацієнт зможе знайти послугу за кожним із них.</small>
      </label>

      <div className="admin-price-actions">
        <p role="status">{status}</p>
        <button className="book-button" type="submit" disabled={saving}>
          {saving ? "Зберігаємо…" : "Зберегти"}
          <span>→</span>
        </button>
      </div>
    </form>
  );
}

export default function PricesAdminPage() {
  const [items, setItems] = useState<ManagedPriceItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/prices")
      .then(async (response) => {
        const payload = (await response.json()) as ApiPayload;
        if (!response.ok || !payload.items) {
          throw new Error(payload.error || "Не вдалося відкрити прайс");
        }
        setItems(payload.items);
        setSelectedId(payload.items[0]?.id ?? "");
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Сталася помилка"),
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("uk-UA");
    if (!normalized) return items;
    return items.filter((item) =>
      `${item.name} ${item.categoryLabel} ${(item.aliases ?? []).join(" ")}`
        .toLocaleLowerCase("uk-UA")
        .includes(normalized),
    );
  }, [items, query]);

  const selectedItem =
    selectedId === "new"
      ? emptyItem
      : items.find((item) => item.id === selectedId);

  const handleSaved = (updatedItems: ManagedPriceItem[]) => {
    const previousName = selectedItem?.name;
    setItems(updatedItems);
    if (selectedId === "new") {
      const created =
        updatedItems.find((item) => item.name === previousName) ??
        updatedItems.at(-1);
      setSelectedId(created?.id ?? "");
    }
  };

  return (
    <main className="admin-prices-page">
      <header className="admin-topbar">
        <Link href="/prices">← До прайса</Link>
        <nav aria-label="Адміністративні розділи">
          <Link href="/admin/doctors">Лікарі</Link>
          <Link href="/admin/bookings">Заявки</Link>
          <strong>Прайс</strong>
        </nav>
      </header>

      <section className="admin-intro">
        <span className="section-kicker">Адмін-панель</span>
        <h1>Послуги та ціни</h1>
        <p>
          Додавайте дослідження, змінюйте вартість, термін виконання і пошукові синоніми.
          Приховані позиції залишаються в адмінці, але не показуються пацієнтам.
        </p>
      </section>

      {loading ? (
        <div className="admin-state">Завантажуємо прайс…</div>
      ) : error ? (
        <div className="admin-state admin-error">
          <h2>Не вдалося відкрити прайс</h2>
          <p>{error}</p>
        </div>
      ) : (
        <section className="admin-prices-layout">
          <aside className="admin-prices-list">
            <div className="admin-prices-list-tools">
              <label>
                <span>Знайти позицію</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Назва, категорія або синонім"
                />
              </label>
              <button
                className="outline-button"
                type="button"
                onClick={() => setSelectedId("new")}
              >
                + Додати позицію
              </button>
            </div>
            <div className="admin-prices-scroll">
              {filteredItems.map((item) => (
                <button
                  type="button"
                  className={item.id === selectedId ? "is-active" : undefined}
                  onClick={() => setSelectedId(item.id)}
                  key={item.id}
                >
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.categoryLabel}</small>
                  </span>
                  <span>
                    <b>{new Intl.NumberFormat("uk-UA").format(item.amount)} ₴</b>
                    {!item.isActive ? <small>Приховано</small> : null}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          {selectedItem ? (
            <PriceEditor
              key={selectedItem.id || "new"}
              item={selectedItem}
              onSaved={handleSaved}
            />
          ) : null}
        </section>
      )}
    </main>
  );
}
