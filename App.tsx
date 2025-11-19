
import React, { useState, useEffect } from 'react';
import { INITIAL_BOOK, INITIAL_CHAPTER } from './constants';
import { ChapterData, ViewMode, SelectionState, AppScreen } from './types';
import { fetchChapter } from './services/geminiService';
import { subscribeToAuthChanges } from './services/firebase';
import { User } from 'firebase/auth';
import { Navigation } from './components/Navigation';
import { Reader } from './components/Reader';
import { Loading } from './components/Loading';
import { WordDetail } from './components/WordDetail';
import { FlashcardList } from './components/FlashcardList';

const App: React.FC = () => {
  const [currentBook, setCurrentBook] = useState(INITIAL_BOOK);
  const [currentChapter, setCurrentChapter] = useState(INITIAL_CHAPTER);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PARALLEL);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.READER);

  useEffect(() => {
    // Auth Listener using wrapper that handles both Firebase and LocalStorage
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setCurrentScreen(AppScreen.READER);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadChapter(currentBook, currentChapter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBook, currentChapter]);

  const loadChapter = async (book: string, chapter: number) => {
    setLoading(true);
    setError(null);
    setSelection(null);
    try {
      const data = await fetchChapter(book, chapter);
      setChapterData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load chapter. Please check your internet or API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookChange = (book: string) => {
    setCurrentBook(book);
    setCurrentChapter(1);
  };

  const renderContent = () => {
    if (currentScreen === AppScreen.FLASHCARDS && user) {
      return <FlashcardList user={user} />;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button 
            onClick={() => loadChapter(currentBook, currentChapter)}
            className="px-4 py-2 bg-accent text-white rounded-lg shadow-lg hover:bg-accent/90 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (loading) {
      return <Loading />;
    }

    if (chapterData) {
      return (
        <Reader 
          data={chapterData} 
          viewMode={viewMode}
          onWordSelect={setSelection}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <Navigation 
        currentBook={currentBook} 
        currentChapter={currentChapter}
        onBookChange={handleBookChange}
        onChapterChange={setCurrentChapter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isLoading={loading}
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        user={user}
      />

      {renderContent()}

      <WordDetail 
        selection={selection}
        onClose={() => setSelection(null)}
        user={user}
      />
      
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default App;
