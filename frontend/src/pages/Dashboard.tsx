import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import useNotes from '../hooks/useNotes';

const PAGE_SIZES = [10, 20, 50];

export default function Dashboard() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const {
    notes, pagination, loading,
    setPage,
    limit, setLimit,
    tag, setTag,
    search, setSearch,
    allTags,
  } = useNotes();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const hasPrev = pagination?.has_prev_page;
  const hasNext = pagination?.has_next_page;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Notes App</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/note')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              + New Note
            </button>
            <button onClick={handleLogout} className="px-3 py-2 text-sm text-gray-600 hover:text-red-600">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text" placeholder="Search notes..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={tag} onChange={e => setTag(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No notes found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => navigate(`/note/${note.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md cursor-pointer transition"
              >
                <h3 className="font-semibold text-gray-800 truncate mb-1">{note.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-3">{note.content}</p>
                {note.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Page size:</span>
              <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="border rounded px-2 py-1">
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span>Page {pagination.current_page} of {pagination.total_pages}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={!hasPrev}
                className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:bg-gray-100">
                Previous
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={!hasNext}
                className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:bg-gray-100">
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
