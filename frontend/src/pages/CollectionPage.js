import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Lock, CheckCircle, ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CollectionPage({ onBack }) {
  const [allFish, setAllFish] = useState([]);
  const [userCollection, setUserCollection] = useState([]);
  const [selectedFish, setSelectedFish] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fishResponse, collectionResponse] = await Promise.all([
          axios.get(`${API}/fish/all`, getAuthHeaders()),
          axios.get(`${API}/user/collection`, getAuthHeaders())
        ]);
        
        setAllFish(fishResponse.data);
        setUserCollection(collectionResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching collection:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isUnlocked = (fishId) => {
    return userCollection.some(f => f.id === fishId);
  };

  const rarityColors = {
    common: '#4ADE80',
    rare: '#22D3EE',
    epic: '#A855F7',
    legendary: '#FACC15',
    mythical: '#FF003C'
  };

  const rarityNames = {
    common: 'Обычная',
    rare: 'Редкая',
    epic: 'Эпическая',
    legendary: 'Легендарная',
    mythical: 'Мифическая'
  };

  const groupedByRarity = {
    mythical: allFish.filter(f => f.rarity === 'mythical'),
    legendary: allFish.filter(f => f.rarity === 'legendary'),
    epic: allFish.filter(f => f.rarity === 'epic'),
    rare: allFish.filter(f => f.rarity === 'rare'),
    common: allFish.filter(f => f.rarity === 'common')
  };

  const unlockedCount = userCollection.length;
  const totalCount = allFish.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #001a33 0%, #003d66 100%)' }}>
        <div className="text-white text-2xl">Загрузка коллекции...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'linear-gradient(to bottom, #001a33 0%, #003d66 100%)' }}>
      <div className="min-h-screen p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors mb-6"
            data-testid="back-to-aquarium-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Вернуться в аквариум</span>
          </button>

          <h1 className="text-5xl font-black text-white mb-4">📚 Моя Коллекция</h1>
          
          {/* Progress Bar */}
          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold">Прогресс сбора</span>
              <span className="text-white font-bold">{unlockedCount} / {totalCount}</span>
            </div>
            <div className="w-full h-6 bg-black/40 rounded-full overflow-hidden border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 flex items-center justify-center text-white font-bold text-sm"
                style={{ width: `${progress}%` }}
              >
                {progress.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Collection Grid by Rarity */}
        <div className="max-w-7xl mx-auto space-y-8">
          {Object.entries(groupedByRarity).map(([rarity, fishes]) => {
            if (fishes.length === 0) return null;
            
            const unlockedInRarity = fishes.filter(f => isUnlocked(f.id)).length;
            
            return (
              <div key={rarity} className="glass-panel rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-3xl font-black"
                    style={{ color: rarityColors[rarity], textShadow: `0 0 10px ${rarityColors[rarity]}` }}
                  >
                    ⭐ {rarityNames[rarity]}
                  </h2>
                  <span className="text-white font-bold">
                    {unlockedInRarity} / {fishes.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {fishes.map((fish) => {
                    const unlocked = isUnlocked(fish.id);
                    
                    return (
                      <div
                        key={fish.id}
                        onClick={() => unlocked && setSelectedFish(fish)}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          unlocked
                            ? 'cursor-pointer hover:scale-105 hover:shadow-2xl'
                            : 'opacity-50 cursor-not-allowed grayscale'
                        }`}
                        style={{
                          background: unlocked
                            ? `linear-gradient(135deg, ${fish.color}30, ${fish.color}10)`
                            : 'linear-gradient(135deg, #33333330, #11111110)',
                          borderColor: unlocked ? `${fish.color}80` : '#ffffff20',
                          boxShadow: unlocked ? `0 0 20px ${fish.color}40` : 'none'
                        }}
                        data-testid={`collection-fish-${fish.id}`}
                      >
                        {/* Lock overlay */}
                        {!unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                            <Lock className="w-12 h-12 text-white" />
                          </div>
                        )}

                        {/* Unlocked badge */}
                        {unlocked && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          </div>
                        )}

                        {/* Fish Icon */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-20 h-20 rounded-full mb-3"
                            style={{
                              background: unlocked ? fish.color : '#666',
                              boxShadow: unlocked ? `0 0 20px ${fish.color}` : 'none'
                            }}
                          />
                          <div className="text-center">
                            <div className="text-white font-bold text-sm">
                              {unlocked ? fish.name : '???'}
                            </div>
                            {unlocked && (
                              <div className="text-xs text-gray-400 mt-1">
                                {fish.points} очков
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fish Detail Modal */}
      {selectedFish && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedFish(null)}
        >
          <div
            className="glass-panel rounded-2xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: `linear-gradient(135deg, ${selectedFish.color}20, ${selectedFish.color}05)`,
              border: `2px solid ${selectedFish.color}60`
            }}
          >
            <button
              onClick={() => setSelectedFish(null)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div
                  className="w-48 h-48 rounded-full"
                  style={{
                    background: selectedFish.color,
                    boxShadow: `0 0 60px ${selectedFish.color}`
                  }}
                />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-4xl font-black text-white mb-2">{selectedFish.name}</h2>
                  <p className="text-gray-400 italic">{selectedFish.species}</p>
                </div>

                <div
                  className="inline-block px-4 py-2 rounded-full text-sm font-bold"
                  style={{
                    background: rarityColors[selectedFish.rarity],
                    color: selectedFish.rarity === 'legendary' ? '#000' : '#fff'
                  }}
                >
                  {rarityNames[selectedFish.rarity]}
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-1">Описание</h3>
                    <p className="text-white">{selectedFish.description}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-1">Место обитания</h3>
                    <p className="text-white">{selectedFish.habitat}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-1">Питание</h3>
                    <p className="text-white">{selectedFish.diet}</p>
                  </div>

                  <div className="pt-3 border-t border-white/20">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-bold">Ценность</span>
                      <span className="text-3xl font-black text-yellow-400">{selectedFish.points}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}