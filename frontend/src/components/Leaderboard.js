import React, { useState } from 'react';
import { Trophy, User, ChevronUp, ChevronDown } from 'lucide-react';

export default function Leaderboard({ leaderboard, currentUserId }) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="fixed right-4 top-4 z-20" data-testid="leaderboard-container">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-full glass-panel rounded-xl px-4 py-2 flex items-center justify-between gap-2 mb-2 hover:bg-white/10 transition-colors"
        data-testid="leaderboard-toggle"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="font-bold">Рейтинг</span>
        </div>
        {isVisible ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Leaderboard Content */}
      {isVisible && (
        <div 
          className="w-72 glass-panel rounded-xl p-4 max-h-[55vh] overflow-y-auto animate-in slide-in-from-top duration-200" 
          data-testid="leaderboard"
        >
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.user_id === currentUserId;
              const rankColors = [
                'text-yellow-400',
                'text-gray-300',
                'text-amber-600'
              ];

              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    isCurrentUser ? 'bg-blue-500/20 border border-blue-500/40' : 'bg-white/5 hover:bg-white/10'
                  }`}
                  data-testid={`leaderboard-entry-${index}`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center font-black text-lg ${
                      index < 3 ? rankColors[index] : 'text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-sm font-semibold truncate">
                      {isCurrentUser && <User className="w-3 h-3 text-blue-400" />}
                      <span className={isCurrentUser ? 'text-blue-400' : ''}>
                        {entry.email.split('@')[0]}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {entry.total_fish} рыб
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-400">
                      {entry.total_points}
                    </div>
                    <div className="text-xs text-gray-500">очков</div>
                  </div>
                </div>
              );
            })}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Пока нет данных
            </div>
          )}
        </div>
      )}
    </div>
  );
}