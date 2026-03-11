import React, { useEffect, useRef } from 'react';

const AmbientBackground = () => {
    const canvasRef = useRef(null);
    const mouse = useRef({ x: -9999, y: -9999 });
    const animFrame = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Check theme and adjust star count/behavior
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        const STAR_COUNT = theme === 'light' ? 50 : 130;
        const REPULSION_RADIUS = 130;
        const REPULSION_STRENGTH = 5;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Initialise stars with home positions
        const stars = Array.from({ length: STAR_COUNT }, () => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const sizeMultiplier = theme === 'light' ? 0.4 : 1; // Smaller stars in light mode
            return {
                homeX: x,
                homeY: y,
                x,
                y,
                size: (Math.random() * 2.2 + 0.4) * sizeMultiplier,
                baseAlpha: theme === 'light' ? Math.random() * 0.25 + 0.08 : Math.random() * 0.6 + 0.2,
                alpha: 0,
                twinkleSeed: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                // Animated glow properties
                glowSeed: Math.random() * Math.PI * 2,
                glowSpeed: Math.random() * 0.02 + 0.008,
                glowIntensity: 1,
                // soft gold or white tint
                hue: Math.random() < 0.35 ? Math.random() * 25 + 40 : 0,
                sat: Math.random() < 0.35 ? 80 : 0,
            };
        });

        const onMove = (e) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };
        const onLeave = () => {
            mouse.current = { x: -9999, y: -9999 };
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseleave', onLeave);

        const lerp = (a, b, t) => a + (b - a) * t;

        let t = 0;
        const draw = () => {
            t += 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            stars.forEach((s) => {
                // Enhanced Twinkle effect
                s.alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.twinkleSeed) * 0.25;

                // Animated glow pulsation (separate from twinkle for varied effect)
                s.glowIntensity = 1 + Math.sin(t * s.glowSpeed + s.glowSeed) * 0.4;

                // Mouse repulsion
                const dx = s.x - mouse.current.x;
                const dy = s.y - mouse.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < REPULSION_RADIUS) {
                    const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS;
                    const angle = Math.atan2(dy, dx);
                    const pushX = Math.cos(angle) * force * REPULSION_STRENGTH;
                    const pushY = Math.sin(angle) * force * REPULSION_STRENGTH;
                    s.x = lerp(s.x, s.homeX + pushX * 12, 0.12);
                    s.y = lerp(s.y, s.homeY + pushY * 12, 0.12);
                    // Enhanced brighten when pushed with glow
                    s.alpha = Math.min(1, s.alpha + force * 0.8);
                } else {
                    // Drift back home
                    s.x = lerp(s.x, s.homeX, 0.04);
                    s.y = lerp(s.y, s.homeY, 0.04);
                }

                // Get CSS variables for theme-aware coloring
                const root = document.documentElement;
                const theme = root.getAttribute('data-theme') || 'dark';
                const starColor = getComputedStyle(root).getPropertyValue('--star-color').trim() || 'rgba(255,255,255,1)';
                const starGlow = getComputedStyle(root).getPropertyValue('--star-glow').trim() || 'rgba(255,255,255,0.3)';

                // Draw star with glow using theme colors
                const alpha = s.alpha;
                const color = starColor.replace(/[\d.]+\)$/g, `${alpha})`);
                const glowAlpha = alpha * 0.4 * s.glowIntensity; // Animated glow opacity
                const glowColor = starGlow.replace(/[\d.]+\)$/g, `${glowAlpha})`);

                // Animated glow size - pulsates between base size and larger size
                const baseGlowSize = theme === 'light' ? s.size * 1.5 : s.size * 4;
                const glowSize = baseGlowSize * s.glowIntensity;

                // Outer glow with enhanced animated effect
                const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowSize);
                grd.addColorStop(0, color);
                grd.addColorStop(0.5, glowColor);
                grd.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.beginPath();
                ctx.arc(s.x, s.y, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();

                // Hard core
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            });

            animFrame.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseleave', onLeave);
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
                    zIndex: 0,
                }}
            />
            {/* Radial vignette overlay */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 1,
                    background:
                        'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
                }}
            />
        </>
    );
};

export default AmbientBackground;
