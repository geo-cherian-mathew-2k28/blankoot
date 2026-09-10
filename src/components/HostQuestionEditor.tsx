import React, { useState, useRef, useMemo } from 'react';
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
  Image as ImageIcon,
  Copy,
  Search,
  Flame,
} from 'lucide-react';
import { Question } from '../App';
import { blankspaceMasterQuestions } from '../data/quizQuestions';
import { sfx } from '../utils/sfx';

const OPTION_THEMES = [
  { label: 'Triangle', colorName: 'Red', bg: '#e21b3c', border: '#fecaca', letter: '▲', symbolColor: '#ffffff' },
  { label: 'Diamond', colorName: 'Blue', bg: '#1368ce', border: '#bfdbfe', letter: '◆', symbolColor: '#ffffff' },
  { label: 'Circle', colorName: 'Yellow', bg: '#d89e00', border: '#fef3c7', letter: '●', symbolColor: '#ffffff' },
  { label: 'Square', colorName: 'Green', bg: '#26890c', border: '#bbf7d0', letter: '■', symbolColor: '#ffffff' },
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questionList;
    const q = searchQuery.toLowerCase();
    return questionList.filter((item) =>
      item.text.toLowerCase().includes(q) ||
      item.options.some((opt) => opt.toLowerCase().includes(q))
    );
  }, [questionList, searchQuery]);

  // Form State for Editing/Adding
  const [formText, setFormText] = useState('');
  const [formImage, setFormImage] = useState<string>('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState<number>(0);
  const [formTimeLimit, setFormTimeLimit] = useState<number>(20);
  const [formMultiplier, setFormMultiplier] = useState<number>(1);
  const [formError, setFormError] = useState<string>('');
  const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('file');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNewQuestionForm = () => {
    sfx.click();
    setEditingIndex(-1); // -1 indicates creating a new question
    setFormText('');
    setFormImage('');
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
    setFormImage(q.image || q.mediaUrl || '');
    setFormOptions([...q.options]);
    setFormCorrect(q.correctAnswer ?? 0);
    setFormTimeLimit(q.timeLimit || 20);
    setFormMultiplier((q as any).multiplier || 1);
    setFormError('');
  };

  const handleDuplicateQuestion = (index: number) => {
    sfx.click();
    const target = questionList[index];
    if (!target) return;

    const duplicated: Question = {
      ...target,
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      text: `${target.text} (Copy)`,
      options: [...target.options],
    };

    const updated = [...questionList];
    updated.splice(index + 1, 0, duplicated);
    setQuestionList(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Image file is too large (max 10MB). Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;

      // Keep SVGs and GIFs in their original format
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        setFormImage(rawDataUrl);
        setFormError('');
        sfx.tick();
        return;
      }

      // Optimize PNG / JPEG / WebP via offscreen canvas for super-fast WebSocket broadcasting across deployed environments
      const img = new Image();
      img.onload = () => {
        try {
          const maxDimension = 1000;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setFormImage(optimizedDataUrl);
          } else {
            setFormImage(rawDataUrl);
          }
          setFormError('');
          sfx.tick();
        } catch {
          setFormImage(rawDataUrl);
          setFormError('');
          sfx.tick();
        }
      };
      img.onerror = () => {
        setFormImage(rawDataUrl);
        setFormError('');
        sfx.tick();
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
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
      image: formImage.trim() || undefined,
      mediaUrl: formImage.trim() || undefined,
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
          {/* Question Editor / Creator Panel */}
          {editingIndex !== null && (
            <form
              onSubmit={handleSaveForm}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '2px solid var(--accent-purple)',
                borderRadius: '20px',
                padding: '22px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                marginBottom: '10px',
                animation: 'rowPopIn 0.25s ease-out',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '14px', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {editingIndex === -1 ? '✨ CREATE NEW QUESTION' : `✏️ EDIT QUESTION #${editingIndex + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
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
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '14px',
                  }}
                >
                  ⚠️ {formError}
                </div>
              )}

              {/* Question Text */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  QUESTION TITLE / PROMPT
                </label>
                <input
                  type="text"
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="e.g. Which programming language powers interactive web development?"
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

              {/* Optional Question Image Section */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    <ImageIcon size={15} color="var(--accent-purple)" />
                    <span>QUESTION VISUAL / IMAGE (OPTIONAL)</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('file')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        background: imageInputMode === 'file' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.08)',
                        color: '#fff',
                      }}
                    >
                      📁 Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        background: imageInputMode === 'url' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.08)',
                        color: '#fff',
                      }}
                    >
                      🔗 Paste Link
                    </button>
                  </div>
                </div>

                {imageInputMode === 'file' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="tactile-btn btn-surface"
                      style={{ padding: '8px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Upload size={14} /> Choose Image from Device
                    </button>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Supports PNG, JPG, WebP, GIF (Max 5MB)
                    </span>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="Paste Image URL (e.g. https://images.unsplash.com/... or Imgur link)"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'var(--bg-surface)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                )}

                {/* Live Image Preview */}
                {formImage && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        position: 'relative',
                        width: '90px',
                        height: '65px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '2px solid var(--accent-purple)',
                        background: '#000',
                      }}
                    >
                      <img
                        src={formImage}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#4ade80' }}>
                        ✓ Image Attached
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormImage('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f87171',
                          fontSize: '11px',
                          cursor: 'pointer',
                          padding: 0,
                          textAlign: 'left',
                          fontWeight: 700,
                        }}
                      >
                        ✕ Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4 Answer Options (Color Badged) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                {formOptions.map((opt, i) => {
                  const theme = OPTION_THEMES[i];
                  const isCorrect = formCorrect === i;
                  return (
                    <div
                      key={i}
                      style={{
                        background: isCorrect ? 'rgba(38, 137, 12, 0.15)' : 'var(--bg-surface)',
                        border: `2px solid ${isCorrect ? '#26890c' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '14px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'border 0.2s, background 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            background: theme.bg,
                            color: theme.symbolColor,
                            fontSize: '11px',
                            fontWeight: 900,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {theme.letter} {theme.label}
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
                          {isCorrect ? '✓ Correct' : 'Mark Correct'}
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
                        placeholder={`Option ${i + 1} text`}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.12)',
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
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '5px', color: 'var(--text-secondary)' }}>
                    TIME LIMIT
                  </label>
                  <select
                    value={formTimeLimit}
                    onChange={(e) => setFormTimeLimit(Number(e.target.value))}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
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
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '5px', color: 'var(--text-secondary)' }}>
                    POINT SCORING
                  </label>
                  <select
                    value={formMultiplier}
                    onChange={(e) => setFormMultiplier(Number(e.target.value))}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
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
                  style={{ padding: '9px 18px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn btn-pink"
                  style={{ padding: '9px 24px', fontSize: '13px', fontWeight: 800 }}
                >
                  <Check size={16} /> Save Question
                </button>
              </div>
            </form>
          )}

          {/* Search / Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '8px 14px',
              }}
            >
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or answer keywords..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '13px',
                  width: '100%',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Showing {filteredQuestions.length} of {questionList.length}
            </span>
          </div>

          {/* Question List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredQuestions.map((q) => {
              const actualIdx = questionList.findIndex((item) => item.id === q.id);
              const isEditingThis = editingIndex === actualIdx;
              const hasImage = !!(q.image || q.mediaUrl);

              return (
                <div
                  key={q.id || actualIdx}
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
                        disabled={actualIdx === 0}
                        onClick={() => handleMove(actualIdx, 'up')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: actualIdx === 0 ? 'rgba(255,255,255,0.15)' : 'var(--text-secondary)',
                          cursor: actualIdx === 0 ? 'default' : 'pointer',
                          padding: '2px',
                        }}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={actualIdx === questionList.length - 1}
                        onClick={() => handleMove(actualIdx, 'down')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: actualIdx === questionList.length - 1 ? 'rgba(255,255,255,0.15)' : 'var(--text-secondary)',
                          cursor: actualIdx === questionList.length - 1 ? 'default' : 'pointer',
                          padding: '2px',
                        }}
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
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
                      #{actualIdx + 1}
                    </div>
                  </div>

                  {/* Thumbnail if present */}
                  {hasImage && (
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.2)',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={q.image || q.mediaUrl}
                        alt="Thumbnail"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {/* Middle: Question Text & Meta */}
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                      {q.text}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {q.timeLimit || 20}s
                      </span>
                      {(q as any).multiplier === 2 && (
                        <span style={{ color: '#f59e0b', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Flame size={12} /> 2X Points
                        </span>
                      )}
                      {hasImage && (
                        <span style={{ color: 'var(--accent-purple)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <ImageIcon size={12} /> Image Attached
                        </span>
                      )}
                      <span style={{ color: '#4ade80', fontWeight: 700 }}>
                        ✓ {q.options[q.correctAnswer]}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions (Edit, Duplicate, Delete) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => openEditQuestionForm(actualIdx)}
                      className="tactile-btn btn-surface"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      title="Edit Question"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(actualIdx)}
                      className="tactile-btn btn-surface"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      title="Duplicate Question"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(actualIdx)}
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
                      <Trash2 size={13} />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
