// src/controllers/applicationController.js
// Business logic for managing job applications

import { useState, useEffect } from 'react';
import { fetchJobs } from '../models/careerModel';
import { buildApplicationFlow, submitApplication } from '../models/applicationModel';

/**
 * Controller hook for managing job application flow
 * Handles form state, navigation, validation, and submission
 */
export function useApplicationController(roleTitle) {
    const [flow, setFlow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentChapter, setCurrentChapter] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitReceipt, setSubmitReceipt] = useState(null);

    useEffect(() => {
        if (!roleTitle) return;
        let cancelled = false;

        setLoading(true);
        setError('');

        fetchJobs()
            .then((jobs) => {
                if (cancelled) return;

                const title = String(roleTitle).trim().toLowerCase();
                const job =
                    jobs.find((j) => String(j.title).trim().toLowerCase() === title) ||
                    jobs.find((j) => String(j.title).trim().toLowerCase().includes(title)) ||
                    null;

                if (!job) {
                    setError(`Role "${roleTitle}" not found.`);
                    return;
                }

                const built = buildApplicationFlow(job.raw || job);
                setFlow(built);
                setCurrentChapter(0);
                setAnswers({});
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err?.message || 'Failed to load application form.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [roleTitle]);

    function setAnswer(key, value) {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    }

    function validateChapter(chapter) {
        if (!chapter?.fields) return true;
        for (const field of chapter.fields) {
            if (field.required) {
                const val = answers[field.id];
                if (val === undefined || val === null || String(val).trim() === '') {
                    return false;
                }
            }
        }
        return true;
    }

    function nextChapter() {
        if (!flow) return;
        if (currentChapter < flow.chapters.length - 1) {
            setCurrentChapter((c) => c + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function prevChapter() {
        if (currentChapter > 0) {
            setCurrentChapter((c) => c - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    async function submit() {
        if (!flow) return;

        const ack = answers['ackVolunteer'];
        if (ack !== 'Agree and Submit') {
            setSubmitError('Please select "Agree and Submit" to confirm the acknowledgement.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const payload = {
                roleId: flow.role.id,
                roleTitle: flow.role.title,
                answers,
            };

            const receipt = await submitApplication(payload);

            setSubmitReceipt(receipt);
            setIsSubmitted(true);
        } catch (err) {
            setSubmitError(err?.message || 'Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        flow,
        loading,
        error,
        currentChapter,
        answers,
        setAnswer,
        validateChapter,
        nextChapter,
        prevChapter,
        submit,
        isSubmitting,
        isSubmitted,
        submitError,
        submitReceipt,
    };
}
