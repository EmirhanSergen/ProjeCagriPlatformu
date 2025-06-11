import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { uploadDocuments } from '../api'
import ProgressBar from './ProgressBar'
import { useToast } from './ToastProvider'

interface Props {
  callId: number
  documentId: number
  description: string
}

const schema = z.object({
  file: z.any().refine((f) => f instanceof FileList && f.length === 1, 'Select a file'),
})

type FormValues = {
  file: FileList
}

export default function UploadPanel({ callId, documentId, description }: Props) {
  const [progress, setProgress] = useState(0)
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async ({ file }) => {
    try {
      await uploadDocuments(callId, documentId, [file[0]], setProgress)
      showToast('Uploaded', 'success')
      reset()
    } catch {
      showToast('Upload failed', 'error')
    } finally {
      setProgress(0)
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p>{description}</p>
      <input type="file" {...register('file')} />
      {errors.file && <p className="text-red-600">{errors.file.message}</p>}
      {progress > 0 && <ProgressBar value={progress} />}
      <button className="bg-blue-600 text-white px-4 py-1 rounded" type="submit">
        Upload
      </button>
    </form>
  )
}
