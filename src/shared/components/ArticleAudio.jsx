import { useState } from 'react';

function Recording({ briefing }) {
  const [failed, setFailed] = useState(false);
  return (
    <div onClick={(e) => e.stopPropagation()} style={{ marginBottom: '16px' }}>
      <p style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 8px' }}>Listen: {briefing.title}</p>
      {failed ? (
        <p role="status" style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Audio is currently unavailable.</p>
      ) : (
        <audio
          controls
          preload="none"
          src={briefing.audio_url}
          aria-label={`Listen to ${briefing.title}`}
          onPlay={(e) => {
            for (const audio of document.querySelectorAll('audio')) {
              if (audio !== e.currentTarget) audio.pause();
            }
          }}
          onError={() => setFailed(true)}
          style={{ width: '100%', display: 'block', height: '40px' }}
        />
      )}
    </div>
  );
}

export default function ArticleAudio({ briefings = [] }) {
  return briefings.map(briefing => <Recording key={`${briefing.id}:${briefing.audio_url}`} briefing={briefing} />);
}
