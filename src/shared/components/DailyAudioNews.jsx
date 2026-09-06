import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Clock, 
  Calendar, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Headphones,
  Radio
} from 'lucide-react';
import { handleImageFallback } from '../utils/imageFallbacks';

// Single Audio Player Sub-component
function BriefingPlayer({ 
  audioUrl, 
  briefingId, 
  currentPlayingId, 
  onPlayChange,
  briefingDuration
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(briefingDuration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Sync duration from briefing data if audio metadata is delayed
  useEffect(() => {
    if (briefingDuration && briefingDuration > 0 && duration === 0) {
      setDuration(briefingDuration);
    }
  }, [briefingDuration]);

  // Stop playback ONLY when ANOTHER briefing starts playing
  useEffect(() => {
    if (currentPlayingId !== null && String(currentPlayingId) !== String(briefingId)) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [currentPlayingId, briefingId]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPlayChange(null);
    } else {
      // If at or near the end, rewind to beginning
      if (audio.ended || (duration > 0 && audio.currentTime >= duration - 0.2)) {
        audio.currentTime = 0;
        setCurrentTime(0);
      }
      onPlayChange(briefingId);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(e => {
            console.error('Audio playback error:', e);
            setIsPlaying(false);
          });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const d = audioRef.current.duration;
      if (d && !isNaN(d) && isFinite(d) && d > 0) {
        setDuration(d);
      } else if (briefingDuration && briefingDuration > 0) {
        setDuration(briefingDuration);
      }
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{
      backgroundColor: '#0F172A',
      color: '#FFFFFF',
      borderRadius: '8px',
      padding: '16px 20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      marginTop: '16px',
      marginBottom: '16px'
    }}>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          onPlayChange(null);
        }}
        onError={(e) => {
          console.error('Audio element error:', e);
          setIsPlaying(false);
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Big Direct Play / Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause Briefing' : 'Play Briefing'}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-red, #D52B1E)',
            border: 'none',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'transform 0.15s ease, background-color 0.15s ease',
            boxShadow: '0 2px 8px rgba(213, 43, 30, 0.4)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
        </button>

        {/* Scrubber & Time */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '6px', fontFamily: 'monospace' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.5"
              value={currentTime}
              onChange={handleSeek}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                appearance: 'none',
                backgroundColor: '#334155',
                outline: 'none',
                cursor: 'pointer',
                accentColor: 'var(--primary-red, #D52B1E)'
              }}
            />
          </div>
        </div>

        {/* Speed button */}
        <button
          type="button"
          onClick={cycleSpeed}
          title="Change playback speed"
          style={{
            padding: '4px 8px',
            backgroundColor: '#1E293B',
            border: '1px solid #475569',
            color: '#E2E8F0',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          {playbackRate}x
        </button>

        {/* Mute toggle */}
        <button
          type="button"
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          style={{
            background: 'none',
            border: 'none',
            color: isMuted ? '#EF4444' : '#94A3B8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
}

// Single Briefing Card
function BriefingCard({ briefing, currentPlayingId, onPlayChange, navigate, isSingleRow }) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const articles = briefing.articles || [];

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%'
    }}>
      {/* Top Banner Tag */}
      <div style={{
        padding: '12px 24px',
        backgroundColor: '#F8FAFC',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: 'rgba(213, 43, 30, 0.1)',
            color: 'var(--primary-red, #D52B1E)',
            padding: '3px 9px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            <Radio size={13} /> MORNING BRIEFING
          </span>
          <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} /> {briefing.date}
          </span>
        </div>

        {briefing.audio_duration > 0 && (
          <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Clock size={12} /> ~{Math.round(briefing.audio_duration / 60)} min audio
          </span>
        )}
      </div>

      {/* Main Card Body */}
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* If single row layout: Split image & title horizontally on desktop */}
        {isSingleRow ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: briefing.image_url ? 'minmax(280px, 360px) 1fr' : '1fr',
            gap: '24px',
            alignItems: 'start',
            marginBottom: '12px'
          }} className="single-briefing-grid">
            {briefing.image_url && (
              <div style={{ width: '100%', height: '220px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <img
                  src={briefing.image_url}
                  alt={briefing.title}
                  onError={(e) => handleImageFallback(e, 'Swiss Economics', 800)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <div>
              <h3 style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: '24px',
                lineHeight: 1.3,
                fontWeight: 700,
                color: '#0F172A',
                margin: '0 0 12px 0'
              }}>
                {briefing.title}
              </h3>
              
              {/* Direct Audio Player */}
              <BriefingPlayer
                audioUrl={briefing.audio_url}
                briefingId={briefing.id}
                currentPlayingId={currentPlayingId}
                onPlayChange={onPlayChange}
                briefingDuration={briefing.audio_duration}
              />

              {/* Transcript Drawer */}
              <div style={{ marginTop: '4px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setTranscriptOpen(!transcriptOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#475569',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '4px 0'
                  }}
                >
                  <FileText size={14} style={{ color: 'var(--primary-red, #D52B1E)' }} />
                  <span>{transcriptOpen ? 'Hide Transcript' : 'Read Audio Transcript'}</span>
                  {transcriptOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {transcriptOpen && (
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '14px 16px',
                    fontSize: '13.5px',
                    lineHeight: 1.7,
                    color: '#334155',
                    marginTop: '8px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {briefing.transcript ? briefing.transcript : (
                      <div style={{ color: '#64748B', fontStyle: 'italic' }}>
                        In this morning briefing, PrivateSector covers today's key commercial updates: {articles.map(a => a.title).join(' • ')}. Listen to the full audio above for in-depth analysis.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Multi-column layout */
          <>
            {briefing.image_url && (
              <div style={{ width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <img
                  src={briefing.image_url}
                  alt={briefing.title}
                  onError={(e) => handleImageFallback(e, 'Swiss Economics', 600)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <h3 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '20px',
              lineHeight: 1.35,
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 8px 0'
            }}>
              {briefing.title}
            </h3>

            {/* Direct Audio Player */}
            <BriefingPlayer
              audioUrl={briefing.audio_url}
              briefingId={briefing.id}
              currentPlayingId={currentPlayingId}
              onPlayChange={onPlayChange}
              briefingDuration={briefing.audio_duration}
            />

            {/* Transcript Drawer */}
            <div style={{ marginTop: '4px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setTranscriptOpen(!transcriptOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 0'
                }}
              >
                <FileText size={14} style={{ color: 'var(--primary-red, #D52B1E)' }} />
                <span>{transcriptOpen ? 'Hide Transcript' : 'Read Audio Transcript'}</span>
                {transcriptOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {transcriptOpen && (
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '14px 16px',
                  fontSize: '13.5px',
                  lineHeight: 1.7,
                  color: '#334155',
                  marginTop: '8px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {briefing.transcript ? briefing.transcript : (
                    <div style={{ color: '#64748B', fontStyle: 'italic' }}>
                      In this morning briefing, PrivateSector covers today's key commercial updates: {articles.map(a => a.title).join(' • ')}. Listen to the full audio above for in-depth analysis.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Linked Articles Section */}
        {articles.length > 0 && (
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginTop: 'auto' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748B',
              marginBottom: '10px'
            }}>
              Stories Covered in this Briefing ({articles.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {articles.map((art, idx) => (
                <div
                  key={art.id || idx}
                  onClick={() => navigate(`/${art.type === 'blog' ? 'blogs' : 'news'}/${art.slug || art.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease, transform 0.15s ease',
                    border: '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F1F5F9';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#E2E8F0',
                    color: '#0F172A',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>

                  {art.image_url && (
                    <img
                      src={art.image_url}
                      alt={art.title}
                      onError={(e) => handleImageFallback(e, art.category, 100)}
                      style={{ width: '42px', height: '42px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
                    />
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary-red, #D52B1E)', textTransform: 'uppercase' }}>
                      {art.category}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {art.title}
                    </div>
                  </div>

                  <ArrowRight size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DailyAudioNews({ navigate }) {
  const [briefings, setBriefings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadBriefings() {
      try {
        const res = await fetch('/api/morning-briefings/active?limit=2');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            setBriefings(data);
          }
        }
      } catch (err) {
        console.error('Error fetching morning briefings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadBriefings();
    return () => { isMounted = false; };
  }, []);

  if (loading || briefings.length === 0) {
    return null;
  }

  const isSingle = briefings.length === 1;

  return (
    <section 
      className="daily-audio-news-section" 
      style={{ 
        marginTop: '8px', 
        marginBottom: '24px',
        position: 'relative'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '18px',
        borderBottom: '1px solid var(--light-border, #E5E7EB)',
        paddingBottom: '12px'
      }}>
        <div>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--primary-red, #D52B1E)',
            display: 'block',
            marginBottom: '3px'
          }}>
            DAILY AUDIO INTELLIGENCE
          </span>
          <h2 style={{
            fontSize: '24px',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 700,
            margin: 0,
            color: 'var(--text-ink, #0F172A)'
          }}>
            PrivateSector Daily Audio Briefing
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
          <Headphones size={15} style={{ color: 'var(--primary-red, #D52B1E)' }} />
          <span>Executive Audio Stream</span>
        </div>
      </div>

      {/* Dynamic Grid: 1 full-width row OR 1 row with 2 columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isSingle ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {briefings.map(briefing => (
          <BriefingCard
            key={briefing.id}
            briefing={briefing}
            currentPlayingId={currentPlayingId}
            onPlayChange={(id) => setCurrentPlayingId(id)}
            navigate={navigate}
            isSingleRow={isSingle}
          />
        ))}
      </div>
    </section>
  );
}
