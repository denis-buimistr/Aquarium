import React, { useEffect, useRef } from 'react';

export default function Aquarium2D({ fishList, onFishClick, selectedFishId }) {
  const canvasRef = useRef(null);
  const fishPositions = useRef([]);
  const animationRef = useRef(null);
  const bubblesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize fish positions
    if (fishPositions.current.length === 0 && fishList && fishList.length > 0) {
      fishPositions.current = fishList.map(fish => ({
        ...fish,
        x: fish.position ? fish.position[0] * 50 + canvas.width / 2 : Math.random() * canvas.width,
        y: fish.position ? fish.position[1] * 50 + canvas.height / 2 : Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 1,
        angle: Math.random() * Math.PI * 2,
        size: 40,
        tailPhase: Math.random() * Math.PI * 2
      }));
    }

    // Initialize bubbles
    if (bubblesRef.current.length === 0) {
      bubblesRef.current = [...Array(50)].map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.2
      }));
    }

    const drawFish = (fish, isSelected) => {
      const size = isSelected ? fish.size * 1.3 : fish.size;
      
      ctx.save();
      ctx.translate(fish.x, fish.y);
      ctx.rotate(fish.angle);

      // Shadow for depth
      if (isSelected) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = fish.color;
      }

      // Fish body (oval)
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.8, size * 0.5, 0, 0, Math.PI * 2);
      const bodyGradient = ctx.createRadialGradient(size * 0.2, -size * 0.1, 0, 0, 0, size);
      bodyGradient.addColorStop(0, fish.color);
      bodyGradient.addColorStop(0.7, fish.color);
      bodyGradient.addColorStop(1, shadeColor(fish.color, -30));
      ctx.fillStyle = bodyGradient;
      ctx.fill();
      
      if (isSelected) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Fish tail (animated)
      const tailWiggle = Math.sin(fish.tailPhase) * 15;
      ctx.save();
      ctx.translate(-size * 0.7, 0);
      ctx.rotate(tailWiggle * Math.PI / 180);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-size * 0.6, -size * 0.4, -size * 0.6, -size * 0.6, -size * 0.4, -size * 0.5);
      ctx.bezierCurveTo(-size * 0.5, -size * 0.3, -size * 0.5, size * 0.3, -size * 0.4, size * 0.5);
      ctx.bezierCurveTo(-size * 0.6, size * 0.6, -size * 0.6, size * 0.4, 0, 0);
      ctx.closePath();
      const tailGradient = ctx.createLinearGradient(0, 0, -size, 0);
      tailGradient.addColorStop(0, fish.color);
      tailGradient.addColorStop(1, shadeColor(fish.color, -20));
      ctx.fillStyle = tailGradient;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();

      // Top fin
      ctx.beginPath();
      ctx.moveTo(size * 0.2, -size * 0.5);
      ctx.bezierCurveTo(size * 0.1, -size * 0.8, size * 0.3, -size * 0.9, size * 0.4, -size * 0.5);
      ctx.closePath();
      ctx.fillStyle = shadeColor(fish.color, -10);
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Side fins
      ctx.beginPath();
      ctx.ellipse(size * 0.3, size * 0.4, size * 0.25, size * 0.15, Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = shadeColor(fish.color, -15);
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.ellipse(size * 0.3, -size * 0.4, size * 0.25, size * 0.15, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = shadeColor(fish.color, -15);
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Eye white
      ctx.beginPath();
      ctx.arc(size * 0.55, size * 0.15, size * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      
      // Pupil
      ctx.beginPath();
      ctx.arc(size * 0.58, size * 0.15, size * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
      
      // Eye shine
      ctx.beginPath();
      ctx.arc(size * 0.61, size * 0.13, size * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();

      // Mouth
      ctx.beginPath();
      ctx.arc(size * 0.7, size * 0.05, size * 0.1, 0, Math.PI);
      ctx.strokeStyle = shadeColor(fish.color, -40);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Stripes (for clownfish effect)
      if (fish.name && fish.name.includes('клоун')) {
        ctx.fillStyle = 'white';
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.ellipse(size * 0.1, 0, size * 0.15, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(size * 0.5, 0, size * 0.12, size * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Scales effect
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(
          (Math.random() - 0.5) * size * 0.8,
          (Math.random() - 0.5) * size * 0.5,
          size * 0.1,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'white';
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.restore();
    };

    const shadeColor = (color, percent) => {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ocean gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#001a33');
      gradient.addColorStop(0.5, '#003d66');
      gradient.addColorStop(1, '#001a33');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bubbles
      bubblesRef.current.forEach(bubble => {
        bubble.y -= bubble.speed;
        if (bubble.y < -10) {
          bubble.y = canvas.height + 10;
          bubble.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(bubble.x + Math.sin(bubble.y * 0.01) * 20, bubble.y, bubble.radius, 0, Math.PI * 2);
        const bubbleGradient = ctx.createRadialGradient(
          bubble.x - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.3,
          0,
          bubble.x,
          bubble.y,
          bubble.radius
        );
        bubbleGradient.addColorStop(0, 'rgba(200, 230, 255, 0.6)');
        bubbleGradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.3)');
        bubbleGradient.addColorStop(1, 'rgba(100, 150, 200, 0.1)');
        ctx.fillStyle = bubbleGradient;
        ctx.fill();
      });

      // Light rays
      ctx.save();
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 5; i++) {
        const x = (Date.now() * 0.01 + i * 200) % canvas.width;
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x, 0, 50, canvas.height);
      }
      ctx.restore();

      // Update and draw fish
      fishPositions.current.forEach(fish => {
        fish.x += fish.vx;
        fish.y += fish.vy;
        fish.tailPhase += 0.2;

        if (fish.x < 50 || fish.x > canvas.width - 50) fish.vx *= -1;
        if (fish.y < 50 || fish.y > canvas.height - 50) fish.vy *= -1;

        fish.angle = Math.atan2(fish.vy, fish.vx);
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

    let clickedFish = null;
    let minDistance = Infinity;
    
    fishPositions.current.forEach(fish => {
      const dx = x - fish.x;
      const dy = y - fish.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < fish.size && distance < minDistance) {
        minDistance = distance;
        clickedFish = fish;
      }
    });
    
    if (clickedFish) {
      onFishClick(clickedFish.id);
    }
  };

  if (!fishList || fishList.length === 0) {
    return (
      <div className="fixed inset-0 z-0 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #001a33 0%, #003d66 100%)' }}>
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
    />
  );
}
