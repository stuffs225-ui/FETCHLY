// Kept in sync with the server's multer config (server/lib/upload.js) so the
// dropzone can reject an obviously invalid file before it's ever uploaded.
export const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const MAX_FILES = 5
