const latinToUkrainianKeyboard: Record<string, string> = {
  q: "й", w: "ц", e: "у", r: "к", t: "е", y: "н", u: "г", i: "ш",
  o: "щ", p: "з", "[": "х", "]": "ї", a: "ф", s: "і", d: "в",
  f: "а", g: "п", h: "р", j: "о", k: "л", l: "д", ";": "ж",
  "'": "є", z: "я", x: "ч", c: "с", v: "м", b: "и", n: "т",
  m: "ь", ",": "б", ".": "ю",
};

const searchAliases: Record<string, string[]> = {
  uzi: ["узд"],
  mrt: ["мрт"],
  kt: ["кт"],
  ekg: ["екг"],
  ecg: ["екг"],
  holter: ["холтер"],
  cardiolog: ["кардіолог"],
  angiografia: ["ангіографія"],
  узи: ["узд", "ультразвук"],
  экг: ["екг"],
  эхокг: ["ехокг", "узд серця"],
  анализ: ["аналіз", "дослідження"],
  анализы: ["аналізи", "дослідження"],
  анализов: ["аналізів", "досліджень"],
  врач: ["лікар"],
  врачи: ["лікарі"],
  доктор: ["лікар"],
  кардиолог: ["кардіолог"],
  ангиография: ["ангіографія"],
  ангеография: ["ангіографія"],
  ангеографія: ["ангіографія"],
  ангиографія: ["ангіографія"],
  сосуды: ["судини", "судин"],
  сосудов: ["судин"],
  сердце: ["серце"],
  сердца: ["серця"],
  почки: ["нирки"],
  почек: ["нирок"],
  щитовидка: ["щитоподібна", "щитоподібної"],
  щитовидной: ["щитоподібної"],
  домой: ["додому", "вдома"],
  дома: ["вдома", "додому"],
  медсестра: ["медична сестра", "медсестри"],
  цена: ["ціна", "вартість"],
  цены: ["ціни", "вартість"],
  компьютерная: ["компютерна"],
  компьютерный: ["компютерний"],
  томография: ["томографія"],
  магнитная: ["магнітна"],
  резонансная: ["резонансна"],
};

const exactPhraseAliases: Record<string, string[]> = {
  зак: ["загальний розгорнутий аналіз крові"],
};

export const normalizeMedicalSearch = (value: string) =>
  value
    .toLocaleLowerCase("uk-UA")
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .replace(/[’'`ʼ]/g, "")
    .replace(/[–—-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value: string) =>
  normalizeMedicalSearch(value).match(/[\p{L}\p{N}]+/gu) ?? [];

const fixKeyboardLayout = (value: string) =>
  normalizeMedicalSearch(value)
    .split("")
    .map((character) => latinToUkrainianKeyboard[character] ?? character)
    .join("");

const editDistance = (first: string, second: string) => {
  const rows = first.length + 1;
  const columns = second.length + 1;
  const matrix = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) =>
      row === 0 ? column : column === 0 ? row : 0,
    ),
  );

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitution = first[row - 1] === second[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitution,
      );

      if (
        row > 1 &&
        column > 1 &&
        first[row - 1] === second[column - 2] &&
        first[row - 2] === second[column - 1]
      ) {
        matrix[row][column] = Math.min(
          matrix[row][column],
          matrix[row - 2][column - 2] + 1,
        );
      }
    }
  }

  return matrix[first.length][second.length];
};

const queryAlternatives = (word: string) => {
  const variants = new Set([word, fixKeyboardLayout(word)]);

  // Пацієнти часто пишуть назву ангіографії російською або через
  // поширену помилку «ангео-». Додаємо медичний корінь окремо, щоб пошук
  // розумів також відмінки та довші запити, а не лише точні словникові форми.
  if (/^ан(?:ге|ги|гі)ограф/u.test(word)) {
    variants.add("ангіограф");
    variants.add("ангіографія");
  }

  for (const variant of [...variants]) {
    for (const alias of searchAliases[variant] ?? []) {
      tokenize(alias).forEach((token) => variants.add(token));
    }
  }

  return [...variants].filter(Boolean);
};

const scoreWord = (
  alternatives: string[],
  searchable: string,
  searchableWords: string[],
) => {
  let bestScore = 0;

  for (const word of alternatives) {
    if (searchableWords.includes(word)) bestScore = Math.max(bestScore, 120);
    if (searchableWords.some((candidate) => candidate.startsWith(word))) {
      bestScore = Math.max(bestScore, 105);
    }
    if (word.length >= 3 && searchable.includes(word)) {
      bestScore = Math.max(bestScore, 88);
    }

    if (word.length >= 4) {
      const allowedDistance = word.length >= 8 ? 2 : 1;
      for (const candidate of searchableWords) {
        if (Math.abs(candidate.length - word.length) > allowedDistance) continue;
        const distance = editDistance(word, candidate);
        if (distance <= allowedDistance) {
          bestScore = Math.max(bestScore, 76 - distance * 12);
        }
      }
    }
  }

  return bestScore;
};

export const scoreMedicalSearch = (
  query: string,
  title: string,
  supportingText = "",
) => {
  const normalizedQuery = normalizeMedicalSearch(query);
  const words = tokenize(normalizedQuery);
  if (!words.length) return 1;

  const normalizedTitle = normalizeMedicalSearch(title);
  const searchable = normalizeMedicalSearch(`${title} ${supportingText}`);
  const searchableWords = tokenize(searchable);
  const titleWords = tokenize(normalizedTitle);
  const phraseAliases = exactPhraseAliases[normalizedQuery] ?? [];

  if (phraseAliases.length) {
    const matchedPhrase = phraseAliases.find((alias) =>
      searchable.includes(normalizeMedicalSearch(alias)),
    );

    if (!matchedPhrase) return 0;

    return normalizedTitle.includes(normalizeMedicalSearch(matchedPhrase))
      ? 600
      : 500;
  }

  let totalScore = 0;

  for (const word of words) {
    const alternatives = queryAlternatives(word);
    const wordScore = scoreWord(alternatives, searchable, searchableWords);
    if (!wordScore) return 0;
    totalScore += wordScore;
    if (alternatives.some((variant) => titleWords.includes(variant))) {
      totalScore += 28;
    }
  }

  if (searchable.includes(normalizedQuery)) totalScore += 90;
  if (normalizedTitle === normalizedQuery) totalScore += 180;
  if (normalizedTitle.startsWith(normalizedQuery)) totalScore += 110;

  return totalScore;
};
