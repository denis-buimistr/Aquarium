import React, { useEffect, useRef } from 'react';

export default function Aquarium2D({ fishList, onFishClick, selectedFishId }) {
  const canvasRef = useRef(null);
  const fishPositions = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize fish positions and velocities
    if (fishPositions.current.length === 0 && fishList && fishList.length > 0) {
      fishPositions.current = fishList.map(fish => ({
        ...fish,
        x: fish.position ? fish.position[0] * 50 + canvas.width / 2 : Math.random() * canvas.width,
        y: fish.position ? fish.position[1] * 50 + canvas.height / 2 : Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 1,
        angle: Math.random() * Math.PI * 2,
        size: 30
      }));
    }

    const drawFish = (fish, isSelected) => {
      const size = isSelected ? fish.size * 1.3 : fish.size;
      
      ctx.save();
      ctx.translate(fish.x, fish.y);
      ctx.rotate(fish.angle);

      // Fish body
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = fish.color;
      ctx.fill();
      
      if (isSelected) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Fish tail
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      ctx.lineTo(-size * 1.5, -size * 0.5);
      ctx.lineTo(-size * 1.5, size * 0.5);
      ctx.closePath();
      ctx.fillStyle = fish.color;
      ctx.fill();

      // Fish eye
      ctx.beginPath();
      ctx.arc(size * 0.5, 0, size * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.5, 0, size * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = 'black';
      ctx.fill();

      // Glow effect
      if (isSelected) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = fish.color;
      }

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ocean gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#050A14');
      gradient.addColorStop(0.5, '#0A1628');
      gradient.addColorStop(1, '#050A14');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bubbles
      for (let i = 0; i < 20; i++) {
        const x = (Date.now() * 0.02 + i * 100) % canvas.width;
        const y = (Date.now() * 0.05 + i * 50) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 2 + Math.sin(Date.now() * 0.001 + i) * 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
        ctx.fill();
      }

      // Update and draw fish
      fishPositions.current.forEach(fish => {
        // Update position
        fish.x += fish.vx;
        fish.y += fish.vy;

        // Bounce off edges
        if (fish.x < 50 || fish.x > canvas.width - 50) fish.vx *= -1;
        if (fish.y < 50 || fish.y > canvas.height - 50) fish.vy *= -1;

        // Update angle to face direction of movement
        fish.angle = Math.atan2(fish.vy, fish.vx);

        // Add swimming motion
        fish.y += Math.sin(Date.now() * 0.002 + fish.x * 0.01) * 0.3;

        const isSelected = selectedFishId === fish.id;
        drawFish(fish, isSelected);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [fishList, selectedFishId]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on a fish
    fishPositions.current.forEach(fish => {
      const dx = x - fish.x;
      const dy = y - fish.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < fish.size) {
        onFishClick(fish.id);
      }
    });
  };

  if (!fishList || fishList.length === 0) {
    return (
      <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#050A14]">
        <div className="text-white text-xl">Загрузка аквариума...</div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      onMouseMove={(e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let overFish = false;
        fishPositions.current.forEach(fish => {
          const dx = x - fish.x;
          const dy = y - fish.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < fish.size) overFish = true;
        });

        canvas.style.cursor = overFish ? 'pointer' : 'default';
      }}
      className="fixed inset-0 z-0"
      style={{ background: '#050A14' }}
    />
  );
}
