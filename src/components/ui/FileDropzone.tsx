import { useRef, useState } from 'react'
import { UploadCloud, X, FileText, Image as ImageIcon } from 'lucide-react'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, MAX_FILES } from '@/lib/attachments'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

export interface PendingFile {
  file: File
  id: string
}

export function FileDropzone({
  files,
  onChange,
  error,
}: {
  files: PendingFile[]
  onChange: (files: PendingFile[]) => void
  error?: string
}) {
  const { t } = useI18n()
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const next = [...files]
    for (const file of Array.from(list)) {
      if (next.length >= MAX_FILES) break
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) continue
      if (file.size > MAX_FILE_SIZE) continue
      next.push({ file, id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })
    }
    onChange(next)
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-9 text-center transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-border-light hover:border-primary/40',
        )}
      >
        <UploadCloud className="h-8 w-8 text-text-muted" />
        <p className="text-sm font-medium text-text">{t.requestForm.upload.title}</p>
        <p className="text-xs text-text-muted">{t.requestForm.upload.hint}</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES.join(',')}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-2 rounded-lg border border-border-light bg-surface px-3 py-1.5 text-xs text-text-muted">
              {f.file.type.startsWith('image/') ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              <span className="max-w-[140px] truncate">{f.file.name}</span>
              <button type="button" onClick={() => onChange(files.filter((x) => x.id !== f.id))} className="text-text-muted hover:text-danger">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
