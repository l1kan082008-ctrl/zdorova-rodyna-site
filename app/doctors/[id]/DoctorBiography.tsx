import type { ReactNode } from "react";
import styles from "./DoctorBiography.module.css";

type BiographyBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

type BiographySection = {
  title?: string;
  blocks: BiographyBlock[];
};

type DoctorBiographyProps = {
  biography: string;
  instagramUrl?: string;
};

// Only headings, list markers and balanced strong emphasis are interpreted.
// Everything else remains ordinary React text, including HTML and links.
function inlineText(text: string): ReactNode[] {
  const result: ReactNode[] = [];
  const emphasis = /\*\*([^*\n]+)\*\*/g;
  let cursor = 0;

  for (const match of text.matchAll(emphasis)) {
    const index = match.index;
    if (index > cursor) result.push(text.slice(cursor, index));
    result.push(<strong key={index}>{match[1]}</strong>);
    cursor = index + match[0].length;
  }

  if (cursor < text.length) result.push(text.slice(cursor));
  return result;
}

function parseSections(lines: string[]): BiographySection[] {
  const sections: BiographySection[] = [];
  let current: BiographySection = { blocks: [] };

  for (const line of lines) {
    const heading = /^##\s+(.+)$/.exec(line);
    if (heading) {
      if (current.blocks.length) sections.push(current);
      current = { title: heading[1], blocks: [] };
      continue;
    }

    const listItem = /^-\s+(.+)$/.exec(line);
    if (listItem) {
      const previous = current.blocks.at(-1);
      if (previous?.kind === "list") previous.items.push(listItem[1]);
      else current.blocks.push({ kind: "list", items: [listItem[1]] });
      continue;
    }

    current.blocks.push({ kind: "paragraph", text: line });
  }

  if (current.blocks.length) sections.push(current);
  return sections;
}

function BiographyContent({ blocks }: { blocks: BiographyBlock[] }) {
  return blocks.map((block, index) =>
    block.kind === "paragraph" ? (
      <p key={index}>{inlineText(block.text)}</p>
    ) : (
      <ul className={styles.facts} key={index}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>{inlineText(item)}</li>
        ))}
      </ul>
    ),
  );
}

function instagramProfile(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const handle = url.pathname.split("/").filter(Boolean)[0];
    if (
      url.protocol !== "https:" ||
      !["instagram.com", "www.instagram.com"].includes(url.hostname) ||
      !handle ||
      !/^[a-zA-Z0-9._]+$/.test(handle)
    ) return null;

    return { url: url.href, handle };
  } catch {
    return null;
  }
}

function InstagramLink({ url, handle }: { url: string; handle: string }) {
  return (
    <div className={styles.social}>
      <a
        className={`outline-button ${styles.instagram}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Instagram @${handle} — відкриється в новій вкладці`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
        Instagram @{handle}
      </a>
    </div>
  );
}

export function DoctorBiography({ biography, instagramUrl }: DoctorBiographyProps) {
  const lines = biography.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const structured = lines.some((line) => /^(?:##\s+|-\s+)\S/.test(line));
  const instagram = instagramProfile(instagramUrl);

  if (!structured) {
    return (
      <>
        {lines.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        {instagram && <InstagramLink {...instagram} />}
      </>
    );
  }

  return (
    <div className={styles.biography}>
      {parseSections(lines).map((section, index) => section.title ? (
        <section className={styles.section} key={index}>
          <h3 className={styles.heading}>{inlineText(section.title)}</h3>
          <div className={styles.content}><BiographyContent blocks={section.blocks} /></div>
        </section>
      ) : (
        <div className={styles.introduction} key={index}>
          <BiographyContent blocks={section.blocks} />
        </div>
      ))}
      {instagram && <InstagramLink {...instagram} />}
    </div>
  );
}
