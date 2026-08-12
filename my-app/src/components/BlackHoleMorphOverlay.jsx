import React, { useEffect, useRef } from 'react';
import './BlackHoleIntro.css';

const STAR_COUNT = 2500;
const DPI_CAP = 2;

function rotate(cx, cy, x, y, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
  const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return [nx, ny];
}

function BlackHoleMorphOverlay({ active, phase }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(performance.now());
  const collapseRef = useRef(false);
  const expanseRef = useRef(false);
  const returningRef = useRef(false);

  useEffect(() => {
    collapseRef.current = phase === 'collapse';
    expanseRef.current = phase === 'expand';
    returningRef.current = false;
    startTimeRef.current = performance.now();
  }, [phase]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || !active) return undefined;

    const context = canvas.getContext('2d');
    context.globalCompositeOperation = 'multiply';
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

      dpi = Math.min(window.devicePixelRatio || 1, DPI_CAP);
      canvas.width = Math.ceil(cw * dpi);
      canvas.height = Math.ceil(ch * dpi);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      context.setTransform(dpi, 0, 0, dpi, 0, 0);

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
          this.rotation = this.startRotation + (currentTime * (this.speed / 2));
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

      context.fillStyle = 'rgba(25,25,25,0.2)';
      context.fillRect(0, 0, cw, ch);

      for (let i = 0; i < stars.length; i += 1) {
        stars[i].draw(currentTime);
      }

      animationFrameRef.current = window.requestAnimationFrame(render);
    };

    const handleResize = () => {
      setSize();
    };

    setSize();
    render();

    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={containerRef} className="blackhole-scene bhm-overlay blackhole-scene--overlay" aria-hidden="true">
      <canvas ref={canvasRef} className="blackhole-scene__canvas" />
    </div>
  );
}

export default BlackHoleMorphOverlay;
