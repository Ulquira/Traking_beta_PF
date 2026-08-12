import logoColor from '@/assets/logo.png';
import logoWhite from '@/assets/logo-white.png';

interface PeruFibraLogoProps {
  className?: string;
  white?: boolean;
}

export const PeruFibraLogo = ({ className = '', white = false }: PeruFibraLogoProps) => {
  return (
    <img 
      src={white ? logoWhite : logoColor} 
      alt="Perú Fibra" 
      className={`object-contain ${className}`}
    />
  );
};
