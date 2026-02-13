import React from 'react';
import { X } from 'lucide-react';

export default function FishSidebar({ fish, isOpen, onClose }) {
  if (!isOpen || !fish) return null;

  const rarityClasses = {
    common: 'text-common border-common bg-common',
    rare: 'text-rare border-rare bg-rare',
    epic: 'text-epic border-epic bg-epic',
    legendary: 'text-legendary border-legendary bg-legendary',
    mythical: 'text-mythical border-mythical bg-mythical'
  };

  const rarityNames = {
    common: 'Обычная',
    rare: 'Редкая',
    epic: 'Эпическая',
    legendary: 'Легендарная',
    mythical: 'Мифическая'
  };

  return (
    <div
      className={`fixed left-4 top-4 bottom-4 w-80 glass-panel rounded-2xl p-6 z-20 transform transition-transform duration-300 overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-[400px]'
      }`}
      data-testid="fish-sidebar"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
        data-testid="close-sidebar-btn"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="space-y-4">
        <div
          className="w-full h-48 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${fish.color}20, ${fish.color}40)`,
            boxShadow: `0 0 30px ${fish.color}40`
          }}
        >
          <div
            className="w-24 h-24 rounded-full"
            style={{
              background: fish.color,
              boxShadow: `0 0 40px ${fish.color}`
            }}
          />
        </div>

        <div>
          <h2 className="text-3xl font-black text-white drop-shadow-md" data-testid="fish-name">
            {fish.name}
          </h2>
          <p className="text-sm text-gray-400 italic">{fish.species}</p>
        </div>

        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-lg ${
            rarityClasses[fish.rarity]
          }`}
          data-testid="fish-rarity-badge"
        >
          {rarityNames[fish.rarity]}
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
              Описание
            </h3>
            <p className="text-sm text-gray-300">{fish.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
              Место обитания
            </h3>
            <p className="text-sm text-gray-300">{fish.habitat}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
              Питание
            </h3>
            <p className="text-sm text-gray-300">{fish.diet}</p>
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Очки
              </span>
              <span className={`text-2xl font-black ${rarityClasses[fish.rarity].split(' ')[0]}`}>
                {fish.points}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}