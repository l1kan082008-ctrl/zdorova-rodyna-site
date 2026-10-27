import type { AdminTheme } from "./adminTheme";
import styles from "./AdminShell.module.css";

export function AdminThemeToggle({ theme, onToggle }: { theme: AdminTheme; onToggle: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={theme === "dark"} aria-label="Темна тема" className={`admin-ui-button ${styles.themeToggle}`} data-variant="secondary" onClick={onToggle}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.7 13A8.7 8.7 0 0 1 11 3.3 8.8 8.8 0 1 0 20.7 13Z" />
      </svg>
      <span>Темна тема</span>
      <span className={styles.themeTrack} aria-hidden="true"><span /></span>
    </button>
  );
}
