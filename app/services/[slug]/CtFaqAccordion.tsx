"use client";

import { useState } from "react";
import styles from "./CtServicePage.module.css";

type Props = {
  items: readonly (readonly [question: string, answer: string])[];
};

export function CtFaqAccordion({ items }: Props) {
  const [openItem, setOpenItem] = useState<number | null>(null);

  return (
    <div className={`faq-list ${styles.compactFaq}`}>
      {items.map(([question, answer], index) => {
        const isOpen = openItem === index;
        const itemId = `ct-faq-answer-${index + 1}`;

        return (
          <article className={`faq-item${isOpen ? " is-open" : ""}`} key={question}>
            <button
              className="faq-question"
              type="button"
              aria-expanded={isOpen}
              aria-controls={itemId}
              onClick={() => setOpenItem(isOpen ? null : index)}
            >
              <span className="faq-question-copy">
                <strong>{question}</strong>
              </span>
              <span className="faq-toggle" aria-hidden="true" />
            </button>
            <div className="faq-answer" id={itemId} aria-hidden={!isOpen}>
              <div>
                <p>{answer}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
