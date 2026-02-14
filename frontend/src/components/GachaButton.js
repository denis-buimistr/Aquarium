import React from 'react';
import { Package } from 'lucide-react';

export default function GachaButton({ onOpenClick, casesRemaining }) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-1">Доступно кейсов</div>
        <div className="text-3xl font-black text-white">{casesRemaining}</div>
      </div>

      <button
        onClick={onOpenClick}
        disabled={casesRemaining <= 0}
        className="relative px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 active:scale-95 shadow-lg overflow-hidden group bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="open-case-btn"
      >
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6" />
          <span>Открыть кейс</span>
        </div>
      </button>
    </div>
  );
}
