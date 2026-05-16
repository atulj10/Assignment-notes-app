const { Router } = require('express');
const auth = require('../middleware/auth');
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  shareNote,
} = require('../controllers/notes.controller');
const {
  createNoteValidator,
  updateNoteValidator,
  shareNoteValidator,
} = require('../validators/notes.validator');

const router = Router();

router.get('/search', auth, searchNotes);
router.get('/', auth, getNotes);
router.get('/:id', auth, getNoteById);
router.post('/', auth, createNoteValidator, createNote);
router.put('/:id', auth, updateNoteValidator, updateNote);
router.delete('/:id', auth, deleteNote);
router.post('/:id/share', auth, shareNoteValidator, shareNote);

module.exports = router;
