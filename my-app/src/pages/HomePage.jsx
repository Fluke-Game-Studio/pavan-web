import React from 'react';
import Hero from '../views/Hero';
import ProjectsGrid from '../views/ProjectsGrid';
import Philosophy from '../views/Philosophy';

const HomePage = () => {
    return (
        <main>
            <Hero />
            <div className="content-sheet">
                <ProjectsGrid />
                <div className="mythic-line" />
                <Philosophy />
            </div>
        </main>
    );
};

export default HomePage;
