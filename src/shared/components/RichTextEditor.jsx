import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Eye, 
  Code2,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder = 'Write detailed content...' }) {
  const [mode, setMode] = useState('visual'); // 'visual' | 'code'
  const editorRef = useRef(null);

  // Synchronize incoming value into contentEditable DOM element only when not focused or when value changes externally
  useEffect(() => {
    if (editorRef.current && mode === 'visual') {
      if (document.activeElement !== editorRef.current && editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, mode]);

  const handleRef = (node) => {
    editorRef.current = node;
    if (node && value) {
      node.innerHTML = value;
    }
  };

  const executeCommand = (command, val = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertImage = () => {
    const url = window.prompt('Enter Image URL to insert into article body:');
    if (url && url.trim()) {
      executeCommand('insertImage', url.trim());
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div style={{
      border: '1.5px solid #CBD5E1',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Editor Formatting Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 12px',
        backgroundColor: '#F8FAFC',
        borderBottom: '1.5px solid #E2E8F0'
      }}>
        {mode === 'visual' && (
          <>
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              title="Bold"
              style={toolbarButtonStyle}
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              title="Italic"
              style={toolbarButtonStyle}
            >
              <Italic size={15} />
            </button>

            <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1', margin: '0 4px' }} />

            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h2>')}
              title="Heading 2"
              style={toolbarButtonStyle}
            >
              <Heading2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<h3>')}
              title="Heading 3"
              style={toolbarButtonStyle}
            >
              <Heading3 size={15} />
            </button>

            <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1', margin: '0 4px' }} />

            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              title="Bullet List"
              style={toolbarButtonStyle}
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              title="Numbered List"
              style={toolbarButtonStyle}
            >
              <ListOrdered size={15} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<blockquote>')}
              title="Quote"
              style={toolbarButtonStyle}
            >
              <Quote size={15} />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('formatBlock', '<pre>')}
              title="Code Block"
              style={toolbarButtonStyle}
            >
              <Code size={15} />
            </button>
            <button
              type="button"
              onClick={handleInsertImage}
              title="Insert Inline Image"
              style={toolbarButtonStyle}
            >
              <ImageIcon size={15} />
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
              color: mode === 'code' ? 'var(--primary-red)' : '#0F172A',
              fontWeight: 700,
              fontSize: '12px',
              padding: '4px 10px'
            }}
          >
            {mode === 'visual' ? <Code2 size={14} /> : <Eye size={14} />}
            <span style={{ marginLeft: '6px' }}>{mode === 'visual' ? 'HTML Code' : 'Visual Mode'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {mode === 'visual' ? (
        <div
          ref={handleRef}
          contentEditable
          onInput={handleInput}
          style={{
            minHeight: '220px',
            padding: '16px',
            outline: 'none',
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#0F172A'
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
  padding: '6px 10px',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '4px',
  color: '#0F172A',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};
