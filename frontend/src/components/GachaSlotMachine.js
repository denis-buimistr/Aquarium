import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';

export default function GachaSlotMachine({ isOpen, onClose, onComplete, availableFish }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef(null);
  const spinAudioRef = useRef(null);

  useEffect(() => {
    // Create audio elements
    audioRef.current = new Audio();
    spinAudioRef.current = new Audio();
    
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (spinAudioRef.current) spinAudioRef.current.pause();
    };
  }, []);

  const playSpinSound = () => {
    if (!soundEnabled || !spinAudioRef.current) return;
    
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const playWinSound = (rarity) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different rarities
    const frequencies = {
      common: [523, 659, 784],
      rare: [659, 784, 988],
      epic: [784, 988, 1175],
      legendary: [988, 1175, 1397],
      mythical: [1175, 1397, 1568]
    };
    
    const freqs = frequencies[rarity] || frequencies.common;
    
    freqs.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
      
      osc.start(audioContext.currentTime + i * 0.1);
      osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
    });
  };

  const handleSpin = () => {
    if (spinning) return;
    
    setSpinning(true);
    setResult(null);
    playSpinSound();

    // Simulate spinning
    const spinDuration = 3000;
    const spinInterval = setInterval(() => {
      playSpinSound();
    }, 200);

    setTimeout(() => {
      clearInterval(spinInterval);
      setSpinning(false);
      
      // Get result from parent
      if (onComplete) {
        onComplete((fishResult) => {
          setResult(fishResult);
          playWinSound(fishResult.rarity);
        });
      }
    }, spinDuration);
  };

  useEffect(() => {
    if (isOpen && !result) {
      // Auto-start spin when opened
      setTimeout(() => handleSpin(), 500);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rarityColors = {
    common: '#4ADE80',
    rare: '#22D3EE',
    epic: '#A855F7',
    legendary: '#FACC15',
    mythical: '#FF003C'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
          data-testid="close-gacha-modal"
        >
          <X className="w-8 h-8" />
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute -top-12 right-12 p-2 text-white hover:text-gray-300 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        <div className="bg-gradient-to-b from-indigo-900 to-purple-900 rounded-2xl p-8 shadow-2xl border-2 border-white/20">
          <h2 className="text-4xl font-black text-center text-white mb-8">
            🎰 Открытие кейса
          </h2>

          {/* Slot Machine */}
          <div className="relative h-64 mb-8 overflow-hidden rounded-xl bg-black/40 border-4 border-yellow-500/50">
            <div
              className={`absolute inset-0 flex items-center justify-center gap-4 ${
                spinning ? 'animate-slot-spin' : ''
              }`}
            >
              {spinning ? (
                // Show random fish while spinning
                [...Array(3)].map((_, i) => {
                  const randomFish = availableFish[Math.floor(Math.random() * availableFish.length)];
                  return (
                    <div
                      key={i}
                      className="w-32 h-32 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${randomFish.color}40, ${randomFish.color}20)`,
                        border: `3px solid ${randomFish.color}80`
                      }}
                    >
                      <div
                        className="w-20 h-20 rounded-full"
                        style={{
                          background: randomFish.color,
                          boxShadow: `0 0 30px ${randomFish.color}`
                        }}
                      />
                    </div>
                  );
                })
              ) : result ? (
                // Show result
                <div
                  className="w-48 h-48 rounded-2xl flex flex-col items-center justify-center animate-bounce-in"
                  style={{
                    background: `linear-gradient(135deg, ${rarityColors[result.rarity]}40, ${rarityColors[result.rarity]}20)`,
                    border: `4px solid ${rarityColors[result.rarity]}`,
                    boxShadow: `0 0 40px ${rarityColors[result.rarity]}`
                  }}
                >
                  <div
                    className="w-24 h-24 rounded-full mb-4"
                    style={{
                      background: result.color,
                      boxShadow: `0 0 40px ${result.color}`
                    }}
                  />
                  <div className="text-white font-bold text-xl text-center">
                    {result.name}
                  </div>
                </div>
              ) : (
                <div className="text-white text-2xl">Готов к открытию!</div>
              )}
            </div>
          </div>

          {/* Result info */}
          {result && (
            <div className="text-center space-y-4">
              <div
                className="inline-block px-6 py-2 rounded-full font-bold text-lg"
                style={{
                  background: rarityColors[result.rarity],
                  color: '#000',
                  boxShadow: `0 0 20px ${rarityColors[result.rarity]}`
                }}
              >
                {result.rarity === 'common' && 'ОБЫЧНАЯ'}
                {result.rarity === 'rare' && 'РЕДКАЯ'}
                {result.rarity === 'epic' && 'ЭПИЧЕСКАЯ'}
                {result.rarity === 'legendary' && 'ЛЕГЕНДАРНАЯ'}
                {result.rarity === 'mythical' && 'МИФИЧЕСКАЯ'}
              </div>
              <div className="text-white text-3xl font-black">+{result.points} очков</div>
              <button
                onClick={onClose}
                className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-colors"
              >
                Забрать награду!
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slot-spin {
          0% { transform: translateY(0); }
          100% { transform: translateY(-300%); }
        }
        .animate-slot-spin {
          animation: slot-spin 0.2s linear infinite;
        }
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}