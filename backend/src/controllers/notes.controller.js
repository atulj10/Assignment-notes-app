import * as notesService from '../services/notes.service.js';
import { validationResult } from 'express-validator';

function hasValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const detail = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));
    res.status(422).json({ detail });
    return true;
  }
  return false;
}

function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (query.page !== undefined && (isNaN(page) || page < 1)) {
    return { error: true };
  }
  if (query.limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
    return { error: true };
  }

  page = page || 1;
  limit = limit || 20;
  return { page, limit };
}

export async function getNotes(req, res, next) {
  try {
    if (hasValidationErrors(req, res)) return;

    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ detail: 'Invalid pagination parameters' });
    }

    const tag = req.query.tag || null;
    const notesData = await notesService.getNotes(req.user.sub, { page: pagination.page, limit: pagination.limit, tag });
    return res.json(notesData);
  } catch (err) {
    next(err);
  }
}

export async function getNoteById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await notesService.getNoteById(id, req.user.sub);

    if (result.status === 404) {
      return res.status(404).json({ detail: 'Note not found' });
    }
    if (result.status === 403) {
      return res.status(403).json({ detail: 'Forbidden' });
    }

    return res.json(result.note);
  } catch (err) {
    next(err);
  }
}

export async function createNote(req, res, next) {
  try {
    if (hasValidationErrors(req, res)) return;

    const { title, content, tags } = req.body;
    const note = await notesService.createNote(title, content, tags || [], req.user.sub);
    return res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

export async function updateNote(req, res, next) {
  try {
    if (hasValidationErrors(req, res)) return;

    const { id } = req.params;
    const result = await notesService.updateNote(id, req.user.sub, req.body);

    if (result.status === 404) {
      return res.status(404).json({ detail: result.error });
    }
    if (result.status === 403) {
      return res.status(403).json({ detail: result.error });
    }

    return res.json(result.note);
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(req, res, next) {
  try {
    const { id } = req.params;
    const result = await notesService.deleteNote(id, req.user.sub);

    if (result.status === 404) {
      return res.status(404).json({ detail: result.error });
    }
    if (result.status === 403) {
      return res.status(403).json({ detail: result.error });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function searchNotes(req, res, next) {
  try {
    if (hasValidationErrors(req, res)) return;

    const query = req.query.q;
    if (!query || !query.trim()) {
      return res.status(400).json({ detail: 'Search query is required' });
    }

    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ detail: 'Invalid pagination parameters' });
    }

    const result = await notesService.searchNotes(query.trim(), req.user.sub, { page: pagination.page, limit: pagination.limit });
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function shareNote(req, res, next) {
  try {
    if (hasValidationErrors(req, res)) return;

    const { id } = req.params;
    const { share_with_email } = req.body;
    const result = await notesService.shareNote(id, req.user.sub, share_with_email);

    if (result.status === 404) {
      return res.status(404).json({ detail: result.error });
    }
    if (result.status === 403) {
      return res.status(403).json({ detail: result.error });
    }
    if (result.status === 400) {
      return res.status(400).json({ detail: result.error });
    }
    if (result.status === 409) {
      return res.status(409).json({ detail: result.error });
    }

    return res.json({ message: 'Note shared successfully' });
  } catch (err) {
    next(err);
  }
}
