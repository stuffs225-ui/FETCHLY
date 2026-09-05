import { useEffect, useState } from 'react'
import { FileText, Image as ImageIcon, Download } from 'lucide-react'
import { getAttachment } from '@/lib/attachments'

export function AttachmentPreview({ id }: { id: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [meta, setMeta] = useState<{ fileName: string; mimeType: string } | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    getAttachment(id).then((file) => {
      if (!file) return
      objectUrl = URL.createObjectURL(file.blob)
      setUrl(objectUrl)
      setMeta({ fileName: file.fileName, mimeType: file.mimeType })
    })
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [id])

  if (!meta || !url) {
    return <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-lg border border-border-light bg-surface" />
  }

  const isImage = meta.mimeType.startsWith('image/')

  return (
    <a
      href={url}
      download={meta.fileName}
      target="_blank"
      rel="noreferrer"
      className="group relative flex h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-lg border border-border-light bg-surface"
      title={meta.fileName}
    >
      {isImage ? (
        <img src={url} alt={meta.fileName} className="h-full w-full object-cover" />
      ) : (
        <FileText className="h-8 w-8 text-text-muted" />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
        <Download className="h-5 w-5 text-white" />
      </div>
      {!isImage && <span className="absolute bottom-1 truncate px-1 text-[9px] text-text-muted">{meta.fileName}</span>}
    </a>
  )
}

export function AttachmentIcon({ mimeType }: { mimeType: string }) {
  return mimeType.startsWith('image/') ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />
}
