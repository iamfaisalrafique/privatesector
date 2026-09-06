import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Upload, 
  Play, 
  Pause, 
  Check, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  Save, 
  X, 
  Radio, 
  FileText, 
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Search,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function MorningBriefingAdmin({ navigate, adminAction, adminId }) {
  const [briefings, setBriefings] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null); // null or briefing object
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAudioUrl, setFormAudioUrl] = useState('');
  const [formDuration, setFormDuration] = useState(0);
  const [formTranscript, setFormTranscript] = useState('');
  const [formSelectedArticles, setFormSelectedArticles] = useState([]); // array of article IDs
  const [formStatus, setFormStatus] = useState('published');

  // Audio Mode & Recorder State
  const [audioInputMode, setAudioInputMode] = useState('record'); // 'record' | 'upload'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  // Article Search Filter
  const [articleSearch, setArticleSearch] = useState('');

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const recognitionRef = useRef(null);

  // 1. Fetch briefings and news articles
  const loadData = async () => {
    setLoading(true);
    try {
      const [briefingsRes, newsRes] = await Promise.all([
        fetch('/api/morning-briefings'),
        fetch('/api/news')
      ]);

      if (briefingsRes.ok) {
        const bData = await briefingsRes.json();
        setBriefings(Array.isArray(bData) ? bData : []);
      }
      if (newsRes.ok) {
        const nData = await newsRes.json();
        setNewsList(Array.isArray(nData) ? nData : []);
      }
    } catch (err) {
      console.error('Error loading briefing admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format today's date string
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getTodayFormattedTitle = () => {
    const today = new Date();
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return `PrivateSector Morning Briefing — ${today.toLocaleDateString('en-US', options)}`;
  };

  const generateScriptFromArticles = (articleIds, dateStr) => {
    const selected = (newsList || []).filter(a => (articleIds || []).includes(a.id));
    const dateFormatted = dateStr || getTodayFormattedTitle();
    if (selected.length === 0) {
      return `Good morning and welcome to the PrivateSector Morning Briefing for ${dateFormatted}. In today's briefing, we cover key commercial and macroeconomic developments across Switzerland and global markets. Listen to the full audio briefing for complete insights.`;
    }
    const headlines = selected.map((a, i) => `${i + 1}. ${a.title} (${a.category || 'General'})`).join('\n');
    return `Good morning and welcome to the PrivateSector Morning Briefing for ${dateFormatted}.\n\nIn today's briefing, we cover:\n${headlines}\n\nFollow each linked report below for full commercial analysis and strategic intelligence.`;
  };

  // Open Create Form
  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setEditingItem({ id: null });
    const todayDate = getTodayDate();
    const formattedTitle = getTodayFormattedTitle();
    setFormDate(todayDate);
    setFormTitle(formattedTitle);
    setFormImageUrl('');
    setFormAudioUrl('');
    setFormDuration(0);
    // Pre-select the top 3 latest articles automatically for convenience
    const top3Ids = (newsList || []).slice(0, 3).map(a => a.id);
    setFormSelectedArticles(top3Ids);
    setFormTranscript(generateScriptFromArticles(top3Ids, todayDate));
    setFormStatus('published');
    setRecordedAudioBlob(null);
    setRecordingSeconds(0);
  };

  // Open Edit Form
  const handleStartEdit = (briefing) => {
    setIsCreatingNew(false);
    setEditingItem(briefing);
    setFormDate(briefing.date || getTodayDate());
    setFormTitle(briefing.title || '');
    setFormImageUrl(briefing.image_url || '');
    setFormAudioUrl(briefing.audio_url || '');
    setFormDuration(briefing.audio_duration || 0);
    setFormTranscript(briefing.transcript || '');
    
    let articles = [];
    try {
      articles = typeof briefing.linked_articles === 'string'
        ? JSON.parse(briefing.linked_articles || '[]')
        : (briefing.linked_articles || []);
    } catch (e) {
      articles = [];
    }
    setFormSelectedArticles(articles);
    setFormStatus(briefing.status || 'published');
    setRecordedAudioBlob(null);
    setRecordingSeconds(0);
  };

  // Sync URL routes with briefing state
  useEffect(() => {
    if (adminAction === 'new') {
      handleStartCreate();
    } else if (adminAction === 'edit' && adminId) {
      const existing = briefings.find(b => String(b.id) === String(adminId));
      if (existing) {
        handleStartEdit(existing);
      } else {
        fetch(`/api/morning-briefings/${adminId}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) handleStartEdit(data);
          })
          .catch(console.error);
      }
    } else if (adminAction === 'delete') {
      // Handled by modal
    } else {
      setEditingItem(null);
      setIsCreatingNew(false);
    }
  }, [adminAction, adminId, briefings, newsList]);

  const handleCancel = () => {
    setEditingItem(null);
    setIsCreatingNew(false);
    if (isRecording) stopRecording();
    if (navigate) navigate('/admin/morning-briefing');
  };

  // --- AUDIO RECORDING (In-browser microphone) ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);

        // Upload recorded blob to server immediately
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          await uploadAudioBase64(base64Audio, `recorded_briefing_${formDate}`);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      // Optional: Start live Web Speech recognition for real-time transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0].transcript + ' ';
            }
            if (fullText.trim()) {
              setFormTranscript(prev => prev ? `${prev} ${fullText.trim()}` : fullText.trim());
            }
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('Live SpeechRecognition not supported or permitted in this browser.');
        }
      }
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required to record audio directly in the browser. Please allow microphone permissions or use file upload.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    // If transcript is still empty, populate from selected articles
    setFormTranscript(prev => {
      if (!prev || !prev.trim()) {
        return generateScriptFromArticles(formSelectedArticles, formDate);
      }
      return prev;
    });
  };

  // Upload base64 audio to server
  const uploadAudioBase64 = async (base64Audio, filename) => {
    setUploadingAudio(true);
    try {
      const res = await fetch('/api/morning-briefings/upload-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio, filename })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setFormAudioUrl(data.url);
          setFormDuration(recordingSeconds || 180);
        }
      } else {
        alert('Failed to upload audio to server.');
      }
    } catch (err) {
      console.error('Audio upload failed:', err);
      alert('Audio upload failed.');
    } finally {
      setUploadingAudio(false);
    }
  };

  // --- AUDIO FILE UPLOAD (External file) ---
  const handleAudioFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('Audio file is too large. Please select a file under 50MB.');
      return;
    }

    setUploadingAudio(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Audio = evt.target.result;
      await uploadAudioBase64(base64Audio, file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  // --- IMAGE UPLOAD ---
  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 15MB.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: evt.target.result, filename: file.name })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) setFormImageUrl(data.url);
        } else {
          setFormImageUrl(evt.target.result);
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        setFormImageUrl(evt.target.result);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- TRANSCRIBE BUTTON ---
  const handleTriggerTranscription = async () => {
    if (!formAudioUrl) {
      alert('Please record or upload an audio file first.');
      return;
    }

    setTranscribing(true);
    try {
      const res = await fetch('/api/morning-briefings/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: formAudioUrl })
      });

      const data = await res.json();
      if (data.success && data.transcript) {
        setFormTranscript(data.transcript);
      } else {
        const generated = generateScriptFromArticles(formSelectedArticles, formDate);
        setFormTranscript(generated);
        alert('External speech-to-text API is not active. A structured briefing script has been drafted from your selected articles. You can freely edit or customize it.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      const generated = generateScriptFromArticles(formSelectedArticles, formDate);
      setFormTranscript(generated);
    } finally {
      setTranscribing(false);
    }
  };

  // Toggle article selection
  const toggleArticleSelection = (id) => {
    setFormSelectedArticles(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 5) {
          alert('You can link up to 5 articles per briefing.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // --- SAVE BRIEFING ---
  const handleSaveBriefing = async (e) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      alert('Please provide a title for the briefing.');
      return;
    }
    if (!formAudioUrl) {
      alert('Please upload or record an audio file before publishing.');
      return;
    }

    const payload = {
      title: formTitle.trim(),
      date: formDate,
      image_url: formImageUrl,
      audio_url: formAudioUrl,
      audio_duration: formDuration || recordingSeconds || 180,
      transcript: formTranscript,
      linked_articles: formSelectedArticles,
      status: formStatus
    };

    try {
      const url = isCreatingNew ? '/api/morning-briefings' : `/api/morning-briefings/${editingItem.id}`;
      const method = isCreatingNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Morning Briefing published successfully!');
        setEditingItem(null);
        setIsCreatingNew(false);
        await loadData();
        if (navigate) navigate('/admin/morning-briefing');
      } else {
        const error = await res.json();
        alert(`Failed to save: ${error.error}`);
      }
    } catch (err) {
      console.error('Error saving briefing:', err);
      alert('Save failed.');
    }
  };

  // --- DELETE BRIEFING ---
  const handleDeleteBriefing = async (id) => {
    if (navigate) {
      navigate('/admin/morning-briefing/delete/' + id);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this morning briefing?')) return;
    try {
      const res = await fetch(`/api/morning-briefings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Deleted successfully.');
        loadData();
      }
    } catch (err) {
      console.error('Error deleting briefing:', err);
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredNews = (newsList || []).filter(item => {
    if (!articleSearch.trim()) return true;
    const query = articleSearch.toLowerCase();
    return (item.title || '').toLowerCase().includes(query) || (item.category || '').toLowerCase().includes(query);
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1.5px solid #E2E8F0',
        paddingBottom: '20px',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ backgroundColor: 'var(--primary-red, #D52B1E)', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
              DAILY AUDIO
            </span>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
              PrivateSector Morning Briefing Studio
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#64748B' }}>
            Record audio, attach daily infographics, and select 3–5 news articles in 2–3 minutes.
          </p>
        </div>

        {!editingItem && (
          <button
            type="button"
            onClick={handleStartCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--primary-red, #D52B1E)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 18px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(213, 43, 30, 0.3)'
            }}
          >
            <PlusCircle size={16} /> New Daily Briefing
          </button>
        )}
      </div>

      {/* CREATE / EDIT FORM */}
      {editingItem ? (
        <form onSubmit={handleSaveBriefing} style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {isCreatingNew ? 'Create New Daily Morning Briefing' : 'Edit Morning Briefing'}
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{ padding: '8px 16px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', backgroundColor: 'var(--primary-red, #D52B1E)', border: 'none', color: '#FFFFFF', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
              >
                <Save size={15} /> Publish Briefing
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* STEP 1: Date & Title */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Briefing Date *
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '6px', fontSize: '14px', fontWeight: 500 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Briefing Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. PrivateSector Morning Briefing — September 6, 2026"
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '6px', fontSize: '14px', fontWeight: 600 }}
                />
              </div>
            </div>

            {/* STEP 2: Cover Image / Infographic */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={15} style={{ color: 'var(--primary-red, #D52B1E)' }} /> Cover Image or Infographic
                </span>
                {formImageUrl && (
                  <button
                    type="button"
                    onClick={() => setFormImageUrl('')}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} /> Remove Image
                  </button>
                )}
              </div>

              {formImageUrl ? (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', marginBottom: '12px' }}>
                  <img src={formImageUrl} alt="Preview" style={{ width: '120px', height: '70px', objectFit: 'cover', borderRadius: '4px' }} />
                  <span style={{ fontSize: '12px', color: '#475569', wordBreak: 'break-all', fontFamily: 'monospace' }}>{formImageUrl}</span>
                </div>
              ) : null}

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px', alignItems: 'center' }}>
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  backgroundColor: 'var(--primary-red, #D52B1E)',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  cursor: uploadingImage ? 'wait' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 3px rgba(213, 43, 30, 0.3)',
                  transition: 'opacity 0.15s ease',
                  opacity: uploadingImage ? 0.7 : 1
                }}>
                  <Upload size={16} color="#FFFFFF" />
                  <span style={{ color: '#FFFFFF', fontWeight: 700 }}>
                    {uploadingImage ? 'Uploading Image...' : 'Upload Image File'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} style={{ display: 'none' }} />
                </label>

                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="Or enter public image URL (e.g. /uploads/infographic.jpg)"
                  style={{ width: '100%', padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* STEP 3: Audio Studio (Record Mic or File Upload) */}
            <div style={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: '10px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '14px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ backgroundColor: 'var(--primary-red, #D52B1E)', color: '#FFFFFF', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                    3
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Audio Recording & File Studio *
                  </span>
                </div>

                {/* Mode Selector Toggle */}
                <div style={{ display: 'flex', backgroundColor: '#1E293B', padding: '3px', borderRadius: '6px', border: '1px solid #334155' }}>
                  <button
                    type="button"
                    onClick={() => setAudioInputMode('record')}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: audioInputMode === 'record' ? 'var(--primary-red, #D52B1E)' : 'transparent',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Mic size={14} /> Record in Browser
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioInputMode('upload')}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: audioInputMode === 'upload' ? 'var(--primary-red, #D52B1E)' : 'transparent',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Upload size={14} /> Upload Audio File
                  </button>
                </div>
              </div>

              {/* Sub-mode A: In-Browser Mic Recording */}
              {audioInputMode === 'record' ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  {isRecording ? (
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#7F1D1D', color: '#FCA5A5', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', animation: 'pulse 1s infinite' }} />
                        Recording Live... ({formatTimer(recordingSeconds)})
                      </div>
                      <br />
                      <button
                        type="button"
                        onClick={stopRecording}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          backgroundColor: '#EF4444',
                          border: 'none',
                          color: '#FFFFFF',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 0 16px rgba(239, 68, 68, 0.6)'
                        }}
                      >
                        <Square size={24} />
                      </button>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '10px' }}>
                        Click to Stop & Save Recording
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={startRecording}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-red, #D52B1E)',
                          border: 'none',
                          color: '#FFFFFF',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(213, 43, 30, 0.5)',
                          transition: 'transform 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Mic size={26} />
                      </button>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E8F0', marginTop: '10px' }}>
                        Click Microphone to Start Recording
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        Uses your device microphone with real-time speech transcription.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Sub-mode B: External Audio File Upload */
                <div style={{ padding: '16px 0', textAlign: 'center' }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: 'var(--primary-red, #D52B1E)',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    cursor: uploadingAudio ? 'wait' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(213, 43, 30, 0.4)'
                  }}>
                    <Upload size={16} color="#FFFFFF" />
                    <span style={{ color: '#FFFFFF', fontWeight: 700 }}>
                      {uploadingAudio ? 'Uploading Audio...' : 'Choose Audio File (.mp3, .wav, .m4a, .webm)'}
                    </span>
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
                      onChange={handleAudioFileUpload}
                      disabled={uploadingAudio}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '8px' }}>
                    Standard audio formats supported (up to 50MB).
                  </div>
                </div>
              )}

              {/* Audio URL & Player Preview Bar */}
              {formAudioUrl && (
                <div style={{ marginTop: '16px', backgroundColor: '#1E293B', padding: '12px 16px', borderRadius: '6px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Check size={14} /> Audio Ready:
                    </span>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
                      {formAudioUrl}
                    </span>
                  </div>
                  <audio controls src={formAudioUrl} style={{ width: '100%', height: '36px' }} />
                </div>
              )}
            </div>

            {/* STEP 4: Audio Transcription */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} style={{ color: 'var(--primary-red, #D52B1E)' }} /> Audio Transcript & Written Script
                </span>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const drafted = generateScriptFromArticles(formSelectedArticles, formDate);
                      setFormTranscript(drafted);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    title="Generate written briefing script from your selected articles"
                  >
                    <FileText size={13} style={{ color: 'var(--primary-red, #D52B1E)' }} />
                    Draft Script from Articles
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerTranscription}
                    disabled={transcribing || !formAudioUrl}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: transcribing ? 'wait' : 'pointer',
                      opacity: formAudioUrl ? 1 : 0.5
                    }}
                  >
                    <Sparkles size={13} style={{ color: '#F59E0B' }} />
                    {transcribing ? 'Transcribing...' : 'Auto-Transcribe Audio'}
                  </button>
                </div>
              </div>

              <textarea
                value={formTranscript}
                onChange={(e) => setFormTranscript(e.target.value)}
                rows={5}
                placeholder="Spoken audio transcription will appear here automatically, or you can paste your script..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '13.5px',
                  lineHeight: 1.6,
                  color: '#0F172A',
                  resize: 'vertical'
                }}
              />
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Readers can read this transcript under the audio player via the 'Read Audio Transcript' drawer.
              </div>
            </div>

            {/* STEP 5: Select 3–5 Linked Articles */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Stories Covered in this Briefing (Select 3 to 5) *
                  </label>
                  <span style={{ fontSize: '12px', color: formSelectedArticles.length >= 3 ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                    {formSelectedArticles.length} articles selected {formSelectedArticles.length >= 3 ? '✓' : '(Recommended: 3 to 5)'}
                  </span>
                </div>

                <div style={{ position: 'relative', width: '260px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Search articles to attach..."
                    style={{ width: '100%', padding: '7px 10px 7px 32px', backgroundColor: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '6px', fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* Scrollable list of articles with toggle checkboxes */}
              <div style={{
                maxHeight: '260px',
                overflowY: 'auto',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                padding: '8px'
              }}>
                {filteredNews.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                    No matching articles found.
                  </div>
                ) : (
                  filteredNews.map(item => {
                    const isSelected = formSelectedArticles.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleArticleSelection(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                          border: isSelected ? '1px solid #93C5FD' : '1px solid transparent',
                          cursor: 'pointer',
                          marginBottom: '4px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div onClick
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary-red, #D52B1E)' }}
                        />

                        {item.image_url && (
                          <img src={item.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary-red, #D52B1E)', textTransform: 'uppercase' }}>
                            {item.category}
                          </span>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>
                            {item.date_published}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Submit Action Deck */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{ padding: '10px 20px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 28px',
                  backgroundColor: 'var(--primary-red, #D52B1E)',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(213, 43, 30, 0.4)'
                }}
              >
                <Save size={16} /> Publish Daily Briefing
              </button>
            </div>

          </div>
        </form>
      ) : (
        /* BRIEFINGS LIST TABLE */
        <div>
          {briefings.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1.5px dashed #CBD5E1' }}>
              <Radio size={36} style={{ color: 'var(--primary-red, #D52B1E)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>No Morning Briefings Published Yet</h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: '0 0 20px 0' }}>Create your first daily audio briefing to show on the homepage.</p>
              <button
                type="button"
                onClick={() => navigate ? navigate('/admin/morning-briefing/new') : handleStartCreate()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: 'var(--primary-red, #D52B1E)', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                <PlusCircle size={15} /> Create First Briefing
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {briefings.map(item => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt="" style={{ width: '80px', height: '54px', borderRadius: '6px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '80px', height: '54px', borderRadius: '6px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Radio size={20} style={{ color: '#94A3B8' }} />
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-red, #D52B1E)', textTransform: 'uppercase' }}>
                          {item.date}
                        </span>
                        <span style={{ fontSize: '11px', backgroundColor: '#DCFCE7', color: '#15803D', padding: '1px 6px', borderRadius: '3px', fontWeight: 700 }}>
                          LIVE
                        </span>
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: '#0F172A' }}>
                        {item.title}
                      </h4>
                      <audio controls src={item.audio_url} style={{ height: '30px', maxWidth: '320px' }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => navigate ? navigate('/admin/morning-briefing/edit/' + item.id) : handleStartEdit(item)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#0F172A', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate ? navigate('/admin/morning-briefing/delete/' + item.id) : handleDeleteBriefing(item.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal for Morning Briefing */}
      {adminAction === 'delete' && adminId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '480px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626'
              }}>
                <Trash2 size={20} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Delete Morning Briefing
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
              Are you sure you want to permanently delete this Morning Briefing (ID #{adminId})? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => navigate ? navigate('/admin/morning-briefing') : null}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/morning-briefings/${adminId}`, { method: 'DELETE' });
                    if (res.ok) {
                      await loadData();
                      if (navigate) navigate('/admin/morning-briefing');
                    } else {
                      alert('Failed to delete briefing.');
                    }
                  } catch (err) {
                    console.error('Delete error:', err);
                    alert('Delete failed.');
                  }
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--primary-red, #D52B1E)',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={15} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
