import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({ 
  text, 
  disabled = false, 
  speed = 3, 
  className = '' 
}) => {
  const animationStyle = {
    background: 'linear-gradient(120deg, #ea580c 40%, #fff 50%, #ea580c 60%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    animation: disabled ? 'none' : `shine ${speed}s linear infinite`,
    display: 'inline-block',
    WebkitTextFillColor: 'transparent',
    // Fallback orange color for browsers that don't support background-clip
    fallbackColor: '#ea580c',
  };

  return (
    <>
      <style>
        {`
          @keyframes shine {
            0% { background-position: 100%; }
            100% { background-position: -100%; }
          }
        `}
      </style>
      <span
        className={className}
        style={animationStyle}
      >
        {text}
      </span>
    </>
  );
};

export default ShinyText;