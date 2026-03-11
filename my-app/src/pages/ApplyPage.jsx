import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Controller (Business Logic)
import { useApplicationController } from '../controllers/applicationController';

// ─── Field Renderers ────────────────────────────────────────────────────────

const FieldInput = ({ field, value, onChange }) => {
    const base = 'apply-field';

    if (field.type === 'textarea') {
        return (
            <textarea
                className={`${base}__textarea`}
                id={field.id}
                value={value || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                rows={5}
            />
        );
    }

    if (field.type === 'radio' && field.options?.length) {
        return (
            <div className={`${base}__radio-group`}>
                {field.options.map((opt) => (
                    <label key={opt} className={`${base}__radio-label ${value === opt ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name={field.id}
                            value={opt}
                            checked={value === opt}
                            onChange={() => onChange(field.id, opt)}
                            required={field.required}
                        />
                        <span>{opt}</span>
                    </label>
                ))}
            </div>
        );
    }

    if (field.type === 'checkbox' && field.options?.length) {
        const checked = Array.isArray(value) ? value : [];
        return (
            <div className={`${base}__radio-group`}>
                {field.options.map((opt) => (
                    <label key={opt} className={`${base}__radio-label ${checked.includes(opt) ? 'selected' : ''}`}>
                        <input
                            type="checkbox"
                            value={opt}
                            checked={checked.includes(opt)}
                            onChange={(e) => {
                                const next = e.target.checked
                                    ? [...checked, opt]
                                    : checked.filter((v) => v !== opt);
                                onChange(field.id, next);
                            }}
                        />
                        <span>{opt}</span>
                    </label>
                ))}
            </div>
        );
    }

    return (
        <input
            className={`${base}__input`}
            id={field.id}
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
        />
    );
};

const ApplyField = ({ field, value, onChange }) => (
    <div className="apply-field">
        <label className="apply-field__label" htmlFor={field.id}>
            {field.label}
            {field.required && <span className="apply-field__req"> *</span>}
        </label>
        {field.helpText && <p className="apply-field__help">{field.helpText}</p>}
        <FieldInput field={field} value={value} onChange={onChange} />
    </div>
);

// ─── Chapter ────────────────────────────────────────────────────────────────

const Chapter = ({ chapter, answers, setAnswer, chapterIndex }) => (
    <motion.div
        key={chapterIndex}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.4 }}
        className="apply-chapter"
    >
        <h2 className="apply-chapter__title volt-glow">{chapter.title}</h2>
        {chapter.description && (
            <p className="apply-chapter__desc">{chapter.description}</p>
        )}
        <div className="apply-chapter__fields">
            {chapter.fields?.length > 0 ? (
                chapter.fields.map((field) => (
                    <ApplyField
                        key={field.id}
                        field={field}
                        value={answers[field.id]}
                        onChange={setAnswer}
                    />
                ))
            ) : (
                <p className="apply-chapter__empty">No fields for this section.</p>
            )}
        </div>
    </motion.div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

const ApplyPage = () => {
    const [searchParams] = useSearchParams();
    const roleTitle = searchParams.get('roleTitle') || '';

    const {
        flow,
        loading,
        error,
        currentChapter,
        answers,
        setAnswer,
        nextChapter,
        prevChapter,
        validateChapter,
        isSubmitting,
        isSubmitted,
        submitError,
        submitReceipt,
        submit,
    } = useApplicationController(roleTitle);

    if (loading) {
        return (
            <div className="apply-page apply-page--centered">
                <div className="hex-pulse" />
                <p>Loading application form…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="apply-page apply-page--centered">
                <p className="apply-error">{error}</p>
                <Link to="/careers" className="btn btn-outline" style={{ marginTop: '2rem' }}>
                    ← Back to Careers
                </Link>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="apply-page apply-page--centered">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="apply-success"
                >
                    <div className="apply-success__icon">✓</div>
                    <h2>Application Received</h2>
                    <p>
                        Thank you for applying to <strong>{roleTitle}</strong>. We'll be in
                        touch if your profile matches what we're looking for.
                    </p>
                    {submitReceipt?.applicationId && (
                        <p className="apply-success__ref">
                            Reference: <code>{submitReceipt.applicationId}</code>
                        </p>
                    )}
                    <Link to="/careers" className="btn btn-gold" style={{ marginTop: '2.5rem' }}>
                        ← Back to Careers
                    </Link>
                </motion.div>
            </div>
        );
    }

    const chapter = flow?.chapters?.[currentChapter];
    const totalChapters = flow?.chapters?.length || 0;
    const isLastChapter = currentChapter === totalChapters - 1;
    const progress = totalChapters > 1 ? ((currentChapter + 1) / totalChapters) * 100 : 100;
    const canProceed = validateChapter(chapter);

    return (
        <div className="apply-page">
            <div className="container apply-container">

                {/* Intro header */}
                <div className="apply-header">
                    <Link to="/careers" className="apply-back">← Careers</Link>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <span className="phi-label">{flow?.role?.title}</span>
                        <h1 className="apply-title">{flow?.intro?.title}</h1>
                        {flow?.intro?.body?.map((line, i) =>
                            line ? <p key={i} className="apply-intro-body">{line}</p> : <br key={i} />
                        )}
                        <div className="apply-intro-note">{flow?.intro?.note}</div>
                    </motion.div>
                </div>

                {/* Progress bar */}
                <div className="apply-progress">
                    <div className="apply-progress__bar" style={{ width: `${progress}%` }} />
                </div>
                <div className="apply-progress__label">
                    Step {currentChapter + 1} of {totalChapters}
                </div>

                {/* Chapter */}
                <AnimatePresence mode="wait">
                    <Chapter
                        key={currentChapter}
                        chapter={chapter}
                        answers={answers}
                        setAnswer={setAnswer}
                        chapterIndex={currentChapter}
                    />
                </AnimatePresence>

                {/* Navigation */}
                {submitError && <p className="apply-error">{submitError}</p>}

                <div className="apply-nav">
                    {currentChapter > 0 && (
                        <button className="btn btn-outline" onClick={prevChapter}>
                            ← Back
                        </button>
                    )}

                    {isLastChapter ? (
                        <button
                            className="btn btn-gold"
                            onClick={submit}
                            disabled={isSubmitting || !canProceed}
                        >
                            {isSubmitting ? 'Submitting…' : 'Submit Application →'}
                        </button>
                    ) : (
                        <button
                            className="btn btn-gold"
                            onClick={nextChapter}
                            disabled={!canProceed}
                        >
                            Next →
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ApplyPage;
