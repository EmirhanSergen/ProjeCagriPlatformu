import { Link } from 'react-router-dom'
import { useAuth } from './AuthProvider'

function Navbar() {
  const { token, role, logout } = useAuth()
  return (
    <nav className="bg-gray-800 text-white">
      <div className="mx-[5%] grid grid-cols-1 gap-4 py-3 sm:grid-cols-4 items-center">
        {/* Logo */}
        <div className="flex justify-center sm:justify-start">
          <Link to="/" className="text-lg font-semibold hover:underline">
            Project Call Platform
          </Link>
        </div>

        {/* Main links */}
        <div className="flex justify-center space-x-8">
          <Link to="/" className="hover:underline">Home</Link>
          {token && (
            <Link to="/calls" className="hover:underline">Calls</Link>
          )}
          <Link to="/about" className="hover:underline">About</Link>
          {/* Yalnız applicant */}
          {token && role === 'applicant' && (
            <Link to="/my-applications" className="hover:underline">
              My Applications
            </Link>
          )}
          {token && role === 'admin' && (
            <Link to="/admin/calls" className="hover:underline">Manage Calls</Link>
          )}
        </div>

        {/* Spacer */}
        <div />

        {/* Auth buttons */}
        <div className="flex justify-center sm:justify-end space-x-4">
          {token ? (
            <button onClick={logout} className="bg-blue-500 px-3 py-1 rounded">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="bg-blue-500 px-3 py-1 rounded">Login</Link>
              <Link to="/register" className="bg-green-500 px-3 py-1 rounded">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
