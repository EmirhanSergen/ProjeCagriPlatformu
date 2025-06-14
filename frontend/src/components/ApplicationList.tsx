import { useEffect, useState } from 'react';
import { fetchApplications, type ApplicationDetail, downloadAttachment } from '../api';
import { useToast } from './ToastProvider';
import { downloadBlob } from '../lib/download';

interface Props {
  callId: number;
}

type Filter = 'all' | 'submitted' | 'inprogress';

export default function ApplicationList({ callId }: Props) {
  const [applications, setApplications] = useState<ApplicationDetail[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const { showToast } = useToast();

  useEffect(() => {
    fetchApplications(callId)
      .then(setApplications)
      .catch(() => showToast('Failed to load applications', 'error'));
  }, [callId, showToast]);

  const filtered = applications.filter((a) => {
    if (filter === 'submitted') return a.documents_confirmed;
    if (filter === 'inprogress') return !a.documents_confirmed;
    return true;
  });

  return (
    <section className="space-y-4">
      <div className="space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('submitted')}
          className={`px-3 py-1 rounded ${filter === 'submitted' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Submitted
        </button>
        <button
          onClick={() => setFilter('inprogress')}
          className={`px-3 py-1 rounded ${filter === 'inprogress' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          In Progress
        </button>
      </div>

      {filtered.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((app) => (
            <li key={app.id} className="border p-4 rounded shadow">
              <p className="font-semibold">{app.user_email}</p>
              <p>Status: {app.documents_confirmed ? 'Submitted' : 'In Progress'}</p>
              {app.attachments.length > 0 && (
                <ul className="list-disc pl-5">
                  {app.attachments.map((att) => (
                    <li key={att.id}>
                      <button
                        onClick={async () => {
                          try {
                            const blob = await downloadAttachment(att.id)
                            downloadBlob(blob, att.file_name)
                          } catch {
                            showToast('Failed to download file', 'error')
                          }
                        }}
                        className="text-blue-600 underline"
                      >
                        {att.file_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
