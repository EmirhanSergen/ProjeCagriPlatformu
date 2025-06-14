import type { Attachment } from '../api'


interface Props {
  attachments: Attachment[]
}

export default function AttachmentList({ attachments }: Props) {
  return (
    <ul className="list-disc pl-5">
      {attachments.map((a) => (
        <li key={a.id}>
          <a
            href={`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/attachments/${a.id}/download`}
            className="text-blue-600 underline"
            target="_blank"
            rel="noreferrer"
          >
            {a.file_name}
          </a>
        </li>
      ))}
    </ul>
  )
}
