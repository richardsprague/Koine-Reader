
export enum ViewMode {
  GREEK = 'GREEK',
  ENGLISH = 'ENGLISH',
  PARALLEL = 'PARALLEL', // Stacked on mobile, side-by-side on desktop
}

export enum AppScreen {
  READER = 'READER',
  FLASHCARDS = 'FLASHCARDS',
}

export interface ScriptureVerse {
  verse: number;
  greek: string;
  english: string;
}

export interface ChapterData {
  book: string;
  chapter: number;
  verses: ScriptureVerse[];
}

export interface WordAnalysis {
  original: string;
  romanization: string;
  gloss: string; // English definition
  lemma: string; // Root word
  partOfSpeech: string;
  parsing: string; // e.g., "Accusative Singular Masculine"
}

export interface SelectionState {
  word: string;
  verseContext: string;
  verseReference: string;
}

export interface Flashcard extends WordAnalysis {
  id: string;
  userId: string;
  createdAt: number;
  verseReference: string; // Where it was saved from
}
