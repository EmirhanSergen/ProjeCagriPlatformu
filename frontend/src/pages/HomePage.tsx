import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="text-center py-20 px-4 bg-gradient-to-b from-blue-50 via-white to-blue-50 space-y-6 rounded-lg shadow">
      <h1 className="text-3xl font-extrabold">Welcome to Project Call Platform</h1>
      <p className="max-w-xl mx-auto text-lg">
        Discover new opportunities and collaborate on exciting projects.
        Browse the latest calls or join our community by signing up.
      </p>
      <div className="space-x-4">
        <Link
          to="/calls"
          className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700"
        >
          View Calls
        </Link>
        <Link
          to="/register"
          className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700"
        >
          Sign Up
        </Link>
      </div>
    </section>
  )
}
