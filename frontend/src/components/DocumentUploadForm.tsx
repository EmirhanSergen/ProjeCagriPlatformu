import { useEffect, useRef, useState } from 'react'
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

export default function DocumentUploadForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const { showToast } = useToast()
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<number>()

  const onSubmit = handleSubmit(async ({ documents }) => {
    const files = Array.from(documents)
    try {
      await uploadDocuments(files, setProgress)
      showToast('Files uploaded successfully', 'success')
      reset()
    } catch {
      showToast('Failed to upload files', 'error')
    } finally {
      setProgress(0)
    }
  })

  const watchedFiles = watch('documents')

  useEffect(() => {
    if (watchedFiles && watchedFiles.length > 0 && !intervalRef.current) {
      intervalRef.current = window.setInterval(() => {
        onSubmit()
      }, 30000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = undefined
      }
    }
  }, [watchedFiles, onSubmit])

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
      {progress > 0 && (
        <div className="w-full bg-gray-200 h-2 rounded">
          <div
            className="bg-blue-500 h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
        Upload
      </button>
    </form>
  )
}
