
import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Flashcard } from '../types';
import { getFlashcards, deleteFlashcard } from '../services/firebase';

interface FlashcardListProps {
  user: User;
}

export const FlashcardList: React.FC<FlashcardListProps> = ({ user }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, [user]);

  const loadCards = async () => {
    setLoading(true);
    try {
      const data = await getFlashcards(user);
      setCards(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this card?")) return;
    try {
      await deleteFlashcard(id);
      setCards(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8 text-center text-ink/50">Loading flashcards...</div>;
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-greek text-accent mb-2">Empty</h2>
        <p className="text-ink/60">Save words from the reader to see them here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-32">
      <h2 className="text-2xl font-ui font-bold text-ink mb-6 flex items-center gap-2">
        <span className="bg-accent/10 text-accent px-3 py-1 rounded-lg text-sm">
          {cards.length}
        </span>
        Saved Words
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.id} className="bg-white p-5 rounded-xl shadow-sm border border-accent/10 hover:shadow-md transition-shadow relative group">
            <button 
              onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }}
              className="absolute top-3 right-3 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              title="Delete card"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <div className="mb-3">
              <h3 className="font-greek text-2xl text-ink mb-1">{card.original}</h3>
              {card.romanization && (
                <p className="text-sm font-serif italic text-ink/60">{card.romanization}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="bg-paper p-2 rounded border border-accent/5">
                <span className="text-xs uppercase tracking-wider text-ink/40 block mb-0.5">Gloss</span>
                <p className="text-ink font-medium">{card.gloss}</p>
              </div>
              
              <div className="flex items-center justify-between text-xs text-ink/50 pt-2 border-t border-accent/5">
                <span className="font-greek">{card.lemma}</span>
                <span className="italic">{card.partOfSpeech}</span>
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-dashed border-accent/10 text-[10px] text-ink/30 text-right truncate">
              Ref: {card.verseReference}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
