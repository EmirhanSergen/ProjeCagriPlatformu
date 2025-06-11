import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCalls } from '../api';
import type { Call } from '../api';
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
    <div>
      {calls.length === 0 ? (
        <p>No open calls at the moment.</p>
      ) : (
        <ul className="grid gap-4">
          {calls.map((c) => (
            <li key={c.id} className="border rounded p-4 shadow bg-white">
              <h3 className="text-lg font-semibold">
                <Link to={`/calls/${c.id}`}>{c.title}</Link>
              </h3>
              {c.description && (
                <p className="text-sm text-gray-700 mt-1">{c.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CallList;
