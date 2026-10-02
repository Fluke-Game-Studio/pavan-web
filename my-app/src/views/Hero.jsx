import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

const MagneticButton = ({ children, className }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const ref = useRef(null);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        setPosition({ x: x * 0.3, y: y * 0.3 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.button>
    );
};

const Hero = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <section ref={containerRef} className="hero">
            <motion.div
                style={{ scale: videoScale, opacity }}
                className="hero-video-container"
            >
                <div className="video-overlay" />
                <div className="video-box">
                    <video
                        ref={videoRef}
                        className="hero-video"
                        autoPlay
                        muted
                        loop
                        playsInline
                        webkit-playsinline="true"
                        preload="metadata"
                    >
                        <source src="/trailer.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    <button
                        className="video-control"
                        onClick={togglePlay}
                        aria-label={isPlaying ? "Pause Video" : "Play Video"}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>


                    <div className="video-inner-glow" />
                </div>
            </motion.div>


        </section>
    );
};

export default Hero;
