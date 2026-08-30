import React from 'react';
import { 
  List, 
  ListOrdered, 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  Quote, 
  Lightbulb, 
  Link as LinkIcon, 
  Code,
  HelpCircle
} from 'lucide-react';

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  textareaRef,
  value,
  onChange,
  className = ''
}) => {
  const insertFormatting = (prefix: string, suffix: string = '', placeholder: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let replacement = '';
    let newCursorPos = start + prefix.length;

    if (selectedText.length > 0) {
      replacement = `${prefix}${selectedText}${suffix}`;
      newCursorPos = start + replacement.length;
    } else {
      replacement = `${prefix}${placeholder}${suffix}`;
      newCursorPos = start + prefix.length + placeholder.length;
    }

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const insertBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (selectedText.trim().length > 0) {
      // Convert selected lines to bullet points
      const lines = selectedText.split('\n');
      const bulleted = lines.map(line => line.startsWith('- ') ? line : `- ${line}`).join('\n');
      const newValue = value.substring(0, start) + bulleted + value.substring(end);
      onChange(newValue);
    } else {
      // Insert sample bullet list
      const sample = '\n- First key point\n- Second key point\n- Third key point\n';
      const newValue = value.substring(0, start) + sample + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + sample.length, start + sample.length);
      }, 10);
    }
  };

  const insertNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    if (selectedText.trim().length > 0) {
      // Convert selected lines to numbered list
      const lines = selectedText.split('\n');
      const numbered = lines.map((line, idx) => {
        const clean = line.replace(/^\d+\.\s*/, '');
        return `${idx + 1}. ${clean}`;
      }).join('\n');
      const newValue = value.substring(0, start) + numbered + value.substring(end);
      onChange(newValue);
    } else {
      // Insert sample numbered list
      const sample = '\n1. First milestone\n2. Second milestone\n3. Third milestone\n';
      const newValue = value.substring(0, start) + sample + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + sample.length, start + sample.length);
      }, 10);
    }
  };

  const insertCallout = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'Important key takeaway for exams and readers.';

    const sample = `\n> 💡 **Key Takeaway:** ${selectedText}\n`;
    const newValue = value.substring(0, start) + sample + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + sample.length, start + sample.length);
    }, 10);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Toolbar Buttons */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-paper2 rounded-xl border border-black/10 text-ink">
        <button
          type="button"
          onClick={insertBulletList}
          title="Insert Bullet List (- item)"
          className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gold/15 hover:border-gold/40 border border-black/10 rounded-lg text-xs font-bold transition-all shadow-2xs group"
        >
          <List size={14} className="text-gold group-hover:scale-110 transition-transform" />
          <span>• Bullet List</span>
        </button>

        <button
          type="button"
          onClick={insertNumberedList}
          title="Insert Numbered List (1. item)"
          className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gold/15 hover:border-gold/40 border border-black/10 rounded-lg text-xs font-bold transition-all shadow-2xs group"
        >
          <ListOrdered size={14} className="text-gold group-hover:scale-110 transition-transform" />
          <span>1. Numbered List</span>
        </button>

        <div className="w-px h-4 bg-black/10 mx-0.5" />

        <button
          type="button"
          onClick={() => insertFormatting('**', '**', 'bold text')}
          title="Bold Text"
          className="p-1.5 bg-white hover:bg-black/5 border border-black/10 rounded-lg text-ink transition-all"
        >
          <Bold size={13} />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('*', '*', 'italic text')}
          title="Italic Text"
          className="p-1.5 bg-white hover:bg-black/5 border border-black/10 rounded-lg text-ink transition-all"
        >
          <Italic size={13} />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('\n## ', '\n', 'Subheading Title')}
          title="Heading 2 (## Title)"
          className="flex items-center gap-0.5 px-2 py-1 bg-white hover:bg-black/5 border border-black/10 rounded-lg text-xs font-bold"
        >
          <Heading2 size={13} />
          <span>H2</span>
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('\n### ', '\n', 'Section Title')}
          title="Heading 3 (### Title)"
          className="flex items-center gap-0.5 px-2 py-1 bg-white hover:bg-black/5 border border-black/10 rounded-lg text-xs font-bold"
        >
          <Heading3 size={13} />
          <span>H3</span>
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('\n> ', '\n', 'Quoted statement')}
          title="Blockquote"
          className="p-1.5 bg-white hover:bg-black/5 border border-black/10 rounded-lg text-ink transition-all"
        >
          <Quote size={13} />
        </button>

        <button
          type="button"
          onClick={insertCallout}
          title="Insert Key Takeaway Box"
          className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-gold/30 rounded-lg text-xs font-bold text-amber-900 transition-all shadow-2xs"
        >
          <Lightbulb size={13} className="text-gold" />
          <span>💡 Takeaway Box</span>
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('[', '](https://example.com)', 'Link Title')}
          title="Insert Web Link"
          className="p-1.5 bg-white hover:bg-black/5 border border-black/10 rounded-lg text-ink transition-all"
        >
          <LinkIcon size={13} />
        </button>
      </div>

      {/* Formatting Guide Helper */}
      <div className="flex items-center justify-between text-[11px] text-ink3 px-1 font-sans">
        <div className="flex items-center gap-1.5">
          <HelpCircle size={12} className="text-gold flex-shrink-0" />
          <span>
            <strong>How to make lists:</strong> Start any line with <code className="bg-paper2 px-1 py-0.5 rounded font-mono text-[10px] text-ink font-bold">- </code> for bullets, or <code className="bg-paper2 px-1 py-0.5 rounded font-mono text-[10px] text-ink font-bold">1. </code> for numbered items.
          </span>
        </div>
      </div>
    </div>
  );
};
