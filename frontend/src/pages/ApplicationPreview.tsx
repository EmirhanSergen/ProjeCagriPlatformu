import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchAttachments,
  confirmDocuments,
  type Attachment,
} from '../api';
import { useToast } from '../components/ToastProvider';

export default function ApplicationPreview() {
  const { callId } = useParams();
  const [docs, setDocs] = useState<Attachment[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    if (!callId) return;
    fetchAttachments(Number(callId))
      .then(setDocs)
      .catch(() => showToast('Failed to load documents', 'error'));
  }, [callId, showToast]);

  const onConfirm = async () => {
    if (!callId) return;
    try {
      await confirmDocuments(Number(callId));
      showToast('Documents confirmed', 'success');
    } catch {
      showToast('Failed to confirm documents', 'error');
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Uploaded Documents</h1>
      {docs.length === 0 ? (
        <p>No documents uploaded.</p>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {docs.map((d) => (
            <li key={d.id}>
              <a
                href={`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/${d.file_path}`}
                className="text-blue-600 underline"
              >
                {d.file_path.split('/').pop()}
              </a>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={onConfirm}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Confirm Documents
      </button>
    </section>
  );
}
