import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { createCall, createDocumentDefinition } from '../../api'
import { useToast } from '../../components/ToastProvider'

const allowedFormats = ['pdf', 'image', 'text'] as const
const docSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  allowed_formats: z.enum(allowedFormats),
})

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  is_open: z.boolean().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  category: z.enum(['Research', 'Development', 'Innovation']),
  max_applications: z.coerce.number().int().min(1),
  documents: z.array(docSchema),
})

type FormValues = z.infer<typeof schema>

export default function CreateCallPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      documents: [],
      category: 'Research',
      max_applications: 1,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents',
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      const newCall = await createCall({
        title: data.title,
        description: data.description ?? null,
        is_open: data.is_open ?? false,
        category: data.category,
        start_date: data.start_date ?? null,
        end_date: data.end_date ?? null,
        max_applications: data.max_applications,
      })

      if (data.documents?.length > 0) {
        await Promise.all(
          data.documents.map((d) =>
            createDocumentDefinition(newCall.id, {
              name: d.name,
              description: d.description ?? null,
              allowed_formats: d.allowed_formats,
            })
          )
        )
      }

      showToast('Call created successfully', 'success')
      navigate('/admin/calls')
    } catch (err) {
      console.error(err)
      showToast('Failed to create call', 'error')
    }
  })

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Create New Call</h1>

      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Title</label>
        <input {...register('title')} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="block font-medium text-gray-700">Description</label>
        <textarea {...register('description')} rows={3} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-gray-700">Start Date</label>
          <input type="date" {...register('start_date')} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block font-medium text-gray-700">End Date</label>
          <input type="date" {...register('end_date')} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-gray-700">Category</label>
          <select {...register('category')} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Research">Research</option>
            <option value="Development">Development</option>
            <option value="Innovation">Innovation</option>
          </select>
        </div>
        <div>
          <label className="block font-medium text-gray-700">Max Applications</label>
          <input type="number" min={1} {...register('max_applications', { valueAsNumber: true })} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="flex items-center">
        <input type="checkbox" {...register('is_open')} className="mr-2 h-4 w-4 text-blue-600" />
        <label className="font-medium text-gray-700">Open for applications</label>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Required Documents</h2>
        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="bg-white border border-gray-200 shadow-md rounded-lg">
              <div className="flex justify-between items-center bg-gray-100 border-b border-gray-200 px-4 py-2 rounded-t-lg">
                <span className="font-medium text-gray-700">Document {idx + 1}</span>
                <button type="button" onClick={() => remove(idx)} className="text-red-600 hover:text-red-800" title="Delete document">🗑️</button>
              </div>
              <div className="p-4 space-y-3">
                <input {...register(`documents.${idx}.name` as const)} placeholder="Document name" className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                {errors.documents?.[idx]?.name && <p className="text-red-600 text-sm">{errors.documents[idx].name.message}</p>}
                <input {...register(`documents.${idx}.description` as const)} placeholder="Description (optional)" className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                <select {...register(`documents.${idx}.allowed_formats` as const)} className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="pdf">PDF</option>
                  <option value="image">Image</option>
                  <option value="text">Text</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button type="button" onClick={() => append({ name: '', description: '', allowed_formats: 'pdf' })} className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow">
            <span className="mr-2">+</span> Add Document
          </button>
        </div>
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-lg transition">
        {isSubmitting ? 'Creating...' : 'Create Call'}
      </button>
    </form>
  )
}
