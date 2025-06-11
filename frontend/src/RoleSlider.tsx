import React from 'react';

export type Role = 'applicant' | 'reviewer' | 'admin';

interface RoleSliderProps {
  value: Role;
  onChange: (role: Role) => void;
}

const roles: Role[] = ['applicant', 'reviewer', 'admin'];

function RoleSlider({ value, onChange }: RoleSliderProps) {
  const index = roles.indexOf(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = Number(e.target.value);
    onChange(roles[newIndex]);
  };

  return (
    <div className="space-y-2">
      <input
        type="range"
        min={0}
        max={roles.length - 1}
        step={1}
        value={index}
        onChange={handleChange}
        className="w-full accent-blue-500"
      />
      <div className="flex justify-between text-sm font-medium capitalize">
        {roles.map((r) => (
          <span
            key={r}
            className={r === value ? 'text-blue-600 font-semibold' : ''}
          >
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

export default RoleSlider;
