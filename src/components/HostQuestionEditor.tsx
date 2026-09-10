import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Download,
  Upload,
  Clock,
  Sparkles,
  X,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Question } from '../App';
import { blankspaceMasterQuestions } from '../data/quizQuestions';
import { sfx } from '../utils/sfx';

const OPTION_THEMES = [
  { label: 'Triangle (Red)', bg: '#e21b3c', border: '#fecaca', letter: '▲' },
  { label: 'Diamond (Blue)', bg: '#1368ce', border: '#bfdbfe', letter: '◆' },
  { label: 'Circle (Yellow)', bg: '#d89e00', border: '#fef3c7', letter: '●' },
  { label: 'Square (Green)', bg: '#26890c', border: '#bbf7d0', letter: '■' },
];

const TIME_LIMIT_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120];

interface HostQuestionEditorProps {
  questions: Question[];
  onSaveQuestions: (newQuestions: Question[]) => void;
  onClose: () => void;
}

export function HostQuestionEditor({
  questions,
  onSaveQuestions,
  onClose,
}: HostQuestionEditorProps) {
  const [questionList, setQuestionList] = useState<Question[]>(() => [...questions]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form State for Editing/Adding
  const [formText, setFormText] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState<number>(0);
  const [formTimeLimit, setFormTimeLimit] = useState<number>(20);
  const [formMultiplier, setFormMultiplier] = useState<number>(1);
  const [formError, setFormError] = useState<string>('');

  const openNewQuestionForm = () => {
    sfx.click();
    setEditingIndex(-1); // -1 indicates creating a new question
    setFormText('');
    setFormOptions(['', '', '', '']);
    setFormCorrect(0);
    setFormTimeLimit(20);
    setFormMultiplier(1);
    setFormError('');
  };

  const openEditQuestionForm = (index: number) => {
    sfx.click();
    const q = questionList[index];
    if (!q) return;
    setEditingIndex(index);
    setFormText(q.text);
    setFormOptions([...q.options]);
    setFormCorrect(q.correctAnswer ?? 0);
    setFormTimeLimit(q.timeLimit || 20);
    setFormMultiplier((q as any).multiplier || 1);
    setFormError('');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) {
      setFormError('Question text cannot be blank.');
      return;
    }

    if (formOptions.some((opt) => !opt.trim())) {
      setFormError('All 4 answer options must be filled.');
      return;
    }

    const newQ: Question = {
      id: editingIndex !== null && editingIndex >= 0 ? questionList[editingIndex].id : `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text: formText.trim(),
      options: formOptions.map((o) => o.trim()),
      correctAnswer: formCorrect,
      timeLimit: formTimeLimit,
    };
    (newQ as any).multiplier = formMultiplier;

    let updated: Question[];
    if (editingIndex === -1) {
      updated = [...questionList, newQ];
    } else if (editingIndex !== null && editingIndex >= 0) {
      updated = [...questionList];
      updated[editingIndex] = newQ;
    } else {
      updated = questionList;
    }

    setQuestionList(updated);
    setEditingIndex(null);
    sfx.correct();
  };

  const handleDeleteQuestion = (index: number) => {
    sfx.wrong();
    if (questionList.length <= 1) {
      alert('You must have at least 1 question in your quiz deck.');
      return;
    }
    const updated = questionList.filter((_, i) => i !== index);
    setQuestionList(updated);
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    sfx.tick();
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questionList.length) return;

    const updated = [...questionList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setQuestionList(updated);
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all questions back to the default Blankspace Orientation Master Quiz?')) {
      sfx.click();
      setQuestionList([...blankspaceMasterQuestions]);
      setEditingIndex(null);
    }
  };

  const handleExportJSON = () => {
    sfx.click();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questionList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `blankspace_quiz_deck_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].text && parsed[0].options) {
          setQuestionList(parsed);
          sfx.correct();
          alert(`Successfully loaded ${parsed.length} questions from JSON!`);
        } else {
          alert('Invalid JSON file format. Must be an array of question objects.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyChanges = () => {
    sfx.podiumFanfare();
    onSaveQuestions(questionList);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        className="solid-card"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-surface)',
          borderRadius: '24px',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1.5px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Layers size={22} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, margin: 0 }}>
                Presenter Question Manager
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                {questionList.length} Questions in Active Deck • Live Editable
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={openNewQuestionForm}
              className="tactile-btn btn-pink"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Plus size={16} /> Add Question
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Question Edit / Create Modal Form */}
          {editingIndex !== null && (
            <form
              onSubmit={handleSaveForm}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '2px solid var(--accent-purple)',
                borderRadius: '18px',
                padding: '20px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '14px', color: 'var(--accent-purple)' }}>
                  {editingIndex === -1 ? '✨ CREATE NEW QUESTION' : `✏️ EDIT QUESTION #${editingIndex + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>

              {formError && (
                <div
                  style={{
                    background: '#4c0519',
                    border: '1px solid #9f1239',
                    color: '#fecdd3',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginBottom: '12px',
                  }}
                >
                  {formError}
                </div>
              )}

              {/* Question Text */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  QUESTION TEXT
                </label>
                <input
                  type="text"
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="e.g. What is the flagship build sprint at Blankspace?"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'var(--bg-surface)',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '15px',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 4 Answer Options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {formOptions.map((opt, i) => {
                  const theme = OPTION_THEMES[i];
                  const isCorrect = formCorrect === i;
                  return (
                    <div
                      key={i}
                      style={{
                        background: 'var(--bg-surface)',
                        border: `2px solid ${isCorrect ? theme.bg : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '12px',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            background: theme.bg,
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          {theme.letter} Option {i + 1}
                        </span>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            color: isCorrect ? '#4ade80' : 'var(--text-muted)',
                          }}
                        >
                          <input
                            type="radio"
                            name="correctAnswerGroup"
                            checked={isCorrect}
                            onChange={() => setFormCorrect(i)}
                          />
                          {isCorrect ? '✓ Correct Answer' : 'Mark Correct'}
                        </label>
                      </div>

                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const nextOpts = [...formOptions];
                          nextOpts[i] = e.target.value;
                          setFormOptions(nextOpts);
                        }}
                        placeholder={`Option ${i + 1} answer text`}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.25)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontSize: '13px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Time Limit & Multiplier Controls */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    TIME LIMIT (SECONDS)
                  </label>
                  <select
                    value={formTimeLimit}
                    onChange={(e) => setFormTimeLimit(Number(e.target.value))}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  >
                    {TIME_LIMIT_OPTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        ⏱️ {sec} Seconds
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    POINTS MULTIPLIER
                  </label>
                  <select
                    value={formMultiplier}
                    onChange={(e) => setFormMultiplier(Number(e.target.value))}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  >
                    <option value={1}>⭐ Standard Points (1,000 pts max)</option>
                    <option value={2}>🔥 2X Double Points (2,000 pts max)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="tactile-btn btn-surface"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn btn-pink"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  <Check size={16} /> Save Question
                </button>
              </div>
            </form>
          )}

          {/* Question List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {questionList.map((q, idx) => {
              const isEditingThis = editingIndex === idx;
              return (
                <div
                  key={q.id || idx}
                  style={{
                    background: isEditingThis ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-surface-elevated)',
                    border: isEditingThis ? '2px solid var(--accent-purple)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'border 0.2s',
                  }}
                >
                  {/* Left: Reorder & Number */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: idx === 0 ? 'rgba(255,255,255,0.15)' : 'var(--text-secondary)',
                          cursor: idx === 0 ? 'default' : 'pointer',
                          padding: '2px',
                        }}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === questionList.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: idx === questionList.length - 1 ? 'rgba(255,255,255,0.15)' : 'var(--text-secondary)',
                          cursor: idx === questionList.length - 1 ? 'default' : 'pointer',
                          padding: '2px',
                        }}
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#10121a',
                        border: '1.5px solid #282c3c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Middle: Question Text & Meta */}
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                      {q.text}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {q.timeLimit || 20}s limit
                      </span>
                      {(q as any).multiplier === 2 && (
                        <span style={{ color: '#f59e0b', fontWeight: 800 }}>🔥 2X Points</span>
                      )}
                      <span style={{ color: '#4ade80', fontWeight: 700 }}>
                        ✓ {q.options[q.correctAnswer]}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => openEditQuestionForm(idx)}
                      className="tactile-btn btn-surface"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      title="Edit Question"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(idx)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                      title="Delete Question"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer: Bulk Actions & Apply */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1.5px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Deck Operations */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleExportJSON}
              className="tactile-btn btn-surface"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Download size={13} /> Export JSON
            </button>

            <label
              className="tactile-btn btn-surface"
              style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Upload size={13} /> Import JSON
              <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
            </label>

            <button
              type="button"
              onClick={handleResetToDefaults}
              className="tactile-btn btn-surface"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <RotateCcw size={13} /> Reset Defaults
            </button>
          </div>

          {/* Apply / Save to Game */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="tactile-btn btn-surface"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyChanges}
              className="tactile-btn btn-pink"
              style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 900 }}
            >
              <CheckCircle2 size={16} /> Apply Questions ({questionList.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
