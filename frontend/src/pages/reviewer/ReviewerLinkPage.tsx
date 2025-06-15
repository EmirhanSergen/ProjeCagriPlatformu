import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { acceptReviewerInvite } from '../../api'
import { useToast } from '../../components/ToastProvider'

export default function ReviewerLinkPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await acceptReviewerInvite(code)
      showToast('Invite accepted! You can now log in.', 'success')
      navigate('/login/reviewer')
    } catch (err: any) {
      showToast(err?.message || 'Failed to accept invite', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="w-full bg-gray-50 py-16 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg space-y-4">
        <h1 className="text-2xl font-bold text-center">Link Reviewer Account</h1>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Invite Code"
            className="w-full border rounded p-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </section>
  )
}
