export type BookingDetails = {
  location: string;
  studies: string[];
  total: string;
  comment: string;
};

const locationPrefix = "Бажане відділення: ";
const locationHeading = "Бажане відділення:\n";
const locationHelp = "Допоможіть обрати відділення.";
const studiesPrefix = "Обрані дослідження:";
const totalPattern = /^Орієнтовна сума: (-?[\d\s.,]+ ₴)\.$/u;
const commentHeading = "Коментар:\n";

/** Keep exact study boundaries in the existing text field, without a storage migration. */
export function formatBookingComment(input: {
  locationComment: string;
  studies: string;
  total: string;
  comment: string;
}) {
  const studies = input.studies.split(" | ")
    .map((study) => study.replace(/[\r\n]+/gu, " ").trim()).filter(Boolean);
  return [
    input.locationComment.startsWith(locationPrefix)
      ? `${locationHeading}${input.locationComment.slice(locationPrefix.length)}` : input.locationComment,
    studies.length ? `${studiesPrefix}\n${studies.map((study) => `• ${study}`).join("\n")}` : "",
    input.total && Number.isFinite(Number(input.total))
      ? `Орієнтовна сума: ${Number(input.total).toLocaleString("uk-UA")} ₴.` : "",
    input.comment.trim() ? `${commentHeading}${input.comment.trim()}` : "",
  ].filter(Boolean).join("\n\n");
}

function locationValue(value: string) {
  return value.startsWith(locationPrefix)
    ? value.slice(locationPrefix.length).replace(/\.$/u, "") : value;
}

// Older bookings lost the original " | " delimiter. Only separate top-level
// list commas; clinical commas inside parentheses or before lowercase text stay.
function splitLegacyStudies(value: string) {
  const studies: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if ("([{«".includes(character)) depth += 1;
    else if (")]}»".includes(character)) depth = Math.max(0, depth - 1);
    else if (character === "," && depth === 0 && /^\s+[\p{Lu}\d]/u.test(value.slice(index + 1))) {
      studies.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  studies.push(value.slice(start).trim());
  return studies.filter(Boolean);
}

/** Read new multiline bookings and old flattened comments without rewriting records. */
export function parseBookingDetails(comment: string): BookingDetails {
  const text = comment.replace(/\r\n?/gu, "\n").trim();
  const details: BookingDetails = { location: "", studies: [], total: "", comment: "" };
  if (!text) return details;

  const commentIndex = text.indexOf(`\n\n${commentHeading}`);
  const structured = text.startsWith(locationHeading) || text.startsWith(commentHeading) || commentIndex >= 0
    || text.includes(`${studiesPrefix}\n• `)
    || /^(?:Бажане відділення: |Допоможіть обрати відділення\.).*\n\n/u.test(text);
  if (structured) {
    if (text.startsWith(commentHeading)) return { ...details, comment: text.slice(commentHeading.length) };
    const body = commentIndex < 0 ? text : text.slice(0, commentIndex);
    const remaining: string[] = [];
    for (const block of body.split("\n\n")) {
      if (!details.location && block.startsWith(locationHeading)) {
        details.location = block.slice(locationHeading.length).replace(/\.$/u, "");
      } else if (!details.location && (block.startsWith(locationPrefix) || block === locationHelp)) {
        details.location = locationValue(block);
      } else if (!details.studies.length && block.startsWith(`${studiesPrefix}\n• `)
        && block.slice(studiesPrefix.length + 1).split("\n").every((line) => line.startsWith("• "))) {
        details.studies = block.slice(studiesPrefix.length + 1).split("\n").map((line) => line.slice(2));
      } else if (!details.total && totalPattern.test(block)) {
        details.total = block.match(totalPattern)![1];
      } else {
        remaining.push(block);
      }
    }
    if (commentIndex >= 0) remaining.push(text.slice(commentIndex + 2 + commentHeading.length));
    details.comment = remaining.filter(Boolean).join("\n\n");
    return details;
  }

  let remainder = text;
  if (remainder.startsWith(locationHelp)) {
    details.location = locationHelp;
    remainder = remainder.slice(locationHelp.length).trim();
  } else if (remainder.startsWith(locationPrefix)) {
    // The next generated heading is an unambiguous end to an old address.
    const boundary = remainder.search(/\. (?=Обрані дослідження:|Орієнтовна сума:)/u);
    if (boundary >= 0) {
      details.location = locationValue(remainder.slice(0, boundary));
      remainder = remainder.slice(boundary + 2);
    }
  }
  if (remainder.startsWith(`${studiesPrefix} `)) {
    const total = /\. Орієнтовна сума: (-?[\d\s.,]+ ₴)\.(?:\s|$)/u.exec(remainder);
    if (total) {
      details.studies = splitLegacyStudies(remainder.slice(studiesPrefix.length, total.index).trim());
      details.total = total[1];
      remainder = remainder.slice(total.index + total[0].length).trim();
    }
    // Without a total marker, the old list and patient comment cannot be
    // reliably separated. Preserve that text together instead of guessing.
  } else {
    const total = /^Орієнтовна сума: (-?[\d\s.,]+ ₴)\.(?:\s|$)/u.exec(remainder);
    if (total) {
      details.total = total[1];
      remainder = remainder.slice(total[0].length).trim();
    }
  }
  details.comment = remainder;
  return details;
}
