import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import {
  fetchApplicationByUserAndCall,
  confirmDocuments,
  submitApplicationStatus,
  type Application,
} from '../../api'
import { useToast } from '../../components/ToastProvider'

export default function Step4_Submit() {
  const { callId } = useParams<{ callId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const cid = Number(callId)

  const {
    data: application,
    isLoading,
    isError,
  } = useQuery<Application>({
    queryKey: ['application', cid],
    queryFn: () => fetchApplicationByUserAndCall(cid),
    enabled: !!cid,
  })

  const { mutate: submitMutate, isPending: isSubmitting } = useMutation({
    mutationFn: () => submitApplicationStatus(application!.id),
    onSuccess: () => {
      showToast('✅ Application submitted successfully!', 'success')
      navigate('/dashboard')
    },
    onError: () => {
      showToast('❌ Failed to submit application', 'error')
    },
  })

  const handleSubmit = async () => {
    if (!application) return
    try {
      await confirmDocuments(application.id)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (!msg.includes('Attachments already confirmed')) {
        showToast(msg || 'Failed to confirm documents', 'error')
        return
      }
    }
    submitMutate()
  }

  if (isLoading) return <p className="p-6 text-gray-600">Loading application…</p>
  if (isError || !application)
    return <p className="p-6 text-red-600">Unable to load application.</p>

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Final Step: Submit Your Application</h2>

      <div className="text-sm text-gray-700 leading-relaxed">
        <p>Please make sure that all required documents are uploaded and confirmed.</p>
        <p className="mt-1">After submission, you <strong>will not be able to make changes</strong> to your application.</p>
      </div>

      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full text-center py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting…' : '🚀 Submit Application'}
        </Button>
      </div>
    </div>
  )
}
