import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../styles/NotesModule.css';

const STORAGE_KEY = 'calcio_saved_notes';

const createNewNote = () => ({
  id: `note-${Date.now()}`,
  title: 'Untitled Note',
  content: '',
  updatedAt: new Date().toISOString(),
});

const formatDate = (isoDate) => {
  try {
    return new Date(isoDate).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
};

export default function NotesModule() {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotes(Array.isArray(parsed) ? parsed : []);
      } catch {
        setNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find((note) => note.id === activeNoteId) || null;

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [activeNote]);

  const sanitizeFilename = (value) =>
    value
      .replace(/[^a-zA-Z0-9-_ ]+/g, '')
      .trim()
      .replace(/ /g, '-');

  const exportNoteText = () => {
    if (!activeNote) return;
    const titleText = sanitizeFilename(title || 'untitled-note');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `note-${titleText}-${timestamp}.txt`;
    const parser = new DOMParser();
    const doc = parser.parseFromString(content || '', 'text/html');
    const plainText = doc.body.innerText || doc.body.textContent || '';
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  useEffect(() => {
    if (!activeNote) {
      setIsFullscreen(false);
    }
  }, [activeNote]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        event.preventDefault();
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  const saveActiveNote = (updates) => {
    if (!activeNoteId) return;
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === activeNoteId
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  const handleCreateNote = () => {
    const newNote = createNewNote();
    setNotes((currentNotes) => [newNote, ...currentNotes]);
    setActiveNoteId(newNote.id);
  };

  const handleOpenNote = (noteId) => {
    setActiveNoteId(noteId);
  };

  const handleDeleteNote = (noteId) => {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId));
    if (activeNoteId === noteId) {
      setActiveNoteId(null);
    }
  };

  const handleDuplicateNote = (noteId) => {
    const noteToDuplicate = notes.find((note) => note.id === noteId);
    if (!noteToDuplicate) return;

    const duplicatedNote = {
      id: `note-${Date.now()}`,
      title: noteToDuplicate.title
        ? `Copy of ${noteToDuplicate.title}`
        : 'Untitled Note Copy',
      content: noteToDuplicate.content,
      updatedAt: new Date().toISOString(),
    };

    setNotes((currentNotes) => [duplicatedNote, ...currentNotes]);
    setActiveNoteId(duplicatedNote.id);
  };

  const handleTitleChange = (value) => {
    setTitle(value);
    saveActiveNote({ title: value });
  };

  const handleContentChange = (value) => {
    setContent(value);
    saveActiveNote({ content: value });
  };

  const sortedNotes = [...notes].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );

  const toolbarOptions = [
    [{ font: [] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['clean'],
  ];

  const modules = {
    toolbar: toolbarOptions,
  };

  const formats = [
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'header',
    'list',
    'bullet',
    'align',
    'clean',
  ];

  return (
    <div className="notes-module-container">
      <div className="notes-header">
        <div className="notes-title">╔═══ NOTES WORKSPACE ═══╗</div>
        <div className="notes-subtitle">Manage multiple STEM documents with instant browser save</div>
      </div>

      {!activeNote && (
        <div className="notes-list-view">
          <div className="notes-list-actions">
            <button className="new-note-btn" type="button" onClick={handleCreateNote}>
              + New Note
            </button>
          </div>

          {notes.length === 0 ? (
            <div className="empty-state">
              No saved notes yet. Create a new note to capture formulas, experiments, and ideas.
            </div>
          ) : (
            <div className="notes-grid">
              {sortedNotes.map((note) => (
                <div key={note.id} className="note-card">
                  <button
                    type="button"
                    className="note-card-main"
                    onClick={() => handleOpenNote(note.id)}
                  >
                    <div className="note-card-title">{note.title || 'Untitled Note'}</div>
                    <div className="note-card-meta">Last edited {formatDate(note.updatedAt)}</div>
                  </button>
                  <div className="note-actions">
                    <button
                      type="button"
                      className="note-duplicate-btn"
                      onClick={() => handleDuplicateNote(note.id)}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      className="note-delete-btn"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeNote && (
        <>
          <div className="notes-editor-view">
            <div className="notes-editor-toolbar">
              <button type="button" className="back-btn" onClick={() => setActiveNoteId(null)}>
                ← Back to Notes
              </button>
              <div className="notes-editor-action-group">
                <button className="export-btn" type="button" onClick={exportNoteText}>
                  Export Text
                </button>
                <button className="fullscreen-btn" type="button" onClick={() => setIsFullscreen((value) => !value)}>
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </button>
                <button className="new-note-btn" type="button" onClick={handleCreateNote}>
                  + New Note
                </button>
              </div>
            </div>

            <input
              type="text"
              className="note-title-input"
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="Note title"
            />

            <div className="notes-editor-frame">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                placeholder="Write your STEM notes, equations, and ideas here..."
              />
            </div>
          </div>

          {isFullscreen && (
            <div className="notes-fullscreen-overlay">
              <div className="notes-fullscreen-header">
                <span className="notes-fullscreen-label">Fullscreen Notes</span>
                <button
                  type="button"
                  className="fullscreen-exit-btn"
                  onClick={() => setIsFullscreen(false)}
                >
                  Exit Fullscreen
                </button>
              </div>
              <div className="notes-fullscreen-body">
                <div className="notes-editor-view fullscreen">
                  <div className="notes-editor-toolbar">
                    <button type="button" className="back-btn" onClick={() => setActiveNoteId(null)}>
                      ← Back to Notes
                    </button>
                    <div className="notes-editor-action-group">
                      <button className="export-btn" type="button" onClick={exportNoteText}>
                        Export Text
                      </button>
                      <button className="fullscreen-btn" type="button" onClick={() => setIsFullscreen(false)}>
                        Exit Fullscreen
                      </button>
                      <button className="new-note-btn" type="button" onClick={handleCreateNote}>
                        + New Note
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    className="note-title-input"
                    value={title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    placeholder="Note title"
                  />

                  <div className="notes-editor-frame">
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={handleContentChange}
                      modules={modules}
                      formats={formats}
                      placeholder="Write your STEM notes, equations, and ideas here..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
