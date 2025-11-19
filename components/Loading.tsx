import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-6 bg-accent/10 rounded text-xs flex items-center justify-center text-accent/40 font-serif">{i}</div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-accent/10 rounded w-full"></div>
              <div className="h-4 bg-accent/10 rounded w-5/6"></div>
              <div className="h-4 bg-accent/10 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};