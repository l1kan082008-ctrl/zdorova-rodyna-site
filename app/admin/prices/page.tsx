"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminNavigation from "../AdminNavigation";
import {
  categoryOptions,
  type CategoryId,
  type PriceItem,
} from "../../prices/priceData";
import { DEFAULT_CITO_SURCHARGE } from "../../prices/citoPolicy";
import PriceImportPanel from "./PriceImportPanel";
import { useAdminSafeSave } from "../useAdminSafeSave";
import AdminRevisionHistory from "../AdminRevisionHistory";

type ManagedPriceItem = PriceItem & {
  isActive: boolean;
  sortOrder: number;
};

type ApiPayload = {
  items?: ManagedPriceItem[];
  error?: string;
};

type PriceDraft = {
  item: ManagedPriceItem;
  aliases: string;
};

function formatSaveTime(timestamp: number) {
  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

const emptyItem: ManagedPriceItem = {
  id: "",
  name: "",
  category: "general",
  categoryLabel: "Загальноклінічні",
  amount: 0,
  turnaround: "Уточнюйте",
  citoAvailable: false,
  citoSurcharge: 0,
  aliases: [],
  isActive: true,
  sortOrder: 0,
};

function PriceEditor({
  item,
  onSaved,
  onDeleted,
  onRegisterGuard,
}: {
  item: ManagedPriceItem;
  onSaved: (items: ManagedPriceItem[]) => void;
  onDeleted: (items: ManagedPriceItem[]) => void;
  onRegisterGuard: (guard: (() => boolean) | null) => void;
}) {
  const [draft, setDraft] = useState(item);
  const [aliases, setAliases] = useState((item.aliases ?? []).join(", "));
  const [status, setStatus] = useState("");
  const [hasError, setHasError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const draftValue = useMemo<PriceDraft>(
    () => ({ item: draft, aliases }),
    [aliases, draft],
  );
  const baselineValue = useMemo<PriceDraft>(
    () => ({ item, aliases: (item.aliases ?? []).join(", ") }),
    [item],
  );

  async function save() {
    setSaving(true);
    setStatus("");
    setHasError(false);
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
      const savedItem = draft.id
        ? payload.items.find((candidate) => candidate.id === draft.id)
        : payload.items.find((candidate) => candidate.name === draft.name) ?? payload.items.at(-1);
      if (savedItem) {
        setDraft(savedItem);
        setAliases((savedItem.aliases ?? []).join(", "));
      }
      safeSave.clearStoredDraft();
      onSaved(payload.items);
      setStatus(draft.id ? "Зміни збережено" : "Позицію додано");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Сталася помилка");
      setHasError(true);
    } finally {
      setSaving(false);
    }
  }

  function requestSave() {
    if (formRef.current?.reportValidity() === false) return;
    return save();
  }

  const safeSave = useAdminSafeSave<PriceDraft>({
    storageKey: `admin-safe-draft:price:${item.id || "new"}`,
    value: draftValue,
    baseline: baselineValue,
    onRestore: (restored) => {
      setDraft(restored.item);
      setAliases(restored.aliases);
      setStatus("");
      setHasError(false);
    },
    onSave: requestSave,
    busy: saving || deleting,
  });

  useEffect(() => {
    onRegisterGuard(safeSave.confirmDiscard);
    return () => onRegisterGuard(null);
  }, [onRegisterGuard, safeSave.confirmDiscard]);

  const deleteItem = async () => {
    if (!draft.id || !window.confirm(`Видалити «${draft.name}»? Цю дію неможливо скасувати.`)) {
      return;
    }

    setDeleting(true);
    setStatus("");
    setHasError(false);
    try {
      const response = await fetch("/api/admin/prices", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: draft.id }),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.items) {
        throw new Error(payload.error || "Не вдалося видалити позицію");
      }
      safeSave.clearStoredDraft();
      onDeleted(payload.items);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Помилка видалення");
      setHasError(true);
    } finally {
      setDeleting(false);
    }
  };

  const saveStateLabel = saving
    ? "Зберігаємо зміни…"
    : hasError
      ? "Збереження потребує уваги"
      : safeSave.dirty
        ? "Є незбережені зміни"
        : status || "Усі зміни збережено";
  const saveStateDetail = hasError
    ? status
    : safeSave.recoveredAt
      ? `Відновлено чернетку о ${formatSaveTime(safeSave.recoveredAt)} · Ctrl+S`
      : safeSave.dirty
        ? "Чернетка зберігається у цьому браузері · Ctrl+S"
        : status || "Можна безпечно перейти до іншої позиції.";

  return (
    <form
      ref={formRef}
      id="admin-price-editor-form"
      className="admin-price-editor"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void save();
      }}
    >
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
        <label className="admin-cito-switch">
          <span>Термінове виконання CITO</span>
          <input
            type="checkbox"
            checked={draft.citoAvailable === true}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                citoAvailable: event.target.checked,
                citoSurcharge: event.target.checked
                  ? DEFAULT_CITO_SURCHARGE
                  : 0,
              }))
            }
          />
          <small>
            Увімкніть лише для доступних досліджень. Доплата розраховується
            автоматично за кількістю обраних CITO-досліджень.
          </small>
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

      <div className="admin-price-actions admin-safe-catalog-action-bar">
        <div className="admin-safe-save-summary" role="status" aria-live="polite">
          <span className={`admin-safe-save-state${hasError ? " is-error" : safeSave.dirty ? " is-dirty" : " is-saved"}`}>
            <i aria-hidden="true" />{saveStateLabel}
          </span>
          <small>{saveStateDetail}</small>
        </div>
        <div className="admin-price-action-buttons admin-safe-save-buttons">
          {draft.id ? (
            <>
              <AdminRevisionHistory
                entityType="price"
                entityId={draft.id}
                entityLabel={draft.name}
                draftStorageKey={`admin-safe-draft:price:${draft.id}`}
                disabled={saving || deleting}
                hasUnsavedChanges={safeSave.dirty}
              />
              <button
                className="admin-danger-button"
                type="button"
                onClick={deleteItem}
                disabled={saving || deleting}
              >
                {deleting ? "Видаляємо…" : "Видалити"}
              </button>
            </>
          ) : null}
          <button
            className="admin-save-button admin-safe-save-button"
            type="submit"
            disabled={!safeSave.dirty || saving || deleting}
            aria-keyshortcuts="Control+S Meta+S"
            aria-busy={saving}
          >
            {saving ? <span className="admin-button-loader" aria-hidden="true" /> : null}
            {saving ? "Зберігаємо…" : "Зберегти"}
          </button>
        </div>
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
  const editorGuardRef = useRef<(() => boolean) | null>(null);

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

  const registerEditorGuard = useCallback(
    (guard: (() => boolean) | null) => {
      editorGuardRef.current = guard;
    },
    [],
  );

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

  const handleDeleted = (updatedItems: ManagedPriceItem[]) => {
    setItems(updatedItems);
    setSelectedId(updatedItems[0]?.id ?? "new");
    setError("");
  };

  const handleImported = (updatedItems: ManagedPriceItem[]) => {
    setItems(updatedItems);
    if (
      selectedId !== "new" &&
      !updatedItems.some((item) => item.id === selectedId)
    ) {
      setSelectedId(updatedItems[0]?.id ?? "");
    }
  };

  return (
    <main className="admin-prices-page">
      <header className="admin-topbar">
        <Link href="/prices">← До прайса</Link>
        <AdminNavigation current="prices" />
      </header>

      <section className="admin-intro">
        <span className="section-kicker">Адмін-панель</span>
        <h1>Послуги та ціни</h1>
        <p>
          Додавайте дослідження, змінюйте вартість, термін виконання, режим CITO і пошукові синоніми.
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
        <>
          <PriceImportPanel items={items} onImported={handleImported} />
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
                  onClick={() => {
                    if (
                      selectedId === "new" ||
                      editorGuardRef.current?.() !== false
                    ) {
                      setSelectedId("new");
                    }
                  }}
                >
                  + Додати позицію
                </button>
              </div>
              <div className="admin-prices-scroll">
                {filteredItems.map((item) => (
                  <button
                    type="button"
                    className={item.id === selectedId ? "is-active" : undefined}
                    onClick={() => {
                      if (
                        item.id === selectedId ||
                        editorGuardRef.current?.() !== false
                      ) {
                        setSelectedId(item.id);
                      }
                    }}
                    key={item.id}
                  >
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.categoryLabel}</small>
                    </span>
                    <span>
                      <b>
                        {new Intl.NumberFormat("uk-UA").format(item.amount)} ₴
                      </b>
                      {item.citoAvailable ? (
                        <small>CITO · до 2 годин</small>
                      ) : null}
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
                onDeleted={handleDeleted}
                onRegisterGuard={registerEditorGuard}
              />
            ) : null}
          </section>
        </>
      )}
    </main>
  );
}
