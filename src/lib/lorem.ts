const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
  "arcu", "bibendum", "vitae", "semper", "egestas", "pretium", "auctor", "urna",
  "nunc", "congue", "nisi", "lectus", "vestibulum", "mattis", "massa", "ultricies",
  "mi", "quis", "hendrerit", "tristique", "senectus", "netus", "fames", "turpis",
  "egestas", "integer", "eget", "aliquet", "dictum", "condimentum", "lacus",
  "suspendisse", "potenti", "nullam", "porttitor", "lacinia", "feugiat", "tellus",
  "phasellus", "faucibus", "scelerisque", "eleifend", "donec", "pretium", "vulputate",
  "sapien", "nec", "sagittis", "habitant", "morbi", "tristique", "senectus", "ac",
  "quisque", "commodo", "posuere", "convallis", "tincidunt", "augue", "interdum",
  "rutrum", "ligula", "vivamus", "tempus", "quam", "pellentesque", "habitasse",
  "platea", "dictumst", "vestibulum", "rhoncus", "aenean", "elit", "elementum",
  "facilisi", "mauris", "egestas", "ultrices", "libero", "viverra", "iaculis",
  "diam", "volutpat", "ornare", "lectus", "justo", "laoreet", "tortor", "at",
  "risus", "viverra", "adipiscing", "in", "hac", "habitasse", "platea"
];

const SENTENCES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
  "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque.",
  "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
  "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat.",
  "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.",
  "Maecenas sed diam eget risus varius blandit sit amet non magna. Nullam quis risus eget urna mollis ornare vel eu leo.",
  "Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec ullamcorper nulla non metus auctor fringilla.",
  "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean lacinia bibendum nulla sed consectetur.",
  "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.",
  "Curabitur blandit tempus porttitor. Nullam id dolor id nibh ultricies vehicula ut id elit. Morbi leo risus, porta ac consectetur ac.",
  "Vestibulum id ligula porta felis euismod semper. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.",
  "Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Etiam porta sem malesuada magna mollis euismod.",
  "Maecenas faucibus mollis interdum. Nullam quis risus eget urna mollis ornare vel eu leo. Donec id elit non mi porta gravida at eget metus.",
  "Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean lacinia bibendum nulla sed consectetur. Vivamus sagittis lacus vel augue.",
];

export type LoremMode = "paragraphs" | "words" | "bytes";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateSentence(): string {
  const count = 5 + Math.floor(Math.random() * 10);
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(pick(WORDS));
  }
  return capitalize(words.join(" ")) + ".";
}

function generateParagraph(sentenceCount?: number): string {
  const count = sentenceCount ?? (3 + Math.floor(Math.random() * 6));
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(generateSentence());
  }
  return sentences.join(" ");
}

export function generateParagraphs(count: number): string {
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    paragraphs.push(generateParagraph());
  }
  return paragraphs.join("\n\n");
}

export function generateWords(count: number): string {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(pick(WORDS));
  }
  const sentence = words.join(" ");
  return capitalize(sentence.trim()) + ".";
}

export function generateBytes(count: number): string {
  const paragraphs: string[] = [];
  let totalBytes = 0;
  while (totalBytes < count) {
    const para = generateParagraph();
    const bytes = new TextEncoder().encode(para).length;
    if (totalBytes + bytes > count && paragraphs.length > 0) {
      const remaining = count - totalBytes;
      if (remaining > 10) {
        paragraphs.push(para.slice(0, Math.ceil(remaining / 2)));
      }
      break;
    }
    paragraphs.push(para);
    totalBytes += bytes;
  }
  const result = paragraphs.join("\n\n");
  const resultBytes = new TextEncoder().encode(result).length;
  if (resultBytes > count) {
    return result.slice(0, Math.floor(count * 1.1));
  }
  return result;
}

export function generateText(mode: LoremMode, count: number): string {
  switch (mode) {
    case "paragraphs":
      return generateParagraphs(Math.max(1, Math.min(count, 20)));
    case "words":
      return generateWords(Math.max(1, Math.min(count, 9999)));
    case "bytes":
      return generateBytes(Math.max(1, Math.min(count, 100000)));
  }
}
