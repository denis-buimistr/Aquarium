import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Aquarium3D from '../components/Aquarium3D';
import FishSidebar from '../components/FishSidebar';
import GachaButton from '../components/GachaButton';
import Leaderboard from '../components/Leaderboard';
import UserStats from '../components/UserStats';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MainPage({ onLogout }) {
  const [aquariumFish, setAquariumFish] = useState([]);
  const [selectedFish, setSelectedFish] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState({ total_points: 0, total_fish: 0 });
  const [casesRemaining, setCasesRemaining] = useState(1);
  const currentUserId = localStorage.getItem('user_id');

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  const fetchAquariumFish = async () => {
    try {
      const response = await axios.get(`${API}/fish/aquarium`, getAuthHeaders());
      setAquariumFish(response.data);
    } catch (error) {
      console.error('Error fetching aquarium fish:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API}/leaderboard`, getAuthHeaders());
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`${API}/user/stats`, getAuthHeaders());
      setUserStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchGachaStatus = async () => {
    try {
      const response = await axios.get(`${API}/gacha/status`, getAuthHeaders());
      setCasesRemaining(response.data.cases_remaining);
    } catch (error) {
      console.error('Error fetching gacha status:', error);
    }
  };

  useEffect(() => {
    fetchAquariumFish();
    fetchLeaderboard();
    fetchUserStats();
    fetchGachaStatus();

    const aquariumInterval = setInterval(fetchAquariumFish, 30 * 60 * 1000);
    const leaderboardInterval = setInterval(fetchLeaderboard, 10000);

    return () => {
      clearInterval(aquariumInterval);
      clearInterval(leaderboardInterval);
    };
  }, []);

  const handleFishClick = async (fishId) => {
    try {
      const response = await axios.get(`${API}/fish/${fishId}`, getAuthHeaders());
      setSelectedFish(response.data);
      setSidebarOpen(true);
    } catch (error) {
      console.error('Error fetching fish details:', error);
    }
  };

  const handleFishUnlocked = (fish, isNew, totalPoints) => {
    setUserStats(prev => ({
      ...prev,
      total_points: totalPoints,
      total_fish: isNew ? prev.total_fish + 1 : prev.total_fish
    }));
    fetchLeaderboard();
  };

  const handleCaseUsed = () => {
    fetchGachaStatus();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Aquarium3D
        fishList={aquariumFish}
        onFishClick={handleFishClick}
        selectedFishId={selectedFish?.id}
      />

      <UserStats stats={userStats} onLogout={onLogout} />

      <FishSidebar
        fish={selectedFish}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Leaderboard leaderboard={leaderboard} currentUserId={currentUserId} />

      <GachaButton
        onFishUnlocked={handleFishUnlocked}
        casesRemaining={casesRemaining}
        onCaseUsed={handleCaseUsed}
      />
    </div>
  );
}