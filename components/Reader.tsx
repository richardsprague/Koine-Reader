import React from 'react';
import { ChapterData, ViewMode, SelectionState } from '../types';

interface ReaderProps {
  data: ChapterData;
  viewMode: ViewMode;
  onWordSelect: (selection: SelectionState) => void;
}

export const Reader: React.FC<ReaderProps> = ({ data, viewMode, onWordSelect }) => {
  
  const handleGreekWordClick = (word: string, fullVerse: string, verseNum: number) => {
    // Simple cleanup to remove punctuation for the API call, but keep visual context
    const cleanWord = word.replace(/[.,;·()\[\]]/g, '');
    if (!cleanWord.trim()) return; // Ignore clicks on just punctuation or spaces

    onWordSelect({
      word: cleanWord,
      verseContext: fullVerse,
      verseReference: `${data.book} ${data.chapter}:${verseNum}`
    });
  };

  const renderGreekText = (verseText: string, verseNum: number) => {
    // Split by spaces but preserve punctuation attached for visual rendering if desired
    // Or better: split by space, then map.
    const words = verseText.split(/\s+/);
    
    return (
      <div className="font-greek text-xl sm:text-2xl leading-loose text-ink">
        {words.map((word, idx) => (
          <span
            key={idx}
            onClick={() => handleGreekWordClick(word, verseText, verseNum)}
            className="cursor-pointer hover:bg-accent/10 hover:text-accent rounded px-0.5 transition-colors duration-150 inline-block"
          >
            {word}{' '}
          </span>
        ))}
      </div>
    );
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 pb-32 space-y-8">
      {data.verses.map((verse) => (
        <div key={verse.verse} className="relative group">
          
          {/* Verse Number Anchor */}
          <span className="absolute -left-2 sm:-left-8 top-1 text-xs font-serif text-accent/40 font-bold select-none">
            {verse.verse}
          </span>

          {/* Content based on view mode */}
          <div className="flex flex-col gap-2 sm:gap-4">
            
            {/* Greek Text */}
            {(viewMode === ViewMode.GREEK || viewMode === ViewMode.PARALLEL) && (
              <div className={viewMode === ViewMode.PARALLEL ? "pb-2 border-b border-dashed border-accent/10" : ""}>
                {renderGreekText(verse.greek, verse.verse)}
              </div>
            )}

            {/* English Text */}
            {(viewMode === ViewMode.ENGLISH || viewMode === ViewMode.PARALLEL) && (
              <div className="font-english text-lg sm:text-xl text-ink/80 leading-relaxed">
                {verse.english}
              </div>
            )}

          </div>
        </div>
      ))}
    </main>
  );
};