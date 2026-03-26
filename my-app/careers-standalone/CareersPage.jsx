import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Import local standalone dependencies
import { useCareerController } from './CareerLogic';
import { JobCard, JobDetail } from './JobComponents';
import './theme.css';
import './CareersPage.css';

/**
 * CareersPage - Standalone Version
 * To use: Import this component and wrap it in a <BrowserRouter> or <MemoryRouter>.
 * 
 * @param {string} apiBase - The base URL for your Job API (optional, defaults to '/api')
 */
const AppCareers = ({ apiBase = '/api' }) => {
    const { jobs, loading, error, selectedJob, setSelectedJob } = useCareerController(apiBase);
    const navigate = useNavigate();

    function handleApply(job) {
        // Redirect to your application form
        navigate(`/careers/apply?roleTitle=${encodeURIComponent(job.title)}`);
    }

    return (
        <div className="careers-standalone-wrapper">
          <div className="careers-page">
              <div className="careers-hero">
                  <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="container"
                  >
                      <span className="phi-label">Join the Studio</span>
                      <h1 className="careers-hero__title">Build the Next Legend</h1>
                      <p className="careers-hero__sub">
                          Looking for passionate creators to help craft an experience
                          unlike anything the world has seen.
                      </p>
                  </motion.div>
              </div>

              <div className="container careers-layout">
                  {loading && (
                      <div className="careers-loading">
                          <div className="hex-pulse" />
                          <p>Loading open roles…</p>
                      </div>
                  )}

                  {error && (
                      <div className="careers-error">
                          <p>{error}</p>
                      </div>
                  )}

                  {!loading && !error && jobs.length === 0 && (
                      <div className="careers-empty">
                          <p>No open roles right now. Check back soon.</p>
                      </div>
                  )}

                  {!loading && !error && jobs.length > 0 && (
                      <div className="careers-split">
                          <aside className="careers-list">
                              {jobs.map((job) => (
                                  <JobCard
                                      key={job.jobId || job.title}
                                      job={job}
                                      isSelected={selectedJob?.jobId === job.jobId && selectedJob?.title === job.title}
                                      onClick={setSelectedJob}
                                  />
                              ))}
                          </aside>

                          <div className="careers-detail">
                              <AnimatePresence mode="wait">
                                  {selectedJob ? (
                                      <JobDetail key={selectedJob.jobId || selectedJob.title} job={selectedJob} onApply={handleApply} />
                                  ) : (
                                      <motion.p
                                          key="hint"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          className="careers-hint"
                                      >
                                          ← Select a role to view details
                                      </motion.p>
                                  )}
                              </AnimatePresence>
                          </div>
                      </div>
                  )}
              </div>
          </div>
        </div>
    );
};

export default AppCareers;
