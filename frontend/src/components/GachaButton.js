import React, { useState } from 'react';
import { Package, Book } from 'lucide-react';

export default function GachaButton({ onOpenClick, onCollectionClick, casesRemaining }) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
      {/* Collection Button */}
      <button
        onClick={onCollectionClick}
        className="px-6 py-3 rounded-full font-bold transition-all duration-200 active:scale-95 shadow-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 border-2 border-white/20"
        data-testid="collection-btn"
      >
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5" />
          <span>Коллекция</span>
        </div>
      </button>

      {/* Cases Info and Button */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-center">
          <div className="text-xs text-gray-400">Доступно кейсов</div>
          <div className="text-2xl font-black text-white">{casesRemaining}</div>
        </div>

        <button
          onClick={onOpenClick}
          disabled={casesRemaining <= 0}
          className="px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 active:scale-95 shadow-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="open-case-btn"
        >
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <span>Открыть кейс</span>
          </div>
        </button>
      </div>
    </div>
  );
}
