// src/components/RoleSlider.tsx
import React from 'react'

export type Role = 'applicant' | 'reviewer' | 'admin'

interface RoleSliderProps {
  value: Role
  onChange: (role: Role) => void
}

const roles: Role[] = ['applicant', 'reviewer', 'admin']

export default function RoleSlider({ value, onChange }: RoleSliderProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
      <div className="flex border border-gray-300 rounded-md overflow-hidden">
        {roles.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={`flex-1 py-2 text-center text-sm font-medium capitalize transition-colors ${
              r === value
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}
