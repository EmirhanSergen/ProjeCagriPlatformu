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

  // 1) Uygulama verisini çekiyoruz (varsa oluşturulur)
  const { data: application, isLoading, isError } = useQuery<Application>({
    queryKey: ['application', cid],
    queryFn: () => fetchApplicationByUserAndCall(cid),
    enabled: !!cid,
  })

  // 2) Submit mutasyonu
  const { mutate: submitMutate, isPending: isSubmitting } = useMutation({
  mutationFn: () => submitApplicationStatus(application!.id),
  onSuccess: () => {
    showToast('Application submitted successfully', 'success')
    navigate('/dashboard')
  },
  onError: () => {
    showToast('Failed to submit application', 'error')
  },
})

  // 3) Önce doküman onayı, sonra submit
  const handleSubmit = async () => {
    if (!application) return
    try {
      await confirmDocuments(application.id)
      submitMutate()
    } catch {
      showToast('Failed to confirm documents', 'error')
    }
  }

  if (isLoading) return <p className="p-4">Loading application…</p>
  if (isError || !application)
    return <p className="p-4 text-red-600">Unable to load application.</p>

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Submit Your Application</h2>
      <p className="text-gray-600 text-sm">
        Please review your application and documents before submitting. Once submitted,
        you will not be able to make further changes.
      </p>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting…' : 'Submit Application'}
      </Button>
    </div>
  )
}