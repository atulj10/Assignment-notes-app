import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useNote from '../hooks/useNote';

export default function Note() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { note, loading, saving, sharing, error, saveNote, deleteNote, shareNote } = useNote(id);
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTagsStr((note.tags || []).join(', '));
    }
  }, [note]);

  useEffect(() => {
    if (error) setMessage({ text: error, type: 'error' });
  }, [error]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const result = await saveNote(title.trim(), content.trim(), tags);
    if (result.success) {
      if ('isNew' in result && result.isNew) {
        navigate(`/note/${result.note.id}`, { replace: true });
      }
      setMessage({ text: isEdit ? 'Note updated' : 'Note created', type: 'success' });
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this note?')) return;
    setMessage(null);
    const result = await deleteNote();
    if (result.success) {
      navigate('/dashboard');
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
  }

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const result = await shareNote(shareEmail.trim());
    if (result.success) {
      setMessage({ text: 'Note shared successfully', type: 'success' });
      setShareEmail('');
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline text-sm">
            &larr; Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Note' : 'New Note'}</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {message && (
          <div className={`mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border p-6 space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
              maxLength={255} placeholder="Note title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea required value={content} onChange={e => setContent(e.target.value)} rows={6}
              placeholder="Write your note here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input type="text" value={tagsStr} onChange={e => setTagsStr(e.target.value)}
              placeholder="work, ideas, personal"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
              {saving ? 'Saving...' : 'Save'}
            </button>
            {isEdit && (
              <button type="button" onClick={handleDelete} disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium">
                Delete
              </button>
            )}
          </div>
        </form>

        {isEdit && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Share Note</h2>
            <form onSubmit={handleShare} className="flex gap-3">
              <input type="email" required value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" disabled={sharing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium">
                {sharing ? 'Sharing...' : 'Share'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
