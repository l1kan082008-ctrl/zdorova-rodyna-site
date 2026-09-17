"use client";

import { useId, useState, type ReactNode } from "react";

export function PreparationDisclosure({ number, title, lead, children }: {
  number: string; title: string; lead: string; children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  return (
    <article className={`faq-item${open ? " is-open" : ""}`}>
      <button type="button" className="faq-question" aria-expanded={open} aria-controls={contentId} onClick={() => setOpen(value => !value)}>
        <span className="faq-number">{number}</span>
        <span className="faq-question-copy"><small>{lead}</small><strong>{title}</strong></span>
        <span className="faq-toggle" aria-hidden="true" />
      </button>
      <div className="preparation-disclosure-answer" id={contentId} aria-hidden={!open} inert={!open}>
        <div><div className="preparation-faq-content">{children}</div></div>
      </div>
    </article>
  );
}
