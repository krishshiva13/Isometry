import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Bookmark, Folder, Search, Trash2, Edit3, Tag, Download, BookOpen, Sparkles, ExternalLink, Plus, Check } from 'lucide-react';
import { SavedFactNote } from '../types';
import { notebookService } from '../services/notebookService';
import { cn } from '../lib/utils';

export const StudentNotebook: React.FC = () => {
  const [notes, setNotes] = useState<SavedFactNote[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [showExportToast, setShowExportToast] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const saved = notebookService.getSavedNotes();
    setNotes(saved);
    setFolders(notebookService.getAllFolders());
  };

  const handleDelete = (factId: string) => {
    if (confirm("Are you sure you want to remove this fact from your notebook?")) {
      const updated = notebookService.deleteNote(factId);
      setNotes(updated);
    }
  };

  const handleStartEdit = (note: SavedFactNote) => {
    setEditingNoteId(note.id);
    setEditingText(note.noteText || '');
  };

  const handleSaveEdit = (note: SavedFactNote) => {
    const updatedNote = { ...note, noteText: editingText };
    notebookService.saveNote(updatedNote);
    setEditingNoteId(null);
    loadData();
  };

  const handleExportMarkdown = () => {
    if (notes.length === 0) return;
    let md = `# 📓 FActHub Student Study Notebook\n\n*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    
    notes.forEach((n, idx) => {
      md += `### ${idx + 1}. ${n.factEmoji} ${n.factTitle} (${n.factYear || 'Milestone'})\n`;
      md += `- **Folder**: ${n.folder}\n`;
      md += `- **Category**: ${n.factCategory}\n`;
      if (n.tags && n.tags.length > 0) {
        md += `- **Tags**: ${n.tags.join(', ')}\n`;
      }
      if (n.noteText) {
        md += `\n**Personal Study Notes & High-Yield Points:**\n> ${n.noteText}\n`;
      }
      md += `\n[View Full Article on FActHub](https://facthub.app/article/${n.factId})\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FactHub-Study-Notebook-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 2500);
  };

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesFolder = selectedFolder === 'all' || n.folder === selectedFolder;
    const matchesSearch = !searchQuery.trim() || 
      n.factTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.noteText && n.noteText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-paper py-10 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>My Student Notebook & Collections | FActHub</title>
        <meta name="description" content="Manage your saved historical facts, custom exam revision folders, and personalized study notes for competitive exams on FActHub." />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Header Card */}
        <div className="bg-paper2 border border-black/10 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center font-bold">
                <Bookmark size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black text-ink">Personal Student Notebook</h1>
                <p className="text-xs sm:text-sm text-ink3">Saved facts, curated folders & high-yield revision notes</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportMarkdown}
                disabled={notes.length === 0}
                className="flex items-center gap-2 bg-ink text-paper font-bold px-4 py-2.5 rounded-2xl text-xs hover:bg-black transition-all disabled:opacity-50 shadow-sm"
              >
                <Download size={14} />
                <span>{showExportToast ? 'Exported Markdown!' : 'Export Study Notes (.md)'}</span>
              </button>

              <Link
                to="/daily-study-sheet"
                className="flex items-center gap-2 bg-gold text-ink font-bold px-4 py-2.5 rounded-2xl text-xs hover:bg-gold/90 transition-all shadow-sm"
              >
                <BookOpen size={14} />
                <span>Print Daily Study Sheet</span>
              </Link>
            </div>
          </div>

          {/* Search & Folder filters */}
          <div className="mt-6 pt-6 border-t border-black/10 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink3" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, topics, or tags..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-paper border border-black/10 text-xs focus:border-gold outline-none"
              />
            </div>

            {/* Folder Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedFolder('all')}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                  selectedFolder === 'all'
                    ? "bg-ink text-paper"
                    : "bg-paper hover:bg-paper3 text-ink2 border border-black/10"
                )}
              >
                All Folders ({notes.length})
              </button>
              {folders.map(f => {
                const count = notes.filter(n => n.folder === f).length;
                return (
                  <button
                    key={f}
                    onClick={() => setSelectedFolder(f)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                      selectedFolder === f
                        ? "bg-gold text-ink"
                        : "bg-paper hover:bg-paper3 text-ink2 border border-black/10"
                    )}
                  >
                    <Folder size={12} />
                    <span>{f}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-paper2 border border-black/10 rounded-3xl p-6 shadow-sm hover:border-gold/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-2 bg-paper rounded-xl border border-black/5">
                        {note.factEmoji || '📖'}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold px-2 py-0.5 rounded-md bg-gold/10">
                          📁 {note.folder}
                        </span>
                        <h3 className="text-base font-serif font-bold text-ink mt-1">
                          {note.factTitle}
                        </h3>
                        <div className="text-[11px] text-ink3 font-mono">
                          {note.factCategory.toUpperCase()} • Year {note.factYear || 'Milestone'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1.5 rounded-lg hover:bg-black/5 text-ink3 hover:text-ink transition-all"
                        title="Edit Study Note"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(note.factId)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-ink3 hover:text-red-600 transition-all"
                        title="Delete Note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Personal Note Box */}
                  {editingNoteId === note.id ? (
                    <div className="my-3 space-y-2">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        placeholder="Write your study notes, revision mnemonics, or exam points..."
                        rows={3}
                        className="w-full text-xs p-3 rounded-2xl bg-paper border border-gold outline-none resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1 text-xs text-ink3 hover:text-ink"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(note)}
                          className="flex items-center gap-1 bg-gold text-ink font-bold px-3 py-1 rounded-xl text-xs"
                        >
                          <Check size={12} /> Save
                        </button>
                      </div>
                    </div>
                  ) : note.noteText ? (
                    <div className="my-3 p-3.5 bg-paper rounded-2xl border border-black/5 text-xs text-ink2 leading-relaxed">
                      <span className="font-bold text-ink block mb-0.5">📝 Personal Notes:</span>
                      {note.noteText}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(note)}
                      className="my-3 text-xs text-ink3 hover:text-gold flex items-center gap-1 italic"
                    >
                      <Plus size={12} /> Add personal study note or revision pointers...
                    </button>
                  )}

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 my-2">
                      {note.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-black/5 text-ink2 rounded-md font-mono text-[10px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Link */}
                <div className="pt-4 mt-3 border-t border-black/5 flex items-center justify-between">
                  <span className="text-[10px] text-ink3 font-mono">
                    Saved {new Date(note.savedAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/article/${note.factId}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:underline"
                  >
                    <span>Read Full Article</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-paper2 border border-black/10 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-gold/15 text-gold mx-auto flex items-center justify-center">
              <Bookmark size={32} />
            </div>
            <h3 className="text-lg font-serif font-bold text-ink">Your Notebook is Empty</h3>
            <p className="text-xs text-ink3 leading-relaxed">
              When browsing any fact on FActHub, click the <span className="font-bold text-ink">"Save to Notebook"</span> bookmark button to categorize it into custom exam revision folders.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-ink font-bold px-6 py-2.5 rounded-2xl text-xs transition-all shadow-sm"
              >
                <span>Browse Today's Facts</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
