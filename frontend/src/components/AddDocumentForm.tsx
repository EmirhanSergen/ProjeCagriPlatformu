import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from './ToastProvider'

// Validation schema
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  allowed_formats: z.enum(['pdf', 'image', 'text']),
})

type FormValues = z.infer<typeof schema>

interface AddDocumentFormProps {
  onAdd: (data: { name: string; allowed_formats: string }) => Promise<void> | void
}

export default function AddDocumentForm({ onAdd }: AddDocumentFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { name: '', allowed_formats: 'pdf' },
    })
  const { showToast } = useToast()

  const onSubmit = async (data: FormValues) => {
    try {
      await onAdd(data)
      showToast('Document saved', 'success')
      reset()
    } catch {
      showToast('Failed to save document', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
      <input
        {...register('name')}
        placeholder="Document name"
        className="border p-2 rounded flex-1"
        disabled={isSubmitting}
      />
      {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}

      <select
        {...register('allowed_formats')}
        className="border p-2 rounded"
        disabled={isSubmitting}
      >
        <option value="pdf">PDF</option>
        <option value="image">Image</option>
        <option value="text">Text</option>
      </select>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
