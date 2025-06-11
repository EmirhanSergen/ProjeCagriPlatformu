import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import {
  fetchCall,
  fetchDocumentDefinitions,
  updateCall,
  createDocumentDefinition,
  updateDocumentDefinition,
  deleteDocumentDefinition,
} from '../api'
import { useToast } from '../components/ToastProvider'

const itemSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  allowed_formats: z.enum(['pdf', 'image', 'text']),
})

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  is_open: z.boolean().optional(),
  items: z.array(itemSchema),
})

type FormValues = z.infer<typeof schema>

export default function EditCallPage() {
  const { callId } = useParams()
  const id = Number(callId)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { items: [] } })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const c = await fetchCall(id)
      const docs = await fetchDocumentDefinitions(id)
        reset({
          title: c.title,
          description: c.description || '',
          is_open: c.is_open,
          items: docs.map((d) => ({
            id: d.id,
            name: d.name,
            description: d.description || '',
            allowed_formats: d.allowed_formats as 'pdf' | 'image' | 'text',
          })),
        })
    })()
  }, [id, reset])

  const onDeleteDoc = async (index: number, docId?: number) => {
    if (docId) {
      await deleteDocumentDefinition(id, docId)
    }
    remove(index)
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateCall(id, {
        title: data.title,
        description: data.description,
        is_open: data.is_open,
      })
      for (const item of data.items) {
          if (item.id) {
            await updateDocumentDefinition(id, item.id, {
              name: item.name,
              description: item.description,
              allowed_formats: item.allowed_formats,
            })
          } else {
            await createDocumentDefinition(id, {
              name: item.name,
              description: item.description,
              allowed_formats: item.allowed_formats,
            })
        }
      }
      showToast('Call updated', 'success')
      navigate('/admin/calls')
    } catch {
      showToast('Failed to update call', 'error')
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Edit Call</h1>
      <div>
        <label className="block">
          Title
          <input {...register('title')} className="border p-2 w-full" />
        </label>
        {errors.title && <p className="text-red-600">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block">
          Description
          <textarea {...register('description')} className="border p-2 w-full" />
        </label>
      </div>
      <div>
        <label className="inline-flex items-center space-x-2">
          <input type="checkbox" {...register('is_open')} />
          <span>Open</span>
        </label>
      </div>
      <div>
        <h2 className="font-semibold">Required Items</h2>
        {fields.map((field, idx) => (
          <div key={field.id} className="border p-2 space-y-2 mb-2">
            <input {...register(`items.${idx}.name` as const)} placeholder="Name" className="border p-1 w-full" />
            <input {...register(`items.${idx}.description` as const)} placeholder="Description" className="border p-1 w-full" />
              <select {...register(`items.${idx}.allowed_formats` as const)} className="border p-1 w-full">
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="text">Text</option>
            </select>
            <button type="button" onClick={() => onDeleteDoc(idx, field.id as number | undefined)} className="text-red-600 underline">Delete</button>
          </div>
        ))}
        <button type="button" onClick={() => append({ name: '', description: '', allowed_formats: 'pdf' })} className="bg-gray-200 px-2 py-1 rounded">
          Add Item
        </button>
      </div>
      <button disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </form>
  )
}
