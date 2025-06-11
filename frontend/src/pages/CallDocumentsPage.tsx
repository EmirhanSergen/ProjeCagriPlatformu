import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createDocumentDefinition, DocumentDefinition } from '../api'
import { useToast } from '../components/ToastProvider'

const schema = z.object({
  name: z.string().min(1),
  allowed_formats: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export default function CallDocumentsPage() {
  const { callId } = useParams()
  const [docs, setDocs] = useState<DocumentDefinition[]>([])
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (!callId) return <p>No call selected.</p>

  const onSubmit = handleSubmit(async (data) => {
    try {
      const updated = await createDocumentDefinition(Number(callId), data)
      setDocs(updated)
      showToast('Saved', 'success')
      reset()
    } catch {
      showToast('Failed', 'error')
    }
  })

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Required Documents</h1>
      <form onSubmit={onSubmit} className="space-y-2">
        <input placeholder="Name" className="border p-1 w-full" {...register('name')} />
        {errors.name && <p className="text-red-600">{errors.name.message}</p>}
        <select className="border p-1 w-full" {...register('allowed_formats')}>
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
          <option value="text">Text</option>
        </select>
        <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">Save</button>
      </form>
      {docs.length > 0 && (
        <ul className="list-disc pl-5">
          {docs.map((d) => (
            <li key={d.id}>{d.name} - {d.allowed_formats}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
