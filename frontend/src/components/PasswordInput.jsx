import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = React.forwardRef(({ error, className = '', ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full relative">
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={`w-full px-4 py-3 rounded-lg auth-input pr-12 ${className} ${
            error ? 'border-red-500/50 focus:border-red-500 focus:box-shadow-none' : ''
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-amber-500 transition-colors duration-200 outline-none"
          tabIndex="-1"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1.5 font-medium flex items-center animate-fade-in">
          {error.message}
        </p>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
