import type { Attachment } from '../api'
import { downloadAttachment } from '../api'
import { downloadBlob } from '../lib/download'


interface Props {
  attachments: Attachment[]
}

export default function AttachmentList({ attachments }: Props) {
  return (
    <ul className="list-disc pl-5">
      {attachments.map((a) => (
        <li key={a.id}>
          <button
            onClick={async () => {
              try {
                const blob = await downloadAttachment(a.id)
                downloadBlob(blob, a.file_name)
              } catch {
                // AttachmentList has no toast context by default; swallow errors
              }
            }}
            className="text-blue-600 underline"
          >
            {a.file_name}
          </button>
        </li>
      ))}
    </ul>
  )
}
