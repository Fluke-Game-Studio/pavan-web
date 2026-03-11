import React, { useEffect, useRef, useState } from 'react';

const TRAIL_LENGTH = 28;

const CustomCursor = () => {
    const canvasRef = useRef(null);
    const mouse = useRef({ x: -200, y: -200 });
    const dotPos = useRef({ x: -200, y: -200 });
    const particles = useRef([]);
    const animFrame = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const isHoveredRef = useRef(false);
    const gadaRef = useRef(null);
    const isClickingRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const onMove = (e) => {
            mouse.current = { x: e.clientX, y: e.clientY };

            // The center of the Gada (the hotspot/cursor center)
            const spawnX = e.clientX;
            const spawnY = e.clientY;

            // Spawn a new trail particle from the center of the gada
            particles.current.push({
                x: spawnX,
                y: spawnY,
                alpha: 1,
                size: isHoveredRef.current
                    ? Math.random() * 7 + 4
                    : Math.random() * 5 + 2,
                vx: (Math.random() - 0.5) * 1.2,
                vy: (Math.random() - 0.5) * 1.2 - 0.4,
                hue: Math.random() * 20 + 40, // gold range: 40-60°
            });

            // Keep trail capped
            if (particles.current.length > 80) {
                particles.current.shift();
            }
        };

        const onOver = (e) => {
            const t = e.target;
            const hov =
                t.tagName === 'BUTTON' ||
                t.tagName === 'A' ||
                !!t.closest('button') ||
                !!t.closest('a') ||
                t.classList.contains('interactive');
            isHoveredRef.current = hov;
            setIsHovered(hov);
        };

        const onDown = () => { isClickingRef.current = true; };
        const onUp = () => { isClickingRef.current = false; };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseover', onOver);
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);

        const lerp = (a, b, t) => a + (b - a) * t;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Lerp the dot to mouse
            dotPos.current.x = lerp(dotPos.current.x, mouse.current.x, 0.35);
            dotPos.current.y = lerp(dotPos.current.y, mouse.current.y, 0.35);

            // Draw & update trail particles
            particles.current.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.038;
                p.size *= 0.96;

                if (p.alpha <= 0) return;

                const gradient = ctx.createRadialGradient(
                    p.x, p.y, 0,
                    p.x, p.y, p.size
                );
                gradient.addColorStop(0, `hsla(${p.hue}, 100%, 75%, ${p.alpha})`);
                gradient.addColorStop(0.5, `hsla(${p.hue}, 90%, 55%, ${p.alpha * 0.6})`);
                gradient.addColorStop(1, `hsla(${p.hue}, 80%, 40%, 0)`);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            });

            // Remove dead particles
            particles.current = particles.current.filter((p) => p.alpha > 0);

            // Update Gada Pointer position directly via ref for zero lag
            // If visually rendered at 50x50px, the head (hotspot) is at 25px, 12.5px.
            // So we offset by -25, -12
            if (gadaRef.current) {
                // Hover state: vertical position (0deg) and slightly larger (1.15x)
                // Click state: zoom in (0.85x)
                // Normal state: angled (-35deg) at normal size (1x)
                const rotation = isHoveredRef.current ? 0 : -35;
                const scale = isClickingRef.current ? 0.85 : (isHoveredRef.current ? 1.15 : 1);
                gadaRef.current.style.transform = `translate(${mouse.current.x - 25}px, ${mouse.current.y - 12}px) rotate(${rotation}deg) scale(${scale})`;
            }

            animFrame.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseover', onOver);
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animFrame.current);
        };
    }, []);

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    zIndex: 99998,
                    mixBlendMode: 'screen',
                }}
            />
            {/* The Gada Cursor */}
            <div
                ref={gadaRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '50px',
                    height: '50px',
                    pointerEvents: 'none',
                    zIndex: 99999,
                    transformOrigin: '50% 25%',
                    filter: isHovered
                        ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)) drop-shadow(0 15px 25px rgba(0,0,0,0.7))'
                        : 'drop-shadow(0 15px 25px rgba(0,0,0,0.7))',
                    // Super fast, snappy, motion-blur-like transition for the strike
                    transition: 'transform 0.15s cubic-bezier(0.1, 1.2, 0.4, 1), filter 0.2s ease'
                }}
            >
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                    <defs>
                        <linearGradient id="cursor-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFF000" />
                            <stop offset="50%" stopColor="#FFD700" />
                            <stop offset="100%" stopColor="#B8860B" />
                        </linearGradient>
                        <filter id="cursor-glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <rect x="46" y="40" width="8" height="50" rx="4" fill="url(#cursor-gold)" />
                    <rect x="44" y="50" width="12" height="3" rx="1.5" fill="#8B6508" />
                    <rect x="44" y="65" width="12" height="3" rx="1.5" fill="#8B6508" />
                    <rect x="44" y="80" width="12" height="3" rx="1.5" fill="#8B6508" />
                    <circle cx="50" cy="25" r="18" fill="url(#cursor-gold)" filter="url(#cursor-glow)" />
                    <circle cx="50" cy="25" r="13" fill="#DAA520" />
                    <circle cx="50" cy="25" r="6" fill="#FFF000" />
                    <polygon points="50,2 54,6 46,6" fill="#FFD700" />
                    <polygon points="27,25 31,21 31,29" fill="#FFD700" />
                    <polygon points="73,25 69,21 69,29" fill="#FFD700" />
                </svg>
            </div>
        </>
    );
};

export default CustomCursor;
