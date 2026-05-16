import { useState, useEffect, useCallback } from 'react';
import api from '../api';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function useNote(id?: string) {
  const isEdit = !!id;
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNote = useCallback(async () => {
    if (!isEdit) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/notes/${id}`);
      setNote(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load note');
    } finally {
      setLoading(false);
    }
  }, [id, isEdit]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const saveNote = useCallback(async (title: string, content: string, tags: string[]) => {
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        const { data } = await api.put(`/notes/${id}`, { title, content, tags });
        setNote(data);
        return { success: true as const, note: data };
      } else {
        const { data } = await api.post('/notes', { title, content, tags });
        setNote(data);
        return { success: true as const, note: data, isNew: true as const };
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to save note';
      setError(msg);
      return { success: false as const, error: msg };
    } finally {
      setSaving(false);
    }
  }, [id, isEdit]);

  const deleteNote = useCallback(async () => {
    if (!isEdit) return { success: false as const, error: 'No note to delete' };
    setSaving(true);
    setError(null);
    try {
      await api.delete(`/notes/${id}`);
      return { success: true as const };
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to delete note';
      setError(msg);
      return { success: false as const, error: msg };
    } finally {
      setSaving(false);
    }
  }, [id, isEdit]);

  const shareNote = useCallback(async (email: string) => {
    setSharing(true);
    setError(null);
    try {
      await api.post(`/notes/${id}/share`, { share_with_email: email });
      return { success: true as const };
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to share note';
      setError(msg);
      return { success: false as const, error: msg };
    } finally {
      setSharing(false);
    }
  }, [id]);

  return { note, loading, saving, sharing, error, saveNote, deleteNote, shareNote, refetch: fetchNote };
}
