import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Pagination {
  total: number;
  total_pages: number;
  current_page: number;
  limit: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export default function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [tag, setTag] = useState('');
  const [search, setSearch] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const searchMode = useRef(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (tag) params.tag = tag;

      let res;
      if (searchMode.current && debouncedSearch.trim()) {
        params.q = debouncedSearch.trim();
        res = await api.get('/notes/search', { params });
      } else {
        res = await api.get('/notes', { params });
      }

      setNotes(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, tag, debouncedSearch]);

  const fetchAllTags = useCallback(async () => {
    try {
      const { data } = await api.get('/notes', { params: { limit: 100 } });
      const tagSet = new Set<string>();
      data.data.forEach((n: Note) => n.tags?.forEach((t: string) => tagSet.add(t)));
      setAllTags([...tagSet].sort());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    searchMode.current = !!debouncedSearch.trim();
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetchAllTags();
  }, [fetchAllTags]);

  return {
    notes, pagination, loading,
    page, setPage,
    limit, setLimit: (v: number) => { setLimit(v); setPage(1); },
    tag, setTag: (v: string) => { setTag(v); setPage(1); },
    search, setSearch,
    allTags,
    refetch: fetchNotes,
  };
}
