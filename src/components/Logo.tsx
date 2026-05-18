import React from 'react';
import brainRaspberry from '../assets/brain-raspberry.svg';

type Props = {
  className?: string;
  showIcon?: boolean;
};

const Logo: React.FC<Props> = ({ className = '', showIcon = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    {showIcon && (
      <img src={brainRaspberry} alt="Логотип" className="h-7 w-7 sm:h-8 sm:w-8 object-contain" />
    )}
    <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-500 bg-clip-text text-transparent font-extrabold tracking-tight text-lg sm:text-xl">
      TargetLayer
    </span>
  </div>
);

export default Logo;
