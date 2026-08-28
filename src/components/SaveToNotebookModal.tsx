import React, { useState, useEffect } from 'react';
import { X, Bookmark, FolderPlus, Check, Trash2, Tag, BookOpen } from 'lucide-react';
import { Fact, SavedFactNote } from '../types';
import { notebookService } from '../services/notebookService';
import { cn } from '../lib/utils';

interface SaveToNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  fact: Fact;
  onSaved?: () => void;
}

export const SaveToNotebookModal: React.FC<SaveToNotebookModalProps> = ({
  isOpen,
  onClose,
  fact,
  onSaved
}) => {
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('General Revision');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [personalNotes, setPersonalNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const allFolders = notebookService.getAllFolders();
      setFolders(allFolders);
      
      const existing = notebookService.getNoteForFact(fact.id);
      if (existing) {
        setSelectedFolder(existing.folder || 'General Revision');
        setPersonalNotes(existing.noteText || '');
        setTags(existing.tags || []);
        setIsSaved(true);
      } else {
        setSelectedFolder(allFolders[0] || 'General Revision');
        setPersonalNotes('');
        setTags([fact.cat, fact.year ? String(fact.year) : ''].filter(Boolean));
        setIsSaved(false);
      }
    }
  }, [isOpen, fact]);

  const handleSave = () => {
    const folderToUse = isCreatingFolder && newFolderName.trim() ? newFolderName.trim() : selectedFolder;
    
    const noteData: SavedFactNote = {
      id: `note-${fact.id}`,
      factId: fact.id,
      factTitle: fact.title,
      factEmoji: fact.emoji || '💡',
      factCategory: fact.cat,
      factYear: fact.year || 0,
      folder: folderToUse,
      noteText: personalNotes.trim(),
      tags: tags,
      savedAt: new Date().toISOString()
    };

    notebookService.saveNote(noteData);
    setIsSaved(true);
    setShowSavedNotification(true);
    if (onSaved) onSaved();

    setTimeout(() => {
      setShowSavedNotification(false);
      onClose();
    }, 1200);
  };

  const handleDelete = () => {
    notebookService.deleteNote(fact.id);
    setIsSaved(false);
    if (onSaved) onSaved();
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-paper border border-black/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center">
              <Bookmark size={20} />
            </div>
            <div>
              <h3 className="text-lg font-serif font-black text-ink">Save to Student Notebook</h3>
              <p className="text-xs text-ink3">Organize into custom folders for quick revision before exams</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-ink3 hover:text-ink transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Fact Preview Card */}
        <div className="my-4 p-3 bg-paper2 rounded-2xl border border-black/5 flex items-center gap-3">
          <span className="text-2xl">{fact.emoji || '📖'}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-ink truncate">{fact.title}</div>
            <div className="text-[10px] text-ink3">{fact.cat.toUpperCase()} • {fact.year ? `Year ${fact.year}` : 'Milestone'}</div>
          </div>
        </div>

        {/* Folder Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5 flex items-center justify-between">
              <span>Choose Study Folder / Collection</span>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                className="text-gold font-bold hover:underline flex items-center gap-1 normal-case"
              >
                <FolderPlus size={12} /> {isCreatingFolder ? 'Select Existing' : '+ New Folder'}
              </button>
            </label>

            {isCreatingFolder ? (
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. UPSC GS-1 Modern India, Space Notes..."
                className="w-full text-xs p-3 rounded-2xl bg-paper2 border border-gold focus:outline-none"
                autoFocus
              />
            ) : (
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl bg-paper2 border border-black/10 focus:border-gold outline-none"
              >
                {folders.map(f => (
                  <option key={f} value={f}>📁 {f}</option>
                ))}
              </select>
            )}
          </div>

          {/* Personal Revision Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5">
              Personal Study Notes & High-Yield Summary (Optional)
            </label>
            <textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="e.g. Focus on Treaty clauses for Mains 2026, Remember year 1919 for prelims..."
              rows={3}
              className="w-full text-xs p-3 rounded-2xl bg-paper2 border border-black/10 focus:border-gold outline-none resize-none"
            />
          </div>

          {/* Custom Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink3 mb-1.5 flex items-center gap-1">
              <Tag size={12} /> Topic Tags (Press Enter)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold/15 text-ink font-mono text-[11px] rounded-lg font-bold">
                  #{t}
                  <button onClick={() => removeTag(t)} className="hover:text-red-600">×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag (e.g. UPSC, ISRO, Chemistry) & press Enter..."
              className="w-full text-xs p-2.5 rounded-xl bg-paper2 border border-black/10 focus:border-gold outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-between gap-3">
          {isSaved ? (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold px-3 py-2 rounded-xl hover:bg-red-50 transition-all"
            >
              <Trash2 size={14} />
              <span>Remove from Notebook</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-ink2 hover:bg-black/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-gold hover:bg-gold/90 text-ink font-bold px-5 py-2.5 rounded-2xl text-xs transition-all shadow-sm"
            >
              {showSavedNotification ? (
                <>
                  <Check size={14} className="text-ink" />
                  <span>Saved to Folder!</span>
                </>
              ) : (
                <>
                  <Bookmark size={14} />
                  <span>{isSaved ? 'Update Saved Note' : 'Save to Notebook'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
