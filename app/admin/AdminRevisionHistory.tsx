"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useModalDialog } from "../components/useModalDialog";

type ContentEntityType = "banner" | "doctor" | "service" | "location" | "price";

type ContentRevision = {
  id: string;
  entityType: ContentEntityType;
  entityId: string;
  entityLabel: string;
  action: "update" | "delete" | "restore";
  changedFields: string[];
  createdAt: number;
};

type HistoryPayload = {
  revisions?: ContentRevision[];
  error?: string;
};

const actionLabels: Record<ContentRevision["action"], string> = {
  update: "До збереження",
  delete: "Перед видаленням",
  restore: "До відновлення",
};

const fieldLabels: Record<string, string> = {
  record: "увесь запис",
  restore: "відновлення версії",
  name: "назва",
  title: "заголовок",
  shortTitle: "назва",
  specialty: "спеціальність",
  experienceYears: "досвід",
  consultationPrice: "вартість консультації",
  branch: "відділення",
  description: "опис",
  biography: "біографія",
  patientGroups: "групи пацієнтів",
  schedule: "графік",
  eyebrow: "рубрика",
  text: "текст",
  note: "перевага",
  accent: "акцент",
  action: "кнопка",
  href: "посилання",
  theme: "стиль",
  active: "видимість",
  isActive: "видимість",
  sortOrder: "порядок",
  category: "категорія",
  categoryLabel: "категорія",
  amount: "вартість",
  turnaround: "термін",
  citoAvailable: "CITO",
  aliases: "синоніми",
  city: "місто",
  type: "тип",
  address: "адреса",
  fullAddress: "повна адреса",
  landmark: "орієнтир",
  hours: "графік роботи",
  phone: "телефон",
  services: "послуги",
  coordinates: "координати",
  gallery: "галерея",
  videoUrl: "відео",
  slug: "системна назва",
  cardDescription: "опис картки",
  imagePath: "зображення",
  showOnServicesPage: "каталог послуг",
  showOnHome: "головна сторінка",
};

function formatRevisionTime(timestamp: number) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function changedFieldsLabel(fields: string[]) {
  if (!fields.length) return "Попередній стан запису";
  return fields
    .filter((field) => field !== "id" && field !== "imageKey" && field !== "photoUrl")
    .map((field) => fieldLabels[field] ?? field)
    .slice(0, 5)
    .join(", ") || "Попередній стан запису";
}

export default function AdminRevisionHistory({
  entityType,
  entityId,
  entityLabel,
  draftStorageKey,
  disabled = false,
  hasUnsavedChanges = false,
}: {
  entityType: ContentEntityType;
  entityId: string;
  entityLabel: string;
  draftStorageKey?: string;
  disabled?: boolean;
  hasUnsavedChanges?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState("");
  const [confirmingId, setConfirmingId] = useState("");
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    if (!restoringId) {
      setConfirmingId("");
      setOpen(false);
    }
  }, [restoringId]);

  useModalDialog({
    open,
    dialogRef,
    onClose: close,
    initialFocusRef: closeRef,
    restoreFocusRef: triggerRef,
  });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ entityType, entityId });
      const response = await fetch(`/api/admin/revisions?${params}`);
      const payload = await response.json() as HistoryPayload;
      if (!response.ok || !payload.revisions) {
        throw new Error(payload.error || "Не вдалося завантажити історію.");
      }
      setRevisions(payload.revisions);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не вдалося завантажити історію.");
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  const showHistory = () => {
    setOpen(true);
    void loadHistory();
  };

  const restore = async (revision: ContentRevision) => {
    setRestoringId(revision.id);
    setError("");
    try {
      const response = await fetch("/api/admin/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, revisionId: revision.id }),
      });
      const payload = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Не вдалося відновити версію.");
      }
      if (draftStorageKey) window.localStorage.removeItem(draftStorageKey);
      window.location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не вдалося відновити версію.");
      setRestoringId("");
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        className="admin-history-trigger"
        type="button"
        onClick={showHistory}
        disabled={disabled || !entityId}
      >
        Історія
      </button>

      {open ? createPortal((
        <div
          className="admin-history-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <aside
            ref={dialogRef}
            className="admin-history-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-history-title"
            tabIndex={-1}
          >
            <header className="admin-history-heading">
              <div>
                <span>Історія змін</span>
                <h2 id="admin-history-title">{entityLabel}</h2>
                <p>Зберігаємо до 20 попередніх версій тексту й налаштувань.</p>
              </div>
              <button ref={closeRef} type="button" onClick={close} aria-label="Закрити історію">
                <span aria-hidden="true">×</span>
              </button>
            </header>

            <div className="admin-history-content">
              {loading ? <div className="admin-history-state">Завантажуємо історію…</div> : null}
              {!loading && error ? (
                <div className="admin-history-state is-error" role="alert">
                  <p>{error}</p>
                  <button type="button" onClick={() => void loadHistory()}>Спробувати ще раз</button>
                </div>
              ) : null}
              {!loading && !error && revisions.length === 0 ? (
                <div className="admin-history-state">
                  <strong>Історія поки порожня</strong>
                  <p>Перша версія з’явиться після наступного збереження.</p>
                </div>
              ) : null}
              {!loading && !error && revisions.length > 0 ? (
                <ol className="admin-history-list">
                  {revisions.map((revision) => (
                    <li key={revision.id}>
                      <div className="admin-history-version">
                        <span>{actionLabels[revision.action]}</span>
                        <time dateTime={new Date(revision.createdAt).toISOString()}>
                          {formatRevisionTime(revision.createdAt)}
                        </time>
                        <p>Змінено: {changedFieldsLabel(revision.changedFields)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(revision.id)}
                        disabled={Boolean(restoringId)}
                        aria-busy={restoringId === revision.id}
                      >
                        {restoringId === revision.id ? "Відновлюємо…" : "Відновити"}
                      </button>
                      {confirmingId === revision.id ? (
                        <div className="admin-history-confirm" role="group" aria-label="Підтвердження відновлення">
                          <p>
                            Відновити цю версію? Поточний стан залишиться в історії.
                            {hasUnsavedChanges ? " Незбережені зміни буде втрачено." : ""}
                          </p>
                          <div>
                            <button type="button" onClick={() => setConfirmingId("")}>Скасувати</button>
                            <button type="button" onClick={() => void restore(revision)}>Підтвердити відновлення</button>
                          </div>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>

            <footer className="admin-history-note">
              <span aria-hidden="true">i</span>
              <p>Фотографії та завантажені зображення не змінюються під час відновлення.</p>
            </footer>
          </aside>
        </div>
      ), document.body) : null}
    </>
  );
}
