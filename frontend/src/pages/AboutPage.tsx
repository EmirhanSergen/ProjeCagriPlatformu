import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <section className="w-full bg-white py-16 px-6">
      <div className="max-w-screen-xl mx-auto space-y-10 text-gray-800">
        <h1 className="text-4xl sm:text-5xl font-bold text-center">
          About Project Call Platform
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-center">
          Our mission is to simplify and centralize academic & R&D project calls. 
          We empower applicants, reviewers, and administrators with a seamless, 
          end-to-end platform for submission, evaluation, and decision-making.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Easy Submission',
              desc: 'Upload documents, track progress, and finalize your proposal with intuitive forms and autosave functionality.',
              color: 'from-blue-50 to-blue-100',
            },
            {
              title: 'Streamlined Reviews',
              desc: 'Reviewers receive anonymized abstracts, submit scores, and leave feedback through our unified review interface.',
              color: 'from-green-50 to-green-100',
            },
            {
              title: 'Admin Dashboard',
              desc: 'Manage calls, match reviewers, monitor evaluation status, and export reports with real-time analytics and Google Sheets sync.',
              color: 'from-purple-50 to-purple-100',
            },
          ].map(({ title, desc, color }) => (
            <div
              key={title}
              className={`bg-gradient-to-br ${color} p-6 rounded-lg shadow hover:shadow-md transition`}
            >
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              <p>{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/calls"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Browse Calls
          </Link>
        </div>
      </div>
    </section>
  )
}
