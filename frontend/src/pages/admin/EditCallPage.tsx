import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
  type CallInput,
  type DocumentDefinition
} from '../../api'
import { useToast } from '../../components/ToastProvider'
import { useAuth } from '../../components/AuthProvider'

const allowedFormats = ['pdf', 'image', 'text'] as const
type AllowedFormat = typeof allowedFormats[number]

const DocumentSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  allowed_formats: z.enum(allowedFormats),
})

const CallSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  is_open: z.boolean().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  category: z.enum(['Research', 'Development', 'Innovation']),
  max_applications: z.coerce.number().int().min(1, 'Must be at least 1'),
  items: z.array(DocumentSchema),
})

type CallForm = z.infer<typeof CallSchema>

export default function EditCallPage() {
  const { callId } = useParams()
  const id = Number(callId)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()

  // Redirect if not an admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login')
    }
  }, [user, navigate])

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CallForm>({
    resolver: zodResolver(CallSchema),
    defaultValues: {
      title: '',
      description: '',
      is_open: false,
      start_date: '',
      end_date: '',
      category: 'Research',
      max_applications: 1,
      items: []
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  // Load call and docs on mount
  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const call = await fetchCall(id)
        const docs = await fetchDocumentDefinitions(id)
        const mapped = docs.map((d: DocumentDefinition) => ({
          id: d.id,
          name: d.name,
          description: d.description ?? '',
          allowed_formats: allowedFormats.includes(d.allowed_formats as any)
            ? (d.allowed_formats as AllowedFormat)
            : 'pdf'
        }))
        reset({
          title: call.title,
          description: call.description ?? '',
          is_open: call.is_open,
          start_date: call.start_date?.slice(0,10) ?? '',
          end_date: call.end_date?.slice(0,10) ?? '',
          category: call.category as 'Research'|'Development'|'Innovation',
          max_applications: call.max_applications ?? 1,
          items: mapped
        })
      } catch {
        showToast('Failed to load call data', 'error')
      }
    })()
  }, [id, reset, showToast])

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Prepare payload, casting category to the enum
      const payload: CallInput = {
        title: data.title,
        description: data.description || null,
        is_open: data.is_open,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        category: data.category as 'Research'|'Development'|'Innovation',
        max_applications: data.max_applications
      }
      await updateCall(id, payload)

      // Sync document definitions
      const existing = await fetchDocumentDefinitions(id)
      const existingIds = new Set(existing.map(d => d.id))
      const formIds = new Set(data.items.filter(i => i.id).map(i => i.id!))

      // Delete removed docs
      const toDelete = [...existingIds].filter(i => !formIds.has(i))
      if (toDelete.length) {
        await Promise.all(toDelete.map(docId => deleteDocumentDefinition(id, docId)))
      }

      // Update or create docs
      await Promise.all(
        data.items.map(async doc => {
          const input = {
            name: doc.name,
            description: doc.description || '',
            allowed_formats: doc.allowed_formats
          }
          if (doc.id) {
            return updateDocumentDefinition(id, doc.id, input)
          }
          return createDocumentDefinition(id, input)
        })
      )

      showToast('Call updated successfully', 'success')
      navigate('/admin/calls')
    } catch {
      showToast('Failed to update call', 'error')
    }
  })

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Edit Call</h1>

      {/* Title & Description */}
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Title</label>
        <input {...register('title')} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" />
        {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Description</label>
        <textarea {...register('description')} rows={3} className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Dates & Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Start Date</label>
          <input type="date" {...register('start_date')} className="w-full border rounded p-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block font-medium">End Date</label>
          <input type="date" {...register('end_date')} className="w-full border rounded p-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Category</label>
          <select {...register('category')} className="w-full border rounded p-2 focus:ring-blue-500">
            <option value="Research">Research</option>
            <option value="Development">Development</option>
            <option value="Innovation">Innovation</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Max Applications</label>
          <input type="number" min={1} {...register('max_applications', { valueAsNumber: true })} className="w-full border rounded p-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex items-center">
        <input type="checkbox" {...register('is_open')} className="mr-2" />
        <label className="font-medium">Open for applications</label>
      </div>

      {/* Document List */}
      <div>
        <h2 className="text-lg font-semibold">Required Documents</h2>
        <div className="space-y-4 mt-2">
          {fields.map((f, idx) => (
            <div key={f.id} className="border rounded shadow-sm">
              <div className="flex justify-between bg-gray-100 px-4 py-2 rounded-t">
                <span>Document {idx + 1}</span>
                <button type="button" onClick={() => remove(idx)} className="text-red-600">Delete</button>
              </div>
              <div className="p-4 space-y-2">
                <input {...register(`items.${idx}.name` as const)} placeholder="Name" className="w-full border rounded p-2" />
                {errors.items?.[idx]?.name && <p className="text-red-600 text-sm">{errors.items[idx].name.message}</p>}
                <input {...register(`items.${idx}.description` as const)} placeholder="Description" className="w-full border rounded p-2" />
                <select {...register(`items.${idx}.allowed_formats` as const)} className="w-full border rounded p-2">
                  <option value="pdf">PDF</option>
                  <option value="image">Image</option>
                  <option value="text">Text</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button type="button" onClick={() => append({ name: '', description: '', allowed_formats: 'pdf' })} className="bg-green-600 text-white px-4 py-2 rounded">
            + Add Document
          </button>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded">
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
