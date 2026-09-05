import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const uploadsRoot = path.join(__dirname, '../uploads')
fs.mkdirSync(uploadsRoot, { recursive: true })

const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const MAX_FILES = 5

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const dir = path.join(uploadsRoot, req.pendingRequestId)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename(_req, file, cb) {
    cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter(_req, file, cb) {
    if (!ACCEPTED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error('نوع الملف غير مدعوم'))
    }
    cb(null, true)
  },
})

/** Assigns req.pendingRequestId before multer's storage engine needs it. */
export function assignRequestId(req, _res, next) {
  req.pendingRequestId = crypto.randomUUID()
  next()
}
