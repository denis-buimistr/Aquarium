import React, { useState } from 'react';
import { Package, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function GachaButton({ onFishUnlocked, casesRemaining, onCaseUsed }) {
  const [isOpening, setIsOpening] = useState(false);

  const openCase = async () => {
    if (casesRemaining <= 0) {
      toast.error('Нет доступных кейсов! Возвращайтесь завтра.');
      return;
    }

    setIsOpening(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/gacha/open`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const { fish, is_new, total_points } = response.data;

      setTimeout(() => {
        setIsOpening(false);
        
        if (is_new) {
          toast.success(
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <div className="font-bold">Новая рыбка!</div>
                <div className="text-sm">{fish.name} (+{fish.points} очков)</div>
              </div>
            </div>,
            { duration: 4000 }
          );
        } else {
          toast.info(
            <div>
              <div className="font-bold">Дубликат</div>
              <div className="text-sm">{fish.name} (уже в коллекции)</div>
            </div>,
            { duration: 3000 }
          );
        }

        onFishUnlocked(fish, is_new, total_points);
        onCaseUsed();
      }, 2000);
    } catch (error) {
      setIsOpening(false);
      console.error('Error opening case:', error);
      toast.error(error.response?.data?.detail || 'Ошибка при открытии кейса');
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-1">Доступно кейсов</div>
        <div className="text-3xl font-black text-white">{casesRemaining}</div>
      </div>

      <button
        onClick={openCase}
        disabled={isOpening || casesRemaining <= 0}
        className={`relative px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 active:scale-95 shadow-lg overflow-hidden group ${
          isOpening
            ? 'animate-shake bg-gradient-to-r from-violet-600 to-indigo-600'
            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]'
        } border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed`}
        data-testid="open-case-btn"
      >
        <div className="flex items-center gap-3">
          <Package className={`w-6 h-6 ${isOpening ? 'animate-spin' : ''}`} />
          <span>{isOpening ? 'Открываем...' : 'Открыть кейс'}</span>
        </div>
      </button>
    </div>
  );
}