// src/pages/CreateCallPage.tsx
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { createCall, createDocumentDefinition } from '../api'
import { useToast } from '../components/ToastProvider'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardContent } from '../components/ui/Card'

// Document schema: name required, description optional, allowed_formats must be one of these
const docSchema = z.object({
  name:           z.string().min(1, 'Name is required'),
  description:    z.string().optional(),
  allowed_formats: z.enum(['pdf', 'image', 'text']),
})

// Overall form schema
const schema = z.object({
  title:       z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  is_open:     z.boolean().optional(),
  documents:   z.array(docSchema).optional(),
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
    defaultValues: { documents: [] },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents',
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      // 1) Create the call
      const newCall = await createCall({
        title:       data.title,
        description: data.description ?? null,
        is_open:     data.is_open ?? false,
      })

      // 2) Create each document definition under that call
      if (data.documents && data.documents.length) {
        await Promise.all(
          data.documents.map((d) =>
            createDocumentDefinition(newCall.id, {
              name:            d.name,
              description:     d.description ?? null,
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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <h1 className="text-2xl font-bold">Create New Call</h1>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <Input {...register('title')} placeholder="Enter call title" />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Optional description"
              rows={3}
            />
          </div>

          {/* Is Open */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('is_open')}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              defaultChecked
            />
            <label className="ml-2 text-sm text-gray-700">Open for applications</label>
          </div>

          {/* Document Definitions */}
          <div>
            <h2 className="text-lg font-medium">Required Documents</h2>
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="mt-4 p-4 border rounded space-y-2 bg-gray-50"
              >
                <Input
                  {...register(`documents.${idx}.name` as const)}
                  placeholder="Document name"
                />
                {errors.documents?.[idx]?.name && (
                  <p className="text-sm text-red-600">
                    {errors.documents[idx]?.name?.message}
                  </p>
                )}

                <Input
                  {...register(`documents.${idx}.description` as const)}
                  placeholder="Description (optional)"
                />

                <select
                  {...register(`documents.${idx}.allowed_formats` as const)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="pdf">PDF</option>
                  <option value="image">Image</option>
                  <option value="text">Text</option>
                </select>
                {errors.documents?.[idx]?.allowed_formats && (
                  <p className="text-sm text-red-600">
                    {errors.documents[idx]?.allowed_formats?.message}
                  </p>
                )}

                <Button
                  variant="destructive"
                  onClick={() => remove(idx)}
                >
                  Delete
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({ name: '', description: '', allowed_formats: 'pdf' })
              }
            >
              + Add Item
            </Button>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Creating…' : 'Create Call'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
