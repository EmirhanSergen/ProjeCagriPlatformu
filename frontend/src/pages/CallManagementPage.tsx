import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  fetchCalls,
  createCall,
  updateCall,
  deleteCall,
  type Call,
  type CallInput,
} from '../api'
import { useToast } from '../components/ToastProvider'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  is_open: z.boolean().optional(),
})

export default function CallManagementPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const { showToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CallInput>({ resolver: zodResolver(schema) })

  const loadCalls = () => {
    fetchCalls()
      .then(setCalls)
      .catch(() => showToast('Failed to load calls', 'error'))
  }

  useEffect(() => {
    loadCalls()
  }, [])

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingId) {
        await updateCall(editingId, data)
        showToast('Call updated', 'success')
      } else {
        await createCall(data)
        showToast('Call created', 'success')
      }
      setEditingId(null)
      reset()
      loadCalls()
    } catch {
      showToast('Failed to save call', 'error')
    }
  })

  const onEdit = (call: Call) => {
    setEditingId(call.id)
    reset({ title: call.title, description: call.description, is_open: call.is_open })
  }

  const onDelete = async (id: number) => {
    try {
      await deleteCall(id)
      showToast('Call deleted', 'success')
      loadCalls()
    } catch {
      showToast('Failed to delete call', 'error')
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-bold">Call Management</h1>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2">Open</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.title}</td>
              <td className="p-2">{c.description}</td>
              <td className="p-2 text-center">{c.is_open ? 'Yes' : 'No'}</td>
              <td className="p-2 space-x-2 text-center">
                <button onClick={() => onEdit(c)} className="text-blue-600 underline">
                  Edit
                </button>
                <button onClick={() => onDelete(c.id)} className="text-red-600 underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={onSubmit} className="space-y-4 border p-4 rounded">
        <h2 className="text-lg font-semibold">
          {editingId ? 'Edit Call' : 'Create New Call'}
        </h2>
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
        <button disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? 'Update' : 'Create'}
        </button>
      </form>
    </section>
  )
}
