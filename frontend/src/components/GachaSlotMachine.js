import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';

export default function GachaSlotMachine({ isOpen, onClose, onComplete, availableFish }) {
  const [spinning, setSpinning] = useState(false);
  const [slowingDown, setSlowingDown] = useState(false);
  const [result, setResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [displayedFish, setDisplayedFish] = useState([]);
  const spinIntervalRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const playSpinSound = (pitch = 800) => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.value = pitch;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.08);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.08);
  };

  const playWinSound = (rarity) => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const frequencies = {
      common: [523, 659, 784],
      rare: [659, 784, 988],
      epic: [784, 988, 1175],
      legendary: [988, 1175, 1397, 1568],
      mythical: [1175, 1397, 1568, 1760, 1976]
    };
    
    const freqs = frequencies[rarity] || frequencies.common;
    
    freqs.forEach((freq, i) => {
      setTimeout(() => {
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        
        osc.frequency.value = freq;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.25, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.4);
        
        osc.start(audioContextRef.current.currentTime);
        osc.stop(audioContextRef.current.currentTime + 0.4);
      }, i * 150);
    });
  };

  const getRandomFish = () => {
    return availableFish[Math.floor(Math.random() * availableFish.length)];
  };

  const handleSpin = () => {
    if (spinning) return;
    
    setSpinning(true);
    setSlowingDown(false);
    setResult(null);
    
    // Initial fast spinning
    let spinSpeed = 80;
    let pitchCounter = 0;
    
    const updateDisplay = () => {
      setDisplayedFish([getRandomFish(), getRandomFish(), getRandomFish()]);
      playSpinSound(800 + (pitchCounter % 5) * 50);
      pitchCounter++;
    };
    
    updateDisplay();
    spinIntervalRef.current = setInterval(updateDisplay, spinSpeed);

    // Phase 1: Fast spin (2 seconds)
    setTimeout(() => {
      clearInterval(spinIntervalRef.current);
      spinSpeed = 120;
      spinIntervalRef.current = setInterval(updateDisplay, spinSpeed);
    }, 2000);

    // Phase 2: Slowing down (2 seconds)
    setTimeout(() => {
      setSlowingDown(true);
      clearInterval(spinIntervalRef.current);
      spinSpeed = 200;
      spinIntervalRef.current = setInterval(updateDisplay, spinSpeed);
    }, 4000);

    // Phase 3: Very slow (1.5 seconds)
    setTimeout(() => {
      clearInterval(spinIntervalRef.current);
      spinSpeed = 350;
      spinIntervalRef.current = setInterval(updateDisplay, spinSpeed);
    }, 5500);

    // Phase 4: Get result from backend
    setTimeout(() => {
      clearInterval(spinIntervalRef.current);
      setSpinning(false);
      
      if (onComplete) {
        onComplete((fishResult) => {
          // Show result with dramatic pause
          setTimeout(() => {
            setDisplayedFish([fishResult, fishResult, fishResult]);
            playWinSound(fishResult.rarity);
            
            setTimeout(() => {
              setResult(fishResult);
            }, 800);
          }, 300);
        });
      }
    }, 7000);
  };

  useEffect(() => {
    if (isOpen && !result && availableFish.length > 0) {
      setTimeout(() => handleSpin(), 500);
    }
  }, [isOpen, availableFish]);

  if (!isOpen) return null;

  const rarityColors = {
    common: '#4ADE80',
    rare: '#22D3EE',
    epic: '#A855F7',
    legendary: '#FACC15',
    mythical: '#FF003C'
  };

  const rarityNames = {
    common: 'ОБЫЧНАЯ',
    rare: 'РЕДКАЯ',
    epic: 'ЭПИЧЕСКАЯ',
    legendary: 'ЛЕГЕНДАРНАЯ',
    mythical: 'МИФИЧЕСКАЯ'
  };

  return (
    <div className=\"fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm\">
      <div className=\"relative w-full max-w-3xl mx-4\">
        <button
          onClick={onClose}
          className=\"absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors\"
          data-testid=\"close-gacha-modal\"
        >
          <X className=\"w-8 h-8\" />
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className=\"absolute -top-12 right-12 p-2 text-white hover:text-gray-300 transition-colors\"
        >
          {soundEnabled ? <Volume2 className=\"w-6 h-6\" /> : <VolumeX className=\"w-6 h-6\" />}
        </button>

        <div className=\"bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 rounded-3xl p-10 shadow-2xl border-4 border-yellow-500/40\">
          <h2 className=\"text-5xl font-black text-center text-white mb-4 drop-shadow-lg\">
            🎰 Открытие кейса
          </h2>
          
          {spinning && (
            <p className=\"text-center text-yellow-300 text-lg mb-6 animate-pulse\">
              {slowingDown ? '⚡ Определяем победителя...' : '🎲 Крутим барабаны...'}
            </p>
          )}

          {/* Slot Machine Display */}
          <div className=\"relative mb-8\">
            {/* Glow effect */}
            {result && (
              <div 
                className=\"absolute inset-0 rounded-2xl blur-2xl opacity-50\"
                style={{ background: rarityColors[result.rarity] }}
              />
            )}
            
            <div className=\"relative h-80 overflow-hidden rounded-2xl bg-gradient-to-b from-black/60 to-black/80 border-4 border-yellow-400/60 shadow-2xl\">
              <div className=\"absolute inset-0 flex items-center justify-center gap-6 p-6\">
                {displayedFish.length > 0 ? (
                  displayedFish.map((fish, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-full rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                        result && i === 1 ? 'scale-110' : ''
                      }`}
                      style={{
                        background: result && i === 1 
                          ? `linear-gradient(135deg, ${rarityColors[result.rarity]}60, ${rarityColors[result.rarity]}30)`
                          : `linear-gradient(135deg, ${fish.color}30, ${fish.color}15)`,
                        border: result && i === 1
                          ? `4px solid ${rarityColors[result.rarity]}`
                          : `3px solid ${fish.color}60`,
                        boxShadow: result && i === 1
                          ? `0 0 60px ${rarityColors[result.rarity]}`
                          : 'none'
                      }}
                    >
                      <div
                        className={`rounded-full mb-3 transition-all duration-300 ${
                          result && i === 1 ? 'w-32 h-32' : 'w-24 h-24'
                        }`}
                        style={{
                          background: fish.color,
                          boxShadow: `0 0 40px ${fish.color}`
                        }}
                      />
                      <div className=\"text-white font-bold text-center text-sm px-2\">
                        {fish.name}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className=\"text-white text-2xl\">Готов к открытию!</div>
                )}
              </div>

              {/* Scanline effect during spin */}
              {spinning && (
                <div className=\"absolute inset-0 pointer-events-none\">
                  <div className=\"absolute w-full h-1 bg-white/30 animate-scan\" />
                </div>
              )}
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div className=\"text-center space-y-6 animate-fade-in\">
              <div
                className=\"inline-block px-8 py-3 rounded-full font-black text-2xl tracking-wider\"
                style={{
                  background: rarityColors[result.rarity],
                  color: result.rarity === 'legendary' ? '#000' : '#fff',
                  boxShadow: `0 0 30px ${rarityColors[result.rarity]}, inset 0 0 20px rgba(255,255,255,0.3)`
                }}
              >
                ⭐ {rarityNames[result.rarity]} ⭐
              </div>
              
              <div className=\"space-y-2\">
                <div className=\"text-white text-4xl font-black drop-shadow-lg\">
                  {result.name}
                </div>
                <div className=\"text-yellow-300 text-5xl font-black drop-shadow-lg\">
                  +{result.points} очков
                </div>
              </div>

              <button
                onClick={onClose}
                className=\"mt-6 px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-black text-xl rounded-full transition-all shadow-lg hover:shadow-2xl active:scale-95\"
              >
                🎉 Забрать награду!
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 1s linear infinite;
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
