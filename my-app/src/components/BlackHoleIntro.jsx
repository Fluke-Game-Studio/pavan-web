import React, { useCallback, useEffect, useRef, useState } from 'react';
import './BlackHoleIntro.css';

const STAR_COUNT = 2500;
const DPI_CAP = 2;
const EXPAND_DURATION_MS = 3000;
const RETURN_DURATION_MS = 1000;
const HOTSPOT_ENTER_RATIO = 0.28;
const HOTSPOT_EXIT_RATIO = 0.36;

function rotate(cx, cy, x, y, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
  const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return [nx, ny];
}

const BlackHoleIntro = ({ onEnter }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const expandTimerRef = useRef(null);
  const returnTimerRef = useRef(null);
  const startTimeRef = useRef(performance.now());
  const openRef = useRef(false);
  const collapseRef = useRef(false);
  const expanseRef = useRef(false);
  const returningRef = useRef(false);
  const [buttonOpen, setButtonOpen] = useState(false);

  const handleClick = useCallback(() => {
    if (openRef.current) return;

    openRef.current = true;
    setButtonOpen(true);
    collapseRef.current = false;
    expanseRef.current = true;
    returningRef.current = false;

    if (typeof onEnter === 'function') {
      onEnter();
    }

    window.clearTimeout(expandTimerRef.current);
    window.clearTimeout(returnTimerRef.current);

    expandTimerRef.current = window.setTimeout(() => {
      expanseRef.current = false;
      returningRef.current = true;
    }, EXPAND_DURATION_MS);

    returnTimerRef.current = window.setTimeout(() => {
      returningRef.current = false;
    }, EXPAND_DURATION_MS + RETURN_DURATION_MS);
  }, [onEnter]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const context = canvas.getContext('2d');
    context.globalCompositeOperation = 'source-over';
    const maxOrbit = 255;
    let cw = 0;
    let ch = 0;
    let centerx = 0;
    let centery = 0;
    let stars = [];
    let dpi = 1;

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      cw = rect.width;
      ch = rect.height;
      centerx = cw / 2;
      centery = ch / 2;
      startTimeRef.current = performance.now();

      dpi = Math.min(window.devicePixelRatio || 1, DPI_CAP);
      canvas.width = Math.ceil(cw * dpi);
      canvas.height = Math.ceil(ch * dpi);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      context.setTransform(dpi, 0, 0, dpi, 0, 0);
      context.lineCap = 'round';
      context.lineJoin = 'round';

      stars = [];
      for (let i = 0; i < STAR_COUNT; i += 1) {
        stars.push(new Star());
      }
    };

    class Star {
      constructor() {
        const first = Math.random() * (maxOrbit / 2) + 1;
        const second = Math.random() * (maxOrbit / 2) + maxOrbit;

        this.orbital = (first + second) / 2;
        this.x = centerx;
        this.y = centery + this.orbital;
        this.yOrigin = this.y;
        this.originalY = this.y;
        this.speed = (Math.floor(Math.random() * 2.5) + 1.5) * Math.PI / 180;
        this.rotation = 0;
        this.startRotation = (Math.floor(Math.random() * 360) + 1) * Math.PI / 180;
        this.id = stars.length;
        this.collapseBonus = this.orbital - (maxOrbit * 0.7);
        if (this.collapseBonus < 0) {
          this.collapseBonus = 0;
        }
        this.color = `rgba(255,255,255,${1 - (this.orbital / 255)})`;
        this.hoverPos = centery + (maxOrbit / 2) + this.collapseBonus;
        this.expansePos = centery + ((this.id % 100) * -10) + (Math.floor(Math.random() * 20) + 1);
        this.prevR = this.startRotation;
        this.prevX = this.x;
        this.prevY = this.y;
      }

      draw(currentTime) {
        if (!expanseRef.current && !returningRef.current) {
          this.rotation = this.startRotation + (currentTime * this.speed);

          if (!collapseRef.current) {
            if (this.y > this.yOrigin) {
              this.y -= 2.5;
            }
            if (this.y < this.yOrigin - 4) {
              this.y += (this.yOrigin - this.y) / 10;
            }
          } else {
            if (this.y > this.hoverPos) {
              this.y -= (this.hoverPos - this.y) / -5;
            }
            if (this.y < this.hoverPos - 4) {
              this.y += 2.5;
            }
          }
        } else if (expanseRef.current && !returningRef.current) {
          this.rotation = this.startRotation + (currentTime * this.speed);
          if (this.y > this.expansePos) {
            this.y -= Math.floor(this.expansePos - this.y) / -80;
          }
        } else if (returningRef.current) {
          this.rotation = this.startRotation + (currentTime * this.speed);
          if (Math.abs(this.y - this.originalY) > 2) {
            this.y += (this.originalY - this.y) / 50;
          } else {
            this.y = this.originalY;
            this.yOrigin = this.originalY;
          }
        }

        context.save();
        context.fillStyle = this.color;
        context.strokeStyle = this.color;
        context.beginPath();
        const oldPos = rotate(centerx, centery, this.prevX, this.prevY, -this.prevR);
        context.moveTo(oldPos[0], oldPos[1]);
        context.translate(centerx, centery);
        context.rotate(this.rotation);
        context.translate(-centerx, -centery);
        context.lineTo(this.x, this.y);
        context.stroke();
        context.restore();

        this.prevR = this.rotation;
        this.prevX = this.x;
        this.prevY = this.y;
      }
    }

    const render = () => {
      const now = performance.now();
      const currentTime = (now - startTimeRef.current) / 50;

      context.clearRect(0, 0, cw, ch);

      for (let i = 0; i < stars.length; i += 1) {
        stars[i].draw(currentTime);
      }

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    const handleResize = () => {
      setSize();
    };

    const handleMouseMove = (event) => {
      if (openRef.current) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top + (rect.height / 2);
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      const shortestSide = Math.min(rect.width, rect.height);
      const enterRadius = shortestSide * HOTSPOT_ENTER_RATIO;
      const exitRadius = shortestSide * HOTSPOT_EXIT_RATIO;

      collapseRef.current = collapseRef.current
        ? distance <= exitRadius
        : distance <= enterRadius;
    };

    const handleMouseLeave = () => {
      if (!openRef.current) {
        collapseRef.current = false;
      }
    };

    setSize();
    render();

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
      window.clearTimeout(expandTimerRef.current);
      window.clearTimeout(returnTimerRef.current);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [onEnter]);

  return (
    <div
      ref={containerRef}
      className={`blackhole-scene${buttonOpen ? ' blackhole-scene--open' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Enter the black hole scene"
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      <canvas ref={canvasRef} className="blackhole-scene__canvas" />
      <button
        type="button"
        className={`blackhole-enter${buttonOpen ? ' blackhole-enter--open' : ''}`}
        aria-hidden="true"
        tabIndex={-1}
        onClick={handleClick}
      >
        <img
          src="/starttextimage.png"
          alt=""
          className="blackhole-enter__image"
          draggable="false"
        />
      </button>
    </div>
  );
};

export default BlackHoleIntro;
