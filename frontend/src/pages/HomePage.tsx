import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    // Full-width background section
    <section className="w-full bg-gradient-to-b from-blue-100 to-white py-16 px-6">
      {/* Centered container for content */}
      <div className="max-w-screen-xl mx-auto flex flex-col items-center space-y-10 text-gray-800">
        {/* Hero Header */}
        <h1 className="text-4xl sm:text-5xl font-bold text-center">
          Welcome to the Project Call Platform
        </h1>

        {/* Intro Description */}
        <p className="max-w-2xl text-lg sm:text-xl text-center">
          Our platform connects researchers, developers, and innovators with the latest
          academic &amp; R&D project calls. Whether you're seeking funding opportunities,
          collaboration partners, or expert reviewers, find everything in one place.
        </p>

        {/* Who Should Use Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-2">Applicants</h2>
            <p>
              Submit your proposals with ease, track application progress, and receive reviews
              anonymously by expert evaluators.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-2">Reviewers</h2>
            <p>
              Evaluate submissions, provide feedback, and contribute to fair project selection
              with a streamlined review interface.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-2">Administrators</h2>
            <p>
              Manage calls, assign reviewers, monitor evaluation status, and export reports for
              data-driven decision-making.
            </p>
          </div>
        </div>

        {/* Call Explanation */}
        <div className="max-w-2xl text-center">
          <h3 className="text-2xl font-semibold mb-2">What Are Project Calls?</h3>
          <p>
            Project calls are formal invitations published by funding agencies or institutions
            seeking proposals for specific research or development topics. They outline objectives,
            submission deadlines, and evaluation criteria.
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex space-x-4">
          <Link
            to="/calls"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Browse Calls
          </Link>
          <Link
            to="/register"
            className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  )
}
