"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type StoredAdminDraft<T> = {
  version: 1;
  baseline: string;
  value: T;
  updatedAt: number;
};

type AdminSafeSaveOptions<T> = {
  storageKey: string | null;
  value: T | null;
  baseline: T | null;
  onRestore: (value: T) => void;
  onSave: () => void | Promise<void>;
  busy?: boolean;
  leaveMessage?: string;
};

const serialize = (value: unknown) => JSON.stringify(value ?? null);

export function useAdminSafeSave<T>({
  storageKey,
  value,
  baseline,
  onRestore,
  onSave,
  busy = false,
  leaveMessage = "Є незбережені зміни. Вийти без збереження?",
}: AdminSafeSaveOptions<T>) {
  const valueSerialized = useMemo(() => serialize(value), [value]);
  const baselineSerialized = useMemo(() => serialize(baseline), [baseline]);
  const dirty = Boolean(
    storageKey && value && baseline && valueSerialized !== baselineSerialized,
  );
  const [recoveredAt, setRecoveredAt] = useState<number | null>(null);
  const activeKeyRef = useRef<string | null>(null);
  const readySignatureRef = useRef("");
  const restoringRef = useRef(false);
  const onRestoreRef = useRef(onRestore);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onRestoreRef.current = onRestore;
  }, [onRestore]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const clearStoredDraft = useCallback(() => {
    if (!storageKey) return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // The form remains usable when browser storage is unavailable.
    }
    setRecoveredAt(null);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || !value || !baseline) {
      readySignatureRef.current = "";
      return;
    }

    if (activeKeyRef.current !== storageKey) {
      activeKeyRef.current = storageKey;
      setRecoveredAt(null);
    }

    const signature = `${storageKey}:${baselineSerialized}`;
    if (readySignatureRef.current === signature) return;
    readySignatureRef.current = signature;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const stored = JSON.parse(raw) as StoredAdminDraft<T>;
      if (
        stored.version !== 1 ||
        stored.baseline !== baselineSerialized ||
        serialize(stored.value) === baselineSerialized
      ) {
        window.localStorage.removeItem(storageKey);
        return;
      }
      restoringRef.current = true;
      onRestoreRef.current(stored.value);
      setRecoveredAt(stored.updatedAt);
    } catch {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Storage can be unavailable in strict privacy modes.
      }
    }
  }, [baseline, baselineSerialized, storageKey, value]);

  useEffect(() => {
    if (!storageKey || !value || !baseline) return;
    const signature = `${storageKey}:${baselineSerialized}`;
    if (readySignatureRef.current !== signature) return;

    if (restoringRef.current) {
      restoringRef.current = false;
      return;
    }

    if (!dirty) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // The saved server value is still the source of truth.
      }
      setRecoveredAt(null);
      return;
    }

    const timer = window.setTimeout(() => {
      const stored: StoredAdminDraft<T> = {
        version: 1,
        baseline: baselineSerialized,
        value,
        updatedAt: Date.now(),
      };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(stored));
      } catch {
        // Storage restrictions must not block manual saving.
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [baseline, baselineSerialized, dirty, storageKey, value]);

  useEffect(() => {
    if (!dirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const protectNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.href === window.location.href
      ) {
        return;
      }

      if (!window.confirm(leaveMessage)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      clearStoredDraft();
    };

    document.addEventListener("click", protectNavigation, true);
    return () => document.removeEventListener("click", protectNavigation, true);
  }, [clearStoredDraft, dirty, leaveMessage]);

  useEffect(() => {
    const saveWithKeyboard = (event: KeyboardEvent) => {
      if (
        !dirty ||
        busy ||
        !(event.ctrlKey || event.metaKey) ||
        event.key.toLocaleLowerCase() !== "s"
      ) {
        return;
      }
      event.preventDefault();
      void onSaveRef.current();
    };

    window.addEventListener("keydown", saveWithKeyboard);
    return () => window.removeEventListener("keydown", saveWithKeyboard);
  }, [busy, dirty]);

  const confirmDiscard = useCallback(() => {
    if (!dirty) return true;
    if (!window.confirm(leaveMessage)) return false;
    clearStoredDraft();
    return true;
  }, [clearStoredDraft, dirty, leaveMessage]);

  return {
    dirty,
    recoveredAt,
    clearStoredDraft,
    confirmDiscard,
  };
}
