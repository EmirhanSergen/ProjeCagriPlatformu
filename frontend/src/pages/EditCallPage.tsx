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
} from '../api'
import { useToast } from '../components/ToastProvider'
import { useAuth } from '../components/AuthProvider'

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
  max_applications: z.number().int().min(1, 'Must be at least 1'),
  items: z.array(DocumentSchema),
})

type CallForm = z.infer<typeof CallSchema>

export default function EditCallPage() {
  const { callId } = useParams()
  const id = Number(callId)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { token } = useAuth()

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

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

  // Load call and populate form
  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const c = await fetchCall(id)
        const cAny = c as any
        const docs = await fetchDocumentDefinitions(id)
        
        // Map document definitions to form format with type safety
        const mappedDocs = docs.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description ?? '',
          allowed_formats: (d.allowed_formats === 'pdf' || d.allowed_formats === 'image' || d.allowed_formats === 'text' 
            ? d.allowed_formats 
            : 'pdf') as AllowedFormat
        }))

        reset({
          title: c.title,
          description: c.description ?? '',
          is_open: c.is_open,
          start_date: cAny.start_date?.slice(0, 10) ?? '',
          end_date: cAny.end_date?.slice(0, 10) ?? '',
          category: cAny.category ?? 'Research',
          max_applications: cAny.max_applications ?? 1,
          items: mappedDocs
        })
      } catch {
        showToast('Failed to load call data', 'error')
      }
    })()
  }, [id, reset])

  const onSubmit = handleSubmit(async data => {
    try {
      // Only include fields that were actually modified
      const updateFields: CallInput = {};      if (data.title) updateFields.title = data.title;
      if (data.description !== undefined) updateFields.description = data.description || null;
      if (data.is_open !== undefined) updateFields.is_open = data.is_open;
      if (data.start_date !== undefined) updateFields.start_date = data.start_date || null;
      if (data.end_date !== undefined) updateFields.end_date = data.end_date || null;
      if (data.category !== undefined) updateFields.category = data.category || null;
      if (data.max_applications !== undefined) updateFields.max_applications = data.max_applications || null;

      await updateCall(id, updateFields)      // Sync documents
      const existing = await fetchDocumentDefinitions(id)
      const existingIds = new Set(existing.map(d => d.id))
      const formIds = new Set(data.items.filter(i => i.id).map(i => i.id))
      
      // Delete removed documents
      const toDelete = [...existingIds].filter(i => !formIds.has(i))
      if (toDelete.length > 0) {
        await Promise.all(toDelete.map(docId => deleteDocumentDefinition(id, docId)))
      }

      // Update existing and create new documents
      await Promise.all(
        data.items.map(async doc => {
          const docInput = {
            name: doc.name,
            description: doc.description || '',
            allowed_formats: doc.allowed_formats
          }
          
          if (doc.id) {
            return updateDocumentDefinition(id, doc.id, docInput)
          } else {
            return createDocumentDefinition(id, docInput)
          }
        })
      )

      showToast('Call updated successfully', 'success')
      navigate('/admin/calls')
    } catch (error) {
      console.error(error)
      showToast('Failed to update call', 'error')
    }
  })

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Edit Call</h1>

      {/* Basic fields */}
      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Title</label>
        <input
          {...register('title')}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Date and category grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            {...register('start_date')}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">End Date</label>
          <input
            type="date"
            {...register('end_date')}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-gray-700">Category</label>
          <select
            {...register('category')}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Research">Research</option>
            <option value="Development">Development</option>
            <option value="Innovation">Innovation</option>
          </select>
        </div>
        <div>
          <label className="block font-medium text-gray-700">Max Applications</label>
          <input
            type="number"
            min={1}
            {...register('max_applications', { valueAsNumber: true })}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Open checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('is_open')}
          className="mr-2 h-4 w-4 text-blue-600"
        />
        <label className="font-medium text-gray-700">Open for applications</label>
      </div>

      {/* Documents section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Required Documents</h2>
        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="bg-white border border-gray-200 shadow-md rounded-lg">
              <div className="flex justify-between items-center bg-gray-100 border-b border-gray-200 px-4 py-2 rounded-t-lg">
                <span className="font-medium text-gray-700">Document {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete document"
                >
                  🗑️
                </button>
              </div>
              <div className="p-4 space-y-3">
                <input
                  {...register(`items.${idx}.name` as const)}
                  placeholder="Document name"
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {errors.items?.[idx]?.name && (
                  <p className="text-red-600 text-sm">{errors.items[idx].name.message}</p>
                )}
                <input
                  {...register(`items.${idx}.description` as const)}
                  placeholder="Description (optional)"
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <select
                  {...register(`items.${idx}.allowed_formats` as const)}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="image">Image</option>
                  <option value="text">Text</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => append({ name: '', description: '', allowed_formats: 'pdf' })}
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            <span className="mr-2">+</span> Add Document
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-lg transition"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
