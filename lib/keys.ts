import { readFileSync } from "node:fs";
import { join } from "node:path";

const NUMBER_OF_PAIRS = 2;

interface Noun {
  word: string;
  gender: "m" | "f";
}
interface Adjective {
  masculine: string;
  feminine: string;
}

let _nouns: Noun[] | null = null;
let _adjectives: Adjective[] | null = null;

function ensureNouns(): Noun[] {
  if (_nouns) return _nouns;
  const text = readFileSync(join(import.meta.dir, "../data/nouns.csv"), "utf-8");
  _nouns = text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line): Noun => {
      const parts = line.split(",");
      return { word: parts[0] ?? "", gender: (parts[1] ?? "m") as "m" | "f" };
    });
  return _nouns;
}

function ensureAdjectives(): Adjective[] {
  if (_adjectives) return _adjectives;
  const text = readFileSync(join(import.meta.dir, "../data/adjectives.csv"), "utf-8");
  _adjectives = text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line): Adjective => {
      const parts = line.split(",");
      return { masculine: parts[0] ?? "", feminine: parts[1] ?? "" };
    });
  return _adjectives;
}

export function generateKey(): string {
  const nounList = ensureNouns();
  const adjList = ensureAdjectives();
  const randomValues = new Uint16Array(NUMBER_OF_PAIRS * 2);
  crypto.getRandomValues(randomValues);
  const parts: string[] = [];

  for (let i = 0; i < NUMBER_OF_PAIRS; i++) {
    const nounIndex = randomValues[i * 2]! % nounList.length;
    const adjIndex = randomValues[i * 2 + 1]! % adjList.length;
    const noun = nounList[nounIndex]!;
    const adj = adjList[adjIndex]!;
    const adjective = noun.gender === "f" ? adj.feminine : adj.masculine;
    parts.push(noun.word, adjective);
  }

  return parts.join("-");
}
