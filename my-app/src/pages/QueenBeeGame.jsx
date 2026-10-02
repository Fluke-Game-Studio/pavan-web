import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const GAME_DURATION_SECONDS = 90;
const TARGET_POINTS = 20;

const getHint = ({ score, timeLeft, target }) => {
  if (timeLeft <= 10 && score < target) return 'Final rush: chain quick clicks to catch up.';
  if (score >= target) return 'Goal reached. Keep harvesting while the timer runs.';
  if (score >= target * 0.7) return 'Great pace. Stay focused on nearby glowing cells.';
  if (timeLeft > 45) return 'Click honey cells to harvest nectar and avoid hornets.';
  return 'You are behind pace. Prioritize fresh cells instead of revisits.';
};

const QueenBeeGame = () => {
  const canvasRef = useRef(null);
  const beeRef = useRef(null);
  const lastX = useRef(0);
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);

  const [resetNonce, setResetNonce] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
  const [gameResult, setGameResult] = useState('playing');

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    gameOverRef.current = gameResult !== 'playing';
  }, [gameResult]);

  useEffect(() => {
    if (gameResult !== 'playing') return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setGameResult(scoreRef.current >= TARGET_POINTS ? 'won' : 'lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameResult, resetNonce]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    updateCanvasSize();

    const config = {
      hexHeight: 88,
      hexGlowRadius: 280,
      hexFillColor: 'rgba(14, 14, 14, 0.95)',
      honeyColor: 'rgba(255, 190, 36, 0.9)',
      hornetColor: 'rgba(123, 53, 12, 0.95)',
      glowColorStart: 'rgba(252, 181, 3, 0.92)',
      glowColorEnd: 'rgba(252, 181, 3, 0)',
      glowSpeed: 0.1,
      hexRepelRadius: 180,
      hexRepelStrength: 42
    };

    const hexWidth = config.hexHeight * Math.sqrt(3);
    const hexHorizDist = hexWidth * 0.5067 + 10;
    const hexVertDist = config.hexHeight * 0.755 + 10;
    const hexRadius = config.hexHeight / 2;

    let cursorPosition = { x: canvas.width / 2, y: canvas.height / 2 };
    let targetCursorPosition = { ...cursorPosition };
    const hexagons = [];
    let animationFrameId = null;

    const makeHexType = () => {
      const roll = Math.random();
      if (roll < 0.14) return 'hornet';
      if (roll < 0.56) return 'honey';
      return 'empty';
    };

    const drawHexagonShape = () => {
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const xOffset = hexRadius * Math.cos(angle);
        const yOffset = (config.hexHeight / 2) * Math.sin(angle);
        if (i === 0) ctx.moveTo(xOffset, yOffset);
        else ctx.lineTo(xOffset, yOffset);
      }
      ctx.closePath();
    };

    const drawHexagon = (x, y, index) => {
      const hex = hexagons[index];
      if (!hex) return;

      const scaleX = hex.flipping ? Math.cos((Math.PI * hex.progress) / 100) : 1;
      const scaleY = hex.flipping ? (Math.sin((Math.PI * hex.progress) / 100) + 1) / 2 : 1;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scaleX, scaleY);
      drawHexagonShape();

      if (hex.hovered) {
        const gradient = ctx.createLinearGradient(0, 0, hexRadius, 0);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      let fillStyle = config.hexFillColor;
      if (!hex.isFront) {
        if (hex.type === 'honey') fillStyle = config.honeyColor;
        if (hex.type === 'hornet') fillStyle = config.hornetColor;
      }
      ctx.fillStyle = fillStyle;
      ctx.fill();

      if (!hex.isFront && hex.type !== 'empty') {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '600 14px Archivo Black, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hex.type === 'honey' ? '+1' : '-2', 0, 2);
      }
      ctx.restore();

      if (hex.flipping) {
        hex.progress += 7;
        if (hex.progress >= 100) {
          hex.flipping = false;
          hex.progress = 0;
          hex.isFront = !hex.isFront;
        }
      }
    };

    const drawGlow = () => {
      const gradient = ctx.createRadialGradient(
        cursorPosition.x,
        cursorPosition.y,
        0,
        cursorPosition.x,
        cursorPosition.y,
        config.hexGlowRadius
      );
      gradient.addColorStop(0, config.glowColorStart);
      gradient.addColorStop(1, config.glowColorEnd);

      ctx.globalCompositeOperation = 'destination-over';
      ctx.beginPath();
      ctx.arc(cursorPosition.x, cursorPosition.y, config.hexGlowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGlow();

      const rows = Math.ceil(canvas.height / hexVertDist);
      const cols = Math.ceil(canvas.width / hexHorizDist) + 1;

      const gridWidth = (cols - 1) * hexHorizDist + hexWidth;
      const gridHeight = (rows - 1) * hexVertDist + config.hexHeight;

      const xOffsetStart = (canvas.width - gridWidth) / 2 + hexWidth / 2;
      const yOffsetStart = (canvas.height - gridHeight) / 2 + config.hexHeight / 2;

      let hexIndex = 0;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const baseX = xOffsetStart + col * hexHorizDist + (row % 2 === 0 ? 0 : hexHorizDist / 2);
          const baseY = yOffsetStart + row * hexVertDist;

          const dx = baseX - cursorPosition.x;
          const dy = baseY - cursorPosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const repelFactor = Math.max(0, (config.hexRepelRadius - distance) / config.hexRepelRadius);
          const offsetX = (dx * repelFactor * config.hexRepelStrength) / config.hexRepelRadius;
          const offsetY = (dy * repelFactor * config.hexRepelStrength) / config.hexRepelRadius;

          let hex = hexagons[hexIndex];
          if (!hex) {
            hex = {
              x: baseX,
              y: baseY,
              radius: hexRadius,
              type: makeHexType(),
              hovered: false,
              flipping: false,
              progress: 0,
              isFront: true,
              harvested: false
            };
            hexagons[hexIndex] = hex;
          } else {
            hex.x = baseX;
            hex.y = baseY;
          }

          drawHexagon(baseX + offsetX, baseY + offsetY, hexIndex);
          hexIndex += 1;
        }
      }

      hexagons.length = hexIndex;
    };

    const addScore = (delta) => {
      setScore((prev) => {
        const next = Math.max(0, prev + delta);
        if (next >= TARGET_POINTS && !gameOverRef.current) {
          setGameResult('won');
        }
        return next;
      });
    };

    const handleHexClick = (e) => {
      if (gameOverRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      for (const hexagon of hexagons) {
        const dx = clickX - hexagon.x;
        const dy = clickY - hexagon.y;

        if (Math.sqrt(dx * dx + dy * dy) <= hexagon.radius) {
          if (!hexagon.flipping) {
            hexagon.flipping = true;
          }

          if (!hexagon.harvested) {
            if (hexagon.type === 'honey') addScore(1);
            if (hexagon.type === 'hornet') addScore(-2);
            hexagon.harvested = true;
          } else if (hexagon.type === 'honey') {
            addScore(-1);
          }
          break;
        }
      }
    };

    const handlePointerMove = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      targetCursorPosition.x = clientX - rect.left;
      targetCursorPosition.y = clientY - rect.top;

      hexagons.forEach((hex) => {
        const dx = targetCursorPosition.x - hex.x;
        const dy = targetCursorPosition.y - hex.y;
        hex.hovered = Math.sqrt(dx * dx + dy * dy) <= hex.radius;
      });
    };

    const handleMouseMove = (e) => handlePointerMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (!e.touches?.[0]) return;
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleResize = () => {
      updateCanvasSize();
      drawGrid();
    };

    const animateCursor = () => {
      drawGrid();
      cursorPosition.x += (targetCursorPosition.x - cursorPosition.x) * config.glowSpeed;
      cursorPosition.y += (targetCursorPosition.y - cursorPosition.y) * config.glowSpeed;
      animationFrameId = requestAnimationFrame(animateCursor);
    };

    canvas.addEventListener('click', handleHexClick);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    animationFrameId = requestAnimationFrame(animateCursor);

    return () => {
      canvas.removeEventListener('click', handleHexClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [resetNonce]);

  useEffect(() => {
    const bee = beeRef.current;
    if (!bee) return undefined;

    const placeBee = (x, y) => {
      bee.style.left = `${x - 15}px`;
      bee.style.top = `${y - 15}px`;

      if (lastX.current < x) {
        bee.classList.add('flip');
      } else {
        bee.classList.remove('flip');
      }
      lastX.current = x;
    };

    const handleMouseMove = (e) => placeBee(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (!e.touches?.[0]) return;
      placeBee(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const restartGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(GAME_DURATION_SECONDS);
    setGameResult('playing');
    setResetNonce((prev) => prev + 1);
  };

  const hint = getHint({ score, timeLeft, target: TARGET_POINTS });

  return (
    <div className="queenbee-page">
      <canvas ref={canvasRef} id="canvas" className="queenbee-canvas" />

      <div id="bug" className="bee" ref={beeRef}>
        <div className="wings" />
        <div className="limbs" />
      </div>

      <section className="queenbee-panel">
        <div className="queenbee-header">
          <span className="wip-label">Queen Bee</span>
          <h1>Harvest Run</h1>
          <p>Click cells to reveal rewards. Honey gives +1. Hornets cost -2.</p>
        </div>

        <div className="queenbee-stats">
          <div className="stat-card">
            <span>Score</span>
            <strong>{score}</strong>
          </div>
          <div className="stat-card">
            <span>Target</span>
            <strong>{TARGET_POINTS}</strong>
          </div>
          <div className="stat-card">
            <span>Timer</span>
            <strong>{timeLeft}s</strong>
          </div>
        </div>

        <p className="queenbee-hint">{hint}</p>

        <div className="queenbee-actions">
          <button type="button" className="btn btn-outline" onClick={restartGame}>
            Restart
          </button>
          <Link to="/" className="btn btn-outline queenbee-back">
            Back Home
          </Link>
        </div>

        {gameResult !== 'playing' && (
          <div className={`queenbee-result ${gameResult}`}>
            {gameResult === 'won'
              ? `Victory. You scored ${score}.`
              : `Defeat. You needed ${TARGET_POINTS} and finished with ${score}.`}
          </div>
        )}
      </section>
    </div>
  );
};

export default QueenBeeGame;
