import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link, 
  Image as ImageIcon, 
  Eye, 
  Code2 
} from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder = 'Write detailed content...' }) {
  const [mode, setMode] = useState('visual'); // 'visual' | 'code'
  const editorRef = useRef(null);

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div style={{
      border: '0.5px solid #CBD5E1',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Editor Formatting Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 12px',
        backgroundColor: '#F8FAFC',
        borderBottom: '0.5px solid #E2E8F0'
      }}>
        {mode === 'visual' && (
          <>
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              title="Bold"
              style={toolbarButtonStyle}
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              title="Italic"
              style={toolbarButtonStyle}
            >
              <Italic size={14} />
            </button>

            <div style={{ width: '1px', height: '16px', backgroundColor: '#CBD5E1', margin: '0 4px' }} />

            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h2>')}
              title="Heading 2"
              style={toolbarButtonStyle}
            >
              <Heading2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h3>')}
              title="Heading 3"
              style={toolbarButtonStyle}
            >
              <Heading3 size={14} />
            </button>

            <div style={{ width: '1px', height: '16px', backgroundColor: '#CBD5E1', margin: '0 4px' }} />

            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              title="Bullet List"
              style={toolbarButtonStyle}
            >
              <List size={14} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              title="Numbered List"
              style={toolbarButtonStyle}
            >
              <ListOrdered size={14} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<blockquote>')}
              title="Quote"
              style={toolbarButtonStyle}
            >
              <Quote size={14} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<pre>')}
              title="Code Block"
              style={toolbarButtonStyle}
            >
              <Code size={14} />
            </button>
          </>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setMode(mode === 'visual' ? 'code' : 'visual')}
            style={{
              ...toolbarButtonStyle,
              backgroundColor: mode === 'code' ? '#E2E8F0' : 'transparent',
              color: mode === 'code' ? 'var(--primary-red)' : '#475569',
              fontWeight: 600,
              fontSize: '11px',
              padding: '4px 8px'
            }}
          >
            {mode === 'visual' ? <Code2 size={13} /> : <Eye size={13} />}
            <span style={{ marginLeft: '4px' }}>{mode === 'visual' ? 'HTML Code' : 'Visual Mode'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {mode === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: value || '' }}
          style={{
            minHeight: '220px',
            padding: '16px',
            outline: 'none',
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#1E293B'
          }}
          data-placeholder={placeholder}
        />
      ) : (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '13px',
            fontFamily: 'monospace',
            backgroundColor: '#0F172A',
            color: '#F8FAFC',
            border: 'none',
            outline: 'none',
            resize: 'vertical'
          }}
        />
      )}
    </div>
  );
}

const toolbarButtonStyle = {
  padding: '6px 8px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '4px',
  color: '#475569',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};
