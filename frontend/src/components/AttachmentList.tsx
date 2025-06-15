import type { Attachment } from '../api'
import { downloadAttachmentForReview } from '../api'
import { downloadBlob } from '../lib/download'
import { getDisplayFileName } from '../lib/file'


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
                const blob = await downloadAttachmentForReview(a.id)
                downloadBlob(blob, a.file_name)
              } catch {
                // AttachmentList has no toast context by default; swallow errors
              }
            }}
            className="text-blue-600 underline"
          >
            {getDisplayFileName(a.file_name)}
          </button>
        </li>
      ))}
    </ul>
  )
}
