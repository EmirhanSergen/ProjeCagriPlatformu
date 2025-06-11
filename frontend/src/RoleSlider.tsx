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
        className="w-full"
      />
      <div className="text-center font-semibold capitalize">{value}</div>
    </div>
  );
}

export default RoleSlider;
