import type { PriceItem } from "./priceData";

export type PriceReference = {
  id: string;
  aliases: readonly string[];
};

const normalizePriceName = (value: string) =>
  value.trim().toLocaleLowerCase("uk-UA").replace(/\s+/g, " ");

export function resolvePriceItem(
  items: PriceItem[],
  reference: PriceReference,
): PriceItem | undefined {
  const itemById = items.find((item) => item.id === reference.id);
  if (itemById) return itemById;

  const aliases = new Set(reference.aliases.map(normalizePriceName));
  return items.find((item) =>
    [item.name, ...(item.aliases ?? [])]
      .map(normalizePriceName)
      .some((name) => aliases.has(name)),
  );
}

export function formatPrice(amount: number) {
  return `${new Intl.NumberFormat("uk-UA").format(amount)} ₴`;
}

export const priceReferences = {
  holter: {
    id: "official-uzd-027",
    aliases: [
      "Холтер ЕКГ",
      "Холтер ЕКГ (добове моніторування)",
      "Холтер",
    ],
  },
  echoHeart: {
    id: "official-uzd-012",
    aliases: ["ЕхоКГ", "УЗД серця", "ЕХО (УЗД) серця"],
  },
  thyroidUltrasound: {
    id: "official-uzd-004",
    aliases: ["УЗД щитоподібної залози"],
  },
  ctBrain: {
    id: "official-230-005",
    aliases: ["КТ головного мозку"],
  },
  mriBrain: {
    id: "official-258-001",
    aliases: ["МРТ головного мозку без контрасту"],
  },
  ecg: {
    id: "official-uzd-011",
    aliases: ["ЕКГ", "ЕКГ (електрокардіограма)"],
  },
  glucose: {
    id: "official-232-004",
    aliases: ["Глюкоза (венозна кров)"],
  },
  ferritin: {
    id: "official-240-004",
    aliases: ["Феритин"],
  },
  primaryConsultation: {
    id: "official-256-018",
    aliases: ["Первинна консультація", "Консультація кардіолога"],
  },
} as const satisfies Record<string, PriceReference>;
