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
  Minus,
  Image as ImageIcon
} from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder = 'Write detailed content...' }) {
  const [mode, setMode] = useState('visual'); // 'visual' | 'code'
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

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

  const executeVisualCommand = (command, val = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertMarkdownSnippet = (prefix, suffix = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const currentText = value || '';
    const selected = currentText.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 10);
  };

  const handleHeading2 = () => {
    if (mode === 'visual') {
      executeVisualCommand('formatBlock', '<h2>');
    } else {
      insertMarkdownSnippet('\n\n## ', '\n\n');
    }
  };

  const handleHeading3 = () => {
    if (mode === 'visual') {
      executeVisualCommand('formatBlock', '<h3>');
    } else {
      insertMarkdownSnippet('\n\n### ', '\n\n');
    }
  };

  const handleBold = () => {
    if (mode === 'visual') {
      executeVisualCommand('bold');
    } else {
      insertMarkdownSnippet('**', '**');
    }
  };

  const handleItalic = () => {
    if (mode === 'visual') {
      executeVisualCommand('italic');
    } else {
      insertMarkdownSnippet('*', '*');
    }
  };

  const handleDivider = () => {
    if (mode === 'visual') {
      executeVisualCommand('insertHorizontalRule');
    } else {
      insertMarkdownSnippet('\n\n---\n\n');
    }
  };

  const handleQuote = () => {
    if (mode === 'visual') {
      executeVisualCommand('formatBlock', '<blockquote>');
    } else {
      insertMarkdownSnippet('\n\n> ', '\n\n');
    }
  };

  const handleList = () => {
    if (mode === 'visual') {
      executeVisualCommand('insertUnorderedList');
    } else {
      insertMarkdownSnippet('\n- ', '\n');
    }
  };

  const handleInsertImage = () => {
    const url = window.prompt('Enter Image URL to insert into article body:');
    if (url && url.trim()) {
      if (mode === 'visual') {
        executeVisualCommand('insertImage', url.trim());
      } else {
        insertMarkdownSnippet(`\n\n![Image description](${url.trim()})\n\n`);
      }
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
        <button
          type="button"
          onClick={handleBold}
          title="Bold (Ctrl+B / **text**)"
          style={toolbarButtonStyle}
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          title="Italic (Ctrl+I / *text*)"
          style={toolbarButtonStyle}
        >
          <Italic size={15} />
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1', margin: '0 4px' }} />

        <button
          type="button"
          onClick={handleHeading2}
          title="Main Heading (H2 / ## Heading)"
          style={{ ...toolbarButtonStyle, fontWeight: 700 }}
        >
          <Heading2 size={15} />
        </button>
        <button
          type="button"
          onClick={handleHeading3}
          title="Question / Subheading (H3 / ### Heading)"
          style={{ ...toolbarButtonStyle, fontWeight: 700 }}
        >
          <Heading3 size={15} />
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1', margin: '0 4px' }} />

        <button
          type="button"
          onClick={handleList}
          title="Bullet List"
          style={toolbarButtonStyle}
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onClick={handleDivider}
          title="Divider Line (---)"
          style={toolbarButtonStyle}
        >
          <Minus size={15} />
        </button>
        <button
          type="button"
          onClick={handleQuote}
          title="Quote Block"
          style={toolbarButtonStyle}
        >
          <Quote size={15} />
        </button>
        <button
          type="button"
          onClick={handleInsertImage}
          title="Insert Image"
          style={toolbarButtonStyle}
        >
          <ImageIcon size={15} />
        </button>

        {/* Mode Switcher */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setMode(mode === 'visual' ? 'code' : 'visual')}
            style={{
              ...toolbarButtonStyle,
              backgroundColor: mode === 'code' ? '#E2E8F0' : '#F1F5F9',
              color: mode === 'code' ? 'var(--primary-red)' : '#0F172A',
              fontWeight: 700,
              fontSize: '12px',
              padding: '5px 12px',
              borderRadius: '4px',
              border: '1px solid #CBD5E1'
            }}
          >
            {mode === 'visual' ? <Code2 size={14} /> : <Eye size={14} />}
            <span style={{ marginLeft: '6px' }}>{mode === 'visual' ? 'Markdown / HTML Mode' : 'Visual WYSIWYG Mode'}</span>
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
            minHeight: '260px',
            padding: '16px 20px',
            outline: 'none',
            fontSize: '15px',
            lineHeight: 1.8,
            color: '#0F172A'
          }}
          data-placeholder={placeholder}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          placeholder="Paste or write Markdown (## Heading, ### Questions, lists, --- dividers) or HTML directly here..."
          style={{
            width: '100%',
            padding: '16px 20px',
            fontSize: '14px',
            fontFamily: '"JetBrains Mono", Consolas, Menlo, monospace',
            lineHeight: 1.6,
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
