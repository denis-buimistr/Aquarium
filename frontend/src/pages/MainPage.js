import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Aquarium2D from '../components/Aquarium2D';
import FishSidebar from '../components/FishSidebar';
import GachaButton from '../components/GachaButton';
import GachaSlotMachine from '../components/GachaSlotMachine';
import Leaderboard from '../components/Leaderboard';
import UserStats from '../components/UserStats';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MainPage({ onLogout }) {
  const [aquariumFish, setAquariumFish] = useState([]);
  const [allFish, setAllFish] = useState([]);
  const [selectedFish, setSelectedFish] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState({ total_points: 0, total_fish: 0 });
  const [casesRemaining, setCasesRemaining] = useState(1);
  const [gachaModalOpen, setGachaModalOpen] = useState(false);
  const [pendingGachaResult, setPendingGachaResult] = useState(null);
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

  const fetchAllFish = async () => {
    try {
      const response = await axios.get(`${API}/fish/all`, getAuthHeaders());
      setAllFish(response.data);
    } catch (error) {
      console.error('Error fetching all fish:', error);
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
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchAquariumFish(),
          fetchAllFish(),
          fetchLeaderboard(),
          fetchUserStats(),
          fetchGachaStatus()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();

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

  const handleOpenCase = () => {
    if (casesRemaining <= 0) {
      toast.error('Нет доступных кейсов! Возвращайтесь завтра.');
      return;
    }
    setGachaModalOpen(true);
  };

  const handleGachaComplete = async (onResultReady) => {
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
      
      // Pass result back to slot machine
      onResultReady(fish);

      // Update stats
      setUserStats({
        total_points: total_points,
        total_fish: is_new ? userStats.total_fish + 1 : userStats.total_fish
      });

      // Update UI
      fetchLeaderboard();
      fetchGachaStatus();

      // Show toast notification
      setTimeout(() => {
        if (is_new) {
          toast.success(`Новая рыбка: ${fish.name} (+${fish.points} очков)`);
        } else {
          toast.info(`Дубликат: ${fish.name}`);
        }
      }, 3500);

    } catch (error) {
      console.error('Error opening case:', error);
      toast.error(error.response?.data?.detail || 'Ошибка при открытии кейса');
      setGachaModalOpen(false);
    }
  };

  const handleCloseGacha = () => {
    setGachaModalOpen(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Aquarium2D
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
        onOpenClick={handleOpenCase}
        casesRemaining={casesRemaining}
      />

      <GachaSlotMachine
        isOpen={gachaModalOpen}
        onClose={handleCloseGacha}
        onComplete={handleGachaComplete}
        availableFish={allFish}
      />
    </div>
  );
}
