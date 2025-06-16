import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from './ToastProvider'
import { uploadDocuments } from '../api'

const schema = z.object({
  documents: z
    .any()
    .refine(
      (f) => f instanceof FileList && f.length > 0,
      'Please select at least one file',
    ),
})

interface FormValues {
  documents: FileList
}

interface Props {
  callId: number
  documentId: number
}

export default function DocumentUploadForm({ callId, documentId }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const { showToast } = useToast()

  const onSubmit = handleSubmit(async ({ documents }) => {
    const files = Array.from(documents)
    try {
      await uploadDocuments(callId, documentId, files)
      showToast('Files uploaded successfully', 'success')
      reset()
    } catch {
      showToast('Failed to upload files', 'error')
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Upload Documents</h2>
      <div>
        <input
          type="file"
          multiple
          {...register('documents')}
          className="border p-2 w-full"
        />
        {errors.documents && (
          <p className="text-red-600">{errors.documents.message}</p>
        )}
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
        Upload
      </button>
    </form>
  )
}
