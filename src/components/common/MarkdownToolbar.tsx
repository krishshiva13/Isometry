import React, { useState } from 'react';
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
  Image as ImageIcon,
  BookOpen,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { InsertArticleImageModal } from './InsertArticleImageModal';
import { InsertRelatedArticleModal } from './InsertRelatedArticleModal';

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (val: string) => void;
  className?: string;
  currentArticleId?: string;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  textareaRef,
  value,
  onChange,
  className = '',
  currentArticleId
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isRelatedModalOpen, setIsRelatedModalOpen] = useState(false);
  const [currentSelectedText, setCurrentSelectedText] = useState('');

  const handleOpenImageModal = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setCurrentSelectedText(value.substring(start, end));
    } else {
      setCurrentSelectedText('');
    }
    setIsImageModalOpen(true);
  };

  const handleInsertImage = (
    markdownTag: string, 
    placement: 'cursor' | 'after_intro' | 'middle' | 'end'
  ) => {
    const textarea = textareaRef.current;
    let newValue = value;
    let newCursorPos = 0;

    if (placement === 'cursor' && textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      newValue = value.substring(0, start) + markdownTag + value.substring(end);
      newCursorPos = start + markdownTag.length;
    } else if (placement === 'after_intro') {
      // Find the first paragraph break (\n\n)
      const firstBreak = value.indexOf('\n\n');
      if (firstBreak !== -1) {
        newValue = value.substring(0, firstBreak + 2) + markdownTag.trim() + '\n\n' + value.substring(firstBreak + 2);
        newCursorPos = firstBreak + 2 + markdownTag.trim().length + 2;
      } else {
        newValue = value + markdownTag;
        newCursorPos = newValue.length;
      }
    } else if (placement === 'middle') {
      // Find a paragraph break near the 50% mark
      const midPoint = Math.floor(value.length / 2);
      const nextBreak = value.indexOf('\n\n', midPoint);
      if (nextBreak !== -1) {
        newValue = value.substring(0, nextBreak + 2) + markdownTag.trim() + '\n\n' + value.substring(nextBreak + 2);
        newCursorPos = nextBreak + 2 + markdownTag.trim().length + 2;
      } else {
        newValue = value + markdownTag;
        newCursorPos = newValue.length;
      }
    } else {
      // End of article
      newValue = value.trimEnd() + markdownTag;
      newCursorPos = newValue.length;
    }

    onChange(newValue);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

  const handleInsertRelatedArticle = (
    markdownTag: string,
    placement: 'cursor' | 'after_intro' | 'middle' | 'end'
  ) => {
    const textarea = textareaRef.current;
    let newValue = value;
    let newCursorPos = 0;

    if (placement === 'cursor' && textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      newValue = value.substring(0, start) + markdownTag + value.substring(end);
      newCursorPos = start + markdownTag.length;
    } else if (placement === 'after_intro') {
      const firstBreak = value.indexOf('\n\n');
      if (firstBreak !== -1) {
        newValue = value.substring(0, firstBreak + 2) + markdownTag.trim() + '\n\n' + value.substring(firstBreak + 2);
        newCursorPos = firstBreak + 2 + markdownTag.trim().length + 2;
      } else {
        newValue = value + markdownTag;
        newCursorPos = newValue.length;
      }
    } else if (placement === 'middle') {
      const midPoint = Math.floor(value.length / 2);
      const nextBreak = value.indexOf('\n\n', midPoint);
      if (nextBreak !== -1) {
        newValue = value.substring(0, nextBreak + 2) + markdownTag.trim() + '\n\n' + value.substring(nextBreak + 2);
        newCursorPos = nextBreak + 2 + markdownTag.trim().length + 2;
      } else {
        newValue = value + markdownTag;
        newCursorPos = newValue.length;
      }
    } else {
      newValue = value.trimEnd() + markdownTag;
      newCursorPos = newValue.length;
    }

    onChange(newValue);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

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
      const lines = selectedText.split('\n');
      const bulleted = lines.map(line => line.startsWith('- ') ? line : `- ${line}`).join('\n');
      const newValue = value.substring(0, start) + bulleted + value.substring(end);
      onChange(newValue);
    } else {
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
      const lines = selectedText.split('\n');
      const numbered = lines.map((line, idx) => {
        const clean = line.replace(/^\d+\.\s*/, '');
        return `${idx + 1}. ${clean}`;
      }).join('\n');
      const newValue = value.substring(0, start) + numbered + value.substring(end);
      onChange(newValue);
    } else {
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
        
        {/* 🖼️ Prominent In-Article Image Inserter Button */}
        <button
          type="button"
          onClick={handleOpenImageModal}
          title="Insert In-Article Image with Photo Credits"
          className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-gold/25 to-amber-100 hover:from-gold/35 hover:to-amber-200 text-ink font-bold text-xs rounded-lg border border-gold/40 transition-all shadow-2xs group"
        >
          <ImageIcon size={14} className="text-gold group-hover:scale-110 transition-transform" />
          <span>🖼️ Insert Image & Credits</span>
        </button>

        {/* 📖 Prominent Related Article Inserter Button */}
        <button
          type="button"
          onClick={() => setIsRelatedModalOpen(true)}
          title="Insert Related Article / Story Box in Content"
          className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-teal-50 to-emerald-100 hover:from-teal-100 hover:to-emerald-200 text-ink font-bold text-xs rounded-lg border border-teal-500/30 transition-all shadow-2xs group"
        >
          <BookOpen size={14} className="text-emerald-700 group-hover:scale-110 transition-transform" />
          <span>📖 Related Post</span>
        </button>

        <div className="w-px h-4 bg-black/10 mx-0.5" />

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

      {/* Helper guide */}
      <div className="flex items-center justify-between text-[11px] text-ink3 px-1 font-sans">
        <div className="flex items-center gap-2 flex-wrap">
          <HelpCircle size={12} className="text-gold flex-shrink-0" />
          <span>
            <strong>Pro Tip:</strong> Click <code className="bg-paper2 px-1 py-0.5 rounded font-mono text-[10px] text-ink font-bold">🖼️ Insert Image</code> or <code className="bg-paper2 px-1 py-0.5 rounded font-mono text-[10px] text-ink font-bold">📖 Related Post</code> to embed media & "Read Also" cards anywhere in the article.
          </span>
        </div>
      </div>

      {/* Image Modal Dialog */}
      <InsertArticleImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleInsertImage}
        initialSelectedText={currentSelectedText}
      />

      {/* Related Article Modal Dialog */}
      <InsertRelatedArticleModal
        isOpen={isRelatedModalOpen}
        onClose={() => setIsRelatedModalOpen(false)}
        onInsert={handleInsertRelatedArticle}
        currentArticleId={currentArticleId}
      />
    </div>
  );
};
