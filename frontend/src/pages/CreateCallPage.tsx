import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { createCall, createDocumentDefinition } from '../api'
import { useToast } from '../components/ToastProvider'

const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  allowed_format: z.enum(['pdf', 'image', 'text']),
})

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  is_open: z.boolean().optional(),
  items: z.array(itemSchema),
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
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { items: [] } })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const onSubmit = handleSubmit(async (data) => {
    try {
      const call = await createCall({ title: data.title, description: data.description, is_open: data.is_open })
      for (const item of data.items) {
        await createDocumentDefinition(call.id, {
          name: item.name,
          description: item.description,
          allowed_formats: item.allowed_format,
        })
      }
      showToast('Call created', 'success')
      navigate('/admin/calls')
    } catch {
      showToast('Failed to create call', 'error')
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Create Call</h1>
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
          <input type="checkbox" {...register('is_open')} defaultChecked />
          <span>Open</span>
        </label>
      </div>
      <div>
        <h2 className="font-semibold">Required Items</h2>
        {fields.map((field, idx) => (
          <div key={field.id} className="border p-2 space-y-2 mb-2">
            <input {...register(`items.${idx}.name` as const)} placeholder="Name" className="border p-1 w-full" />
            <input {...register(`items.${idx}.description` as const)} placeholder="Description" className="border p-1 w-full" />
            <select {...register(`items.${idx}.allowed_format` as const)} className="border p-1 w-full">
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="text">Text</option>
            </select>
            <button type="button" onClick={() => remove(idx)} className="text-red-600 underline">Delete</button>
          </div>
        ))}
        <button type="button" onClick={() => append({ name: '', description: '', allowed_format: 'pdf' })} className="bg-gray-200 px-2 py-1 rounded">
          Add Item
        </button>
      </div>
      <button disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded">
        Create
      </button>
    </form>
  )
}
