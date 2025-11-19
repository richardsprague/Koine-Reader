
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ChapterData, WordAnalysis } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchChapter = async (book: string, chapter: number): Promise<ChapterData> => {
  const ai = getClient();
  const prompt = `Provide the full text of ${book} Chapter ${chapter} in the original Koine Greek (Textus Receptus or Nestle-Aland style) and the King James Version (KJV) English. 
  Ensure verse numbers match perfectly. Return a JSON object containing the book, chapter, and an array of verses.`;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      book: { type: Type.STRING },
      chapter: { type: Type.INTEGER },
      verses: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            verse: { type: Type.INTEGER },
            greek: { type: Type.STRING, description: "The Greek text of the verse" },
            english: { type: Type.STRING, description: "The English KJV text of the verse" }
          },
          required: ["verse", "greek", "english"]
        }
      }
    },
    required: ["book", "chapter", "verses"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        systemInstruction: "You are a precise biblical scholar database. Provide accurate Greek and English texts."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");
    return JSON.parse(text) as ChapterData;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    throw error;
  }
};

export const analyzeGreekWord = async (word: string, contextVerse: string): Promise<WordAnalysis> => {
  const ai = getClient();
  const prompt = `Analyze the Greek word "${word}" as it appears in this verse context: "${contextVerse}".
  Provide the Romanization (transliteration), English gloss (brief definition), the lemma (lexical form), the part of speech, and the morphological parsing (case, gender, number, tense, voice, mood, etc).`;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      original: { type: Type.STRING },
      romanization: { type: Type.STRING, description: "Romanized transliteration of the word" },
      gloss: { type: Type.STRING },
      lemma: { type: Type.STRING },
      partOfSpeech: { type: Type.STRING },
      parsing: { type: Type.STRING }
    },
    required: ["original", "romanization", "gloss", "lemma", "partOfSpeech", "parsing"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        systemInstruction: "You are an expert ancient Greek linguist."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis returned");
    return JSON.parse(text) as WordAnalysis;
  } catch (error) {
    console.error("Error analyzing word:", error);
    throw error;
  }
};
