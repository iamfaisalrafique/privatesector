import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ paths = [], navigate }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      color: '#6B7280',
      fontFamily: 'Inter, sans-serif',
      marginBottom: '24px',
      flexWrap: 'wrap'
    }}>
      <div 
        onClick={() => navigate('/')}
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          color: '#374151',
          fontWeight: 500
        }}
      >
        <Home size={14} />
        <span>Home</span>
      </div>

      {paths.map((p, idx) => {
        const isLast = idx === paths.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight size={12} style={{ color: '#9CA3AF' }} />
            {isLast ? (
              <span style={{ color: '#111827', fontWeight: 600 }}>{p.name}</span>
            ) : (
              <span 
                onClick={() => p.url && navigate(p.url)}
                style={{ 
                  cursor: p.url ? 'pointer' : 'default', 
                  color: '#374151',
                  fontWeight: 500
                }}
              >
                {p.name}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
