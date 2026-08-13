
import logoImg from '../assets/logo-1.png';
import logoWhite from '../assets/logo-white.png';

export const MainLogo = ({ white = false, className = '' }: { white?: boolean, className?: string }) => {
  return (
    <img 
      src={white ? logoWhite : logoImg} 
      alt="Perú Fibra" 
      className={`object-contain ${className}`} 
    />
  );
};
