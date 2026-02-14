import React from 'react';
import { Package, Book } from 'lucide-react';

export default function GachaButton({ onOpenClick, onCollectionClick, casesRemaining }) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
      {/* Cases counter */}
      <div className="text-center glass-panel px-4 py-2 rounded-full">
        <span className="text-xs text-gray-400 mr-2">Кейсов:</span>
        <span className="text-lg font-black text-white">{casesRemaining}</span>
      </div>

      {/* Buttons on same level */}
      <div className="flex items-center gap-4">
        <button
          onClick={onCollectionClick}
          className="px-6 py-4 rounded-full font-bold text-lg transition-all duration-200 active:scale-95 shadow-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] border-2 border-white/20"
          data-testid="collection-btn"
        >
          <div className="flex items-center gap-2">
            <Book className="w-6 h-6" />
            <span>Коллекция</span>
          </div>
        </button>

        <button
          onClick={onOpenClick}
          disabled={casesRemaining <= 0}
          className="px-6 py-4 rounded-full font-bold text-lg transition-all duration-200 active:scale-95 shadow-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="open-case-btn"
        >
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            <span>Открыть кейс</span>
          </div>
        </button>
      </div>
    </div>
  );
}
