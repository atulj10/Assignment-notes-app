const prisma = require('../config/database');

function mapNote(note) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    tags: note.tags,
    created_at: note.createdAt || note.created_at,
    updated_at: note.updatedAt || note.updated_at,
  };
}

/**
 * Get notes owned by or shared with a user.
 * @param {string} userId
 * @param {object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @param {string|null} options.tag
 * @returns {Promise<{ data: array, pagination: object }>}
 */
async function getNotes(userId, { page = 1, limit = 20, tag = null }) {
  const skip = (page - 1) * limit;

  const shares = await prisma.noteShare.findMany({
    where: { sharedWithUserId: userId },
    select: { noteId: true },
  });
  const sharedNoteIds = shares.map(s => s.noteId);

  const orConditions = [{ ownerId: userId }];
  if (sharedNoteIds.length > 0) {
    orConditions.push({ id: { in: sharedNoteIds } });
  }

  const whereBase = { OR: orConditions };
  const where = tag ? { AND: [whereBase, { tags: { has: tag } }] } : whereBase;

  const [data, total] = await Promise.all([
    prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.note.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: data.map(mapNote),
    pagination: {
      total,
      total_pages: totalPages || 1,
      current_page: page,
      limit,
      has_next_page: page < totalPages,
      has_prev_page: page > 1,
    },
  };
}

/**
 * Get a single note by ID.
 * @param {string} noteId
 * @param {string} userId
 * @returns {Promise<{ note: object | null, error: string | null, status: number | null }>}
 */
async function getNoteById(noteId, userId) {
  const note = await prisma.note.findUnique({ where: { id: noteId } });

  if (!note) {
    return { note: null, error: 'Note not found', status: 404 };
  }

  if (note.ownerId === userId) {
    return { note: mapNote(note), error: null, status: 200 };
  }

  const share = await prisma.noteShare.findUnique({
    where: { noteId_sharedWithUserId: { noteId, sharedWithUserId: userId } },
  });

  if (share) {
    return { note: mapNote(note), error: null, status: 200 };
  }

  return { note: null, error: 'Forbidden', status: 403 };
}

/**
 * Create a new note.
 * @param {string} title
 * @param {string} content
 * @param {string[]} tags
 * @param {string} ownerId
 * @returns {Promise<object>}
 */
async function createNote(title, content, tags, ownerId) {
  const note = await prisma.note.create({
    data: { title, content, tags, ownerId },
  });

  return mapNote(note);
}

/**
 * Update a note.
 * @param {string} noteId
 * @param {string} userId
 * @param {object} updates
 * @returns {Promise<{ note: object | null, error: string | null, status: number }>}
 */
async function updateNote(noteId, userId, updates) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { ownerId: true },
  });

  if (!note) {
    return { note: null, error: 'Note not found', status: 404 };
  }

  if (note.ownerId !== userId) {
    return { note: null, error: 'Forbidden', status: 403 };
  }

  const updateData = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.content !== undefined) updateData.content = updates.content;
  if (updates.tags !== undefined) updateData.tags = updates.tags;

  const updatedNote = await prisma.note.update({
    where: { id: noteId },
    data: updateData,
  });

  return { note: mapNote(updatedNote), error: null, status: 200 };
}

/**
 * Delete a note.
 * @param {string} noteId
 * @param {string} userId
 * @returns {Promise<{ error: string | null, status: number }>}
 */
async function deleteNote(noteId, userId) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { ownerId: true },
  });

  if (!note) {
    return { error: 'Note not found', status: 404 };
  }

  if (note.ownerId !== userId) {
    return { error: 'Forbidden', status: 403 };
  }

  await prisma.note.delete({ where: { id: noteId } });

  return { error: null, status: 204 };
}

/**
 * Search notes using full-text search.
 * @param {string} query
 * @param {string} userId
 * @param {object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @returns {Promise<{ data: array, pagination: object }>}
 */
async function searchNotes(query, userId, { page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;

  const data = await prisma.$queryRaw`
    SELECT id, title, content, tags, created_at, updated_at
    FROM notes
    WHERE (
      owner_id = ${userId}::uuid
      OR id IN (SELECT note_id FROM note_shares WHERE shared_with_user_id = ${userId}::uuid)
    )
    AND to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', ${query})
    ORDER BY created_at DESC
    OFFSET ${skip}
    LIMIT ${limit}
  `;

  const countResult = await prisma.$queryRaw`
    SELECT COUNT(*)::int as total
    FROM notes
    WHERE (
      owner_id = ${userId}::uuid
      OR id IN (SELECT note_id FROM note_shares WHERE shared_with_user_id = ${userId}::uuid)
    )
    AND to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', ${query})
  `;

  const total = countResult[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data: data.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      tags: n.tags,
      created_at: n.created_at,
      updated_at: n.updated_at,
    })),
    pagination: {
      total,
      total_pages: totalPages || 1,
      current_page: page,
      limit,
      has_next_page: page < totalPages,
      has_prev_page: page > 1,
    },
  };
}

/**
 * Share a note with another user.
 * @param {string} noteId
 * @param {string} ownerId
 * @param {string} shareWithEmail
 * @returns {Promise<{ error: string | null, status: number }>}
 */
async function shareNote(noteId, ownerId, shareWithEmail) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { ownerId: true },
  });

  if (!note) {
    return { error: 'Note not found', status: 404 };
  }

  if (note.ownerId !== ownerId) {
    return { error: 'Forbidden', status: 403 };
  }

  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { email: true },
  });

  if (owner && owner.email === shareWithEmail) {
    return { error: 'Cannot share with yourself', status: 400 };
  }

  const targetUser = await prisma.user.findUnique({
    where: { email: shareWithEmail },
  });

  if (!targetUser) {
    return { error: 'User not found', status: 404 };
  }

  const existingShare = await prisma.noteShare.findUnique({
    where: { noteId_sharedWithUserId: { noteId, sharedWithUserId: targetUser.id } },
  });

  if (existingShare) {
    return { error: 'Note already shared with this user', status: 409 };
  }

  await prisma.noteShare.create({
    data: { noteId, sharedWithUserId: targetUser.id },
  });

  return { error: null, status: 200 };
}

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote, searchNotes, shareNote };
