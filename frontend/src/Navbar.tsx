import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-gray-800 text-white">
      <div className="mx-[5%] grid grid-cols-1 gap-4 py-3 sm:grid-cols-3 items-center">
        <div className="flex justify-center sm:justify-start flex-1">
          <Link to="/" className="text-lg font-semibold hover:underline">
            Project Call Platform
          </Link>
        </div>
        <div className="flex justify-center space-x-12 flex-1">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/calls" className="hover:underline">Calls</Link>
          <Link to="/about" className="hover:underline">About</Link>
        </div>
        <div className="flex justify-center sm:justify-end space-x-6 flex-1">
          <Link to="/login" className="bg-blue-500 px-3 py-1 rounded">Login</Link>
          <Link to="/register" className="bg-green-500 px-3 py-1 rounded">Sign Up</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;
