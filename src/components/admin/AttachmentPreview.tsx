import { FileText, Image as ImageIcon, Download } from 'lucide-react'
import { attachmentUrl } from '@/lib/repo'
import type { AttachmentMeta } from '@/lib/types'

export function AttachmentPreview({ attachment }: { attachment: AttachmentMeta }) {
  const url = attachmentUrl(attachment.requestId, attachment.id)
  const isImage = attachment.mimeType.startsWith('image/')

  return (
    <a
      href={url}
      download={attachment.fileName}
      target="_blank"
      rel="noreferrer"
      className="group relative flex h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-lg border border-border-light bg-surface"
      title={attachment.fileName}
    >
      {isImage ? (
        <img src={url} alt={attachment.fileName} className="h-full w-full object-cover" />
      ) : (
        <FileText className="h-8 w-8 text-text-muted" />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
        <Download className="h-5 w-5 text-white" />
      </div>
      {!isImage && <span className="absolute bottom-1 truncate px-1 text-[9px] text-text-muted">{attachment.fileName}</span>}
    </a>
  )
}

export function AttachmentIcon({ mimeType }: { mimeType: string }) {
  return mimeType.startsWith('image/') ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />
}
