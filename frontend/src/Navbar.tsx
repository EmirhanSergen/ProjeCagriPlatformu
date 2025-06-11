import React from 'react';

function Navbar() {
  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold">Project Call Platform</div>
        <div className="space-x-4">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">Calls</a>
          <a href="#" className="hover:underline">About</a>
        </div>
        <div className="space-x-2">
          <button className="bg-blue-500 px-3 py-1 rounded">Login</button>
          <button className="bg-green-500 px-3 py-1 rounded">Sign Up</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
