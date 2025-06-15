import { Link } from 'react-router-dom'
import type { Role } from '../components/RoleSlider'

const roles: Role[] = ['applicant', 'reviewer', 'admin']

export default function AuthLandingPage() {
  return (
    <section className="w-full bg-gray-50 py-16 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">Choose Your Role</h1>
        {roles.map((role) => (
          <div key={role} className="bg-white p-4 rounded shadow text-center space-y-2">
            <h2 className="text-lg font-semibold capitalize">{role}</h2>
            <div className="flex justify-center space-x-4">
              <Link
                to={`/login/${role}`}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Login
              </Link>
              <Link
                to={`/register/${role}`}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Sign Up
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
