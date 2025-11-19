
import React from 'react';
import { NEW_TESTAMENT_BOOKS } from '../constants';
import { ViewMode, AppScreen } from '../types';
import { AuthButton } from './AuthButton';
import { User } from 'firebase/auth';

interface NavigationProps {
  currentBook: string;
  currentChapter: number;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: number) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isLoading: boolean;
  currentScreen: AppScreen;
  onScreenChange: (screen: AppScreen) => void;
  user: User | null;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentBook,
  currentChapter,
  onBookChange,
  onChapterChange,
  viewMode,
  onViewModeChange,
  isLoading,
  currentScreen,
  onScreenChange,
  user
}) => {
  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur border-b border-accent/20 shadow-sm transition-all">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex flex-col gap-3">
          
          {/* Top Row: Title/Controls & Auth */}
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <button 
                   onClick={() => onScreenChange(AppScreen.READER)}
                   className={`font-greek text-lg font-bold ${currentScreen === AppScreen.READER ? 'text-accent' : 'text-ink/50 hover:text-ink'}`}
                >
                  Reader
                </button>
                {user && (
                  <>
                  <span className="text-accent/20">/</span>
                  <button 
                     onClick={() => onScreenChange(AppScreen.FLASHCARDS)}
                     className={`font-ui text-sm font-medium ${currentScreen === AppScreen.FLASHCARDS ? 'text-accent' : 'text-ink/50 hover:text-ink'}`}
                  >
                    Flashcards
                  </button>
                  </>
                )}
             </div>

             <AuthButton user={user} />
          </div>

          {/* Bottom Row: Reader Controls (Only visible in Reader mode) */}
          {currentScreen === AppScreen.READER && (
            <div className="flex items-center gap-2 justify-between overflow-x-auto no-scrollbar pt-1">
              <div className="flex items-center gap-2 bg-white border border-accent/20 rounded-lg px-3 py-1.5 shadow-sm shrink-0">
                <select 
                  value={currentBook}
                  onChange={(e) => onBookChange(e.target.value)}
                  className="bg-transparent font-ui font-semibold text-ink outline-none cursor-pointer text-sm sm:text-base max-w-[120px] sm:max-w-none"
                  disabled={isLoading}
                >
                  {NEW_TESTAMENT_BOOKS.map(book => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </select>
                <span className="text-accent/40">|</span>
                <input 
                  type="number" 
                  min={1} 
                  max={150} 
                  value={currentChapter}
                  onChange={(e) => onChapterChange(parseInt(e.target.value) || 1)}
                  className="w-10 bg-transparent font-ui font-semibold text-ink outline-none text-center text-sm sm:text-base"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center bg-white/50 rounded-lg p-1 border border-accent/10 shrink-0">
                {(Object.keys(ViewMode) as Array<keyof typeof ViewMode>).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onViewModeChange(ViewMode[mode])}
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-sm font-medium transition-all duration-200 ${
                      viewMode === ViewMode[mode]
                        ? 'bg-ink text-white shadow-md'
                        : 'text-ink/60 hover:bg-accent/5'
                    }`}
                  >
                    {mode === 'PARALLEL' ? 'BOTH' : mode}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
