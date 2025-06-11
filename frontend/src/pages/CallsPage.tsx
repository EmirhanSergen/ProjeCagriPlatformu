import CallList from '../components/CallList'

export default function CallsPage() {
  return (
    <section className="space-y-6">
      <header className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Current Project Calls</h1>
        <p className="text-gray-600">
          Find a project that interests you and submit your application.
        </p>
      </header>
      <CallList />
    </section>
  )
}
