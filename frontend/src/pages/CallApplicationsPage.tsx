import { useParams } from 'react-router-dom';
import ApplicationList from '../components/ApplicationList';

export default function CallApplicationsPage() {
  const { callId } = useParams();
  if (!callId) return <p>No call selected.</p>;
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold">Applications</h1>
      <ApplicationList callId={Number(callId)} />
    </section>
  );
}
