const fs = require('fs');
const content = `import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/ModeToggle";
import homeBg from "../assets/home.png";
import logoImg from "../assets/logo-1.png";
import textBannerImg from "../assets/text-banner.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen bg-primary transition-colors duration-300 relative overflow-hidden flex flex-col font-['Corbel']"
    >
      {/* Header con Degradado Rojo fundiéndose a la imagen */}
      <header className="absolute top-0 w-full z-50 pt-4 pb-12 bg-gradient-to-b from-primary via-primary/80 to-transparent">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img src={logoImg} alt="Peru Fibra" className="h-6 md:h-8 lg:h-10 w-auto object-contain drop-shadow-lg transition-all" />
          </div>
          
          <div className="flex items-center gap-6">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section con Imagen de Fondo (Replicando la web oficial) */}
      <div className="relative min-h-[700px] flex items-center pt-24 pb-48">
        {/* Imagen de fondo familiar full color */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: \`url(\${homeBg})\` }}
        >
          {/* Gradiente sutil solo a la izquierda para que el texto resalte */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
        </div>

        {/* Corte diagonal rojo inferior (Shape divider) exacto al diseño */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10" style={{ transform: 'translateY(2px)' }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[200px]">
            <path d="M0,120 L1200,120 L1200,0 L0,120 Z" className="fill-primary"></path>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 lg:px-12 relative z-20 flex flex-col lg:flex-row items-center justify-between gap-16 mt-8">
          
          {/* Textos de la izquierda */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left pt-24"
          >
            <img src={textBannerImg} alt="Conecta con fibra" className="max-w-full h-auto mx-auto lg:mx-0 mb-8 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" style={{ maxHeight: '270px' }} />
            
            {/* Texto de seguimiento */}
            <div className="bg-black/40 p-6 rounded-2xl backdrop-blur-sm border border-white/10 inline-block text-left">
              <h2 className="text-3xl md:text-4xl font-black mb-2 text-white leading-tight" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Sigue tu <span className="text-secondary">instalación</span>
              </h2>
              <p className="text-lg text-gray-200 font-medium max-w-sm">
                Conoce el estado exacto de tu instalación y sigue al técnico en tiempo real.
              </p>
            </div>
          </motion.div>

          {/* Cuadro de aviso a la derecha */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-0 rounded-3xl bg-white">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-black text-gray-900" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Acceso Seguro</h3>
                <p className="text-gray-600 font-medium text-lg leading-relaxed">
                  Para ver el estado de tu instalación en tiempo real, por favor utiliza el <br/>
                  <span className="font-bold text-primary"> enlace único y seguro </span> <br/>
                  que te enviamos por WhatsApp o SMS.
                </p>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default Index;
`;
fs.writeFileSync('src/pages/Index.tsx', content, 'utf8');
