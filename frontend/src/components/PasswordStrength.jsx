import React from 'react';

const PasswordStrength = ({ password }) => {
  const getStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: 'bg-gray-600', width: 'w-0' };
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score < 3) return { score: 1, text: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    if (score < 4) return { score: 2, text: 'Good', color: 'bg-yellow-500', width: 'w-2/3' };
    return { score: 3, text: 'Strong', color: 'bg-green-500', width: 'w-full' };
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 text-xs font-medium space-y-1 animate-fade-in">
      <div className="flex justify-between items-center text-gray-400">
        <span>Password strength</span>
        <span className={strength.color.replace('bg-', 'text-')}>{strength.text}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.color} ${strength.width} transition-all duration-300 ease-out`}
        ></div>
      </div>
    </div>
  );
};

export default PasswordStrength;
