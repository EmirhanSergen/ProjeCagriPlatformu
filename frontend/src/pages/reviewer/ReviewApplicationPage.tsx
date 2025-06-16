import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  fetchApplicationDetails,
  fetchMyReviews,
  submitReview,
  updateReview,
  downloadAttachmentForReview,
  type ApplicationDetail,
  type Attachment,
} from '../../api'
import { useToast } from '../../components/ToastProvider'
import { downloadBlob } from '../../lib/download'
import { getDisplayFileName } from '../../lib/file'

export default function ReviewApplicationPage() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewId, setReviewId] = useState<number | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (!applicationId) return
    const load = async () => {
      try {
        const [app, myReviews] = await Promise.all([
          fetchApplicationDetails(Number(applicationId)),
          fetchMyReviews().catch(() => []),
        ])
        setApplication(app)
        const myReview = myReviews.find(r => r.application_id === Number(applicationId))
        if (myReview) {
          setScore(myReview.score)
          setComment(myReview.comment || '')
          setReviewId(myReview.id)
        }
      } catch {
        showToast('Failed to load application', 'error')
      }
    }
    load()
  }, [applicationId, showToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!applicationId) return
    try {
      if (reviewId) {
        await updateReview(reviewId, { score, comment })
        showToast('Review updated', 'success')
      } else {
        const r = await submitReview({
          application_id: Number(applicationId),
          score,
          comment,
        })
        setReviewId(r.id)
        showToast('Review submitted', 'success')
      }
    } catch {
      showToast('Failed to submit review', 'error')
    }
  }

  const handleView = async (att: Attachment) => {
    try {
      const blob = await downloadAttachmentForReview(att.id)
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch {
      showToast('Failed to load attachment', 'error')
    }
  }

  if (!application) return <p className="p-4">Loading...</p>

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-bold">Application #{application.id}</h1>

      <div className="space-y-1">
        <p>
          <strong>Applicant:</strong> {application.user.email}
        </p>
        <p>
          <strong>Documents Confirmed:</strong>{' '}
          {application.documents_confirmed ? 'Yes' : 'No'}
        </p>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Attachments</h2>
        {application.attachments.length > 0 ? (
          <ul className="list-disc ml-5 space-y-1">
            {application.attachments.map(att => (
              <li key={att.id}>
                <button
                  onClick={() => handleView(att)}
                  className="text-blue-600 underline mr-2"
                >
                  View
                </button>
                <button
                  onClick={async () => {
                    try {
                      const blob = await downloadAttachmentForReview(att.id)
                      downloadBlob(blob, att.file_name)
                    } catch {
                      showToast('Failed to download', 'error')
                    }
                  }}
                  className="text-blue-600 underline"
                >
                  Download
                </button>
                <span className="ml-2">{getDisplayFileName(att.file_name)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No attachments.</p>
        )}
      </div>

      {previewUrl && (
        <div>
          {previewUrl.endsWith('.pdf') ? (
            <iframe
              src={previewUrl}
              className="w-full h-96 border"
              title="Preview"
            />
          ) : (
            <img src={previewUrl} alt="preview" className="max-h-96" />
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Score</label>
          <input
            type="number"
            value={score}
            onChange={e => setScore(Number(e.target.value))}
            className="border p-2 rounded w-20"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Comment</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="border p-2 rounded w-full"
            rows={4}
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {reviewId ? 'Update Review' : 'Submit Review'}
        </button>
      </form>
    </section>
  )
}
