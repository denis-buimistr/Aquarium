import React from 'react';
import { Star, Fish, LogOut } from 'lucide-react';

export default function UserStats({ stats, onLogout }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 glass-panel rounded-xl px-6 py-3 z-20 flex items-center gap-6" data-testid="user-stats">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400" />
        <div>
          <div className="text-xs text-gray-400">Очки</div>
          <div className="text-xl font-bold text-yellow-400" data-testid="user-points">{stats.total_points}</div>
        </div>
      </div>

      <div className="w-px h-8 bg-white/20" />

      <div className="flex items-center gap-2">
        <Fish className="w-5 h-5 text-blue-400" />
        <div>
          <div className="text-xs text-gray-400">Рыбки</div>
          <div className="text-xl font-bold text-blue-400" data-testid="user-fish-count">{stats.total_fish}</div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
        title="Выйти"
        data-testid="logout-btn"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}