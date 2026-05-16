import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  shareNote,
} from '../controllers/notes.controller.js';
import {
  createNoteValidator,
  updateNoteValidator,
  shareNoteValidator,
} from '../validators/notes.validator.js';

const router = Router();

router.get('/search', auth, searchNotes);
router.get('/', auth, getNotes);
router.get('/:id', auth, getNoteById);
router.post('/', auth, createNoteValidator, createNote);
router.put('/:id', auth, updateNoteValidator, updateNote);
router.delete('/:id', auth, deleteNote);
router.post('/:id/share', auth, shareNoteValidator, shareNote);

export default router;
