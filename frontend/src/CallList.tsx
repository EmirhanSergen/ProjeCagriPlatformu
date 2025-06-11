import { useEffect, useState } from 'react';
import { fetchCalls, Call } from './api';
import { useToast } from './ToastProvider';

function CallList() {
  const [calls, setCalls] = useState<Call[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCalls(true)
      .then(setCalls)
      .catch(() => showToast('Failed to load calls', 'error'));
  }, [showToast]);

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">Open Calls</h2>
      <ul className="list-disc list-inside">
        {calls.map((c) => (
          <li key={c.id}>
            <div className="font-semibold">{c.title}</div>
            {c.description && <p className="text-sm">{c.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CallList;
