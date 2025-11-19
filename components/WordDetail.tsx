
import React, { useEffect, useState } from 'react';
import { WordAnalysis, SelectionState } from '../types';
import { analyzeGreekWord } from '../services/geminiService';
import { User } from 'firebase/auth';
import { saveFlashcard, loginWithGoogle } from '../services/firebase';

interface WordDetailProps {
  selection: SelectionState | null;
  onClose: () => void;
  user: User | null;
}

export const WordDetail: React.FC<WordDetailProps> = ({ selection, onClose, user }) => {
  const [analysis, setAnalysis] = useState<WordAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (selection) {
      setLoading(true);
      setAnalysis(null);
      setSaved(false);
      analyzeGreekWord(selection.word, selection.verseContext)
        .then(setAnalysis)
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [selection]);

  const handleSave = async () => {
    if (!user) {
      loginWithGoogle(); // Prompt login if trying to save
      return;
    }
    if (!analysis || !selection) return;

    setSaving(true);
    try {
      await saveFlashcard(user, analysis, selection.verseReference);
      setSaved(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!selection) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity" 
        onClick={onClose}
      />

      {/* Card */}
      <div className="w-full max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl pointer-events-auto transform transition-transform duration-300 ease-out border border-accent/10 p-6 max-h-[80vh] overflow-y-auto animate-slide-up m-0 sm:m-4 flex flex-col">
        
        <div className="flex justify-between items-start mb-4 border-b border-accent/10 pb-2">
          <div>
             <h2 className="font-greek text-4xl text-accent mb-1">{selection.word.replace(/[.,;·]/g, '')}</h2>
             
             {analysis?.romanization ? (
               <p className="text-lg text-ink/70 font-serif italic mb-1">{analysis.romanization}</p>
             ) : loading ? (
               <div className="h-6 w-24 bg-gray-100 rounded animate-pulse mb-1"></div>
             ) : null}

             <p className="text-xs text-ink/50 uppercase tracking-wider font-semibold">Selected Word</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-4 py-4">
              <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded w-full animate-pulse"></div>
            </div>
          ) : analysis ? (
            <div className="space-y-4 font-ui">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-paper p-3 rounded-lg border border-accent/10">
                  <span className="block text-xs text-ink/50 uppercase tracking-wider mb-1">Lemma</span>
                  <span className="font-greek text-xl text-ink">{analysis.lemma}</span>
                </div>
                <div className="bg-paper p-3 rounded-lg border border-accent/10">
                  <span className="block text-xs text-ink/50 uppercase tracking-wider mb-1">Gloss</span>
                  <span className="font-medium text-lg text-ink">{analysis.gloss}</span>
                </div>
              </div>

              <div>
                 <span className="block text-xs text-ink/50 uppercase tracking-wider mb-1">Part of Speech</span>
                 <div className="inline-block px-3 py-1 bg-accent/5 text-accent rounded-full text-sm font-medium border border-accent/10">
                   {analysis.partOfSpeech}
                 </div>
              </div>

              <div>
                <span className="block text-xs text-ink/50 uppercase tracking-wider mb-1">Morphology</span>
                <p className="text-ink leading-relaxed border-l-2 border-accent pl-3 text-sm sm:text-base">
                  {analysis.parsing}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-4">Failed to analyze word.</div>
          )}

          <div className="mt-6 pt-4 border-t border-accent/10">
             <p className="text-xs text-ink/40 text-center italic">
               Context: {selection.verseReference}
             </p>
          </div>
        </div>

        {/* Footer Actions */}
        {analysis && (
          <div className="mt-6 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                saved 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-accent text-white hover:bg-accent/90 shadow-lg hover:shadow-xl transform active:scale-95'
              }`}
            >
              {saved ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved to Flashcards
                </>
              ) : saving ? (
                 "Saving..."
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {user ? "Save to Flashcards" : "Login to Save"}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
