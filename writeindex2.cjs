const fs = require('fs');
const code = fs.readFileSync('src/pages/Index.tsx', 'utf8');
const top = code.substring(0, code.indexOf('return ('));
const bottom = `return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen bg-primary transition-colors duration-300 relative overflow-hidden flex flex-col font-['Corbel']"
    >
      {/* Header Transparente como la web oficial */}
      <header className="absolute top-0 w-full z-50 bg-transparent pt-4 pb-2">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img src="/src/assets/logo-alt-1.png" alt="Peru Fibra" className="h-12 md:h-16 w-auto object-contain drop-shadow-lg" />
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-white font-bold text-sm tracking-wide">
              <a href="#" className="hover:text-secondary transition-colors drop-shadow-md">Inicio</a>
              <a href="#" className="hover:text-secondary transition-colors drop-shadow-md">Planes</a>
              <a href="#" className="hover:text-secondary transition-colors drop-shadow-md">Cobertura</a>
              <Button className="bg-secondary hover:bg-yellow-500 text-black font-bold rounded-full px-8 py-5 shadow-lg">
                Escríbenos
              </Button>
            </nav>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section con Imagen de Fondo (Replicando la web oficial) */}
      <div className="relative min-h-[700px] flex items-center pt-24 pb-48">
        {/* Imagen de fondo familiar full color */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/src/assets/home.png")' }}
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
            className="flex-1 text-center lg:text-left pt-10"
          >
            <img src="/src/assets/text-banner.png" alt="Conecta con fibra" className="max-w-full h-auto mx-auto lg:mx-0 mb-8 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" style={{ maxHeight: '180px' }} />
            
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

          {/* Cuadro de búsqueda a la derecha */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-0 rounded-3xl bg-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-gray-900" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Rastrea tu Servicio</h3>
                  <p className="text-gray-500 mt-2 font-medium">Ingresa tu DNI para continuar</p>
                </div>
                
                <div>
                  <Input
                    id="dni"
                    type="text"
                    placeholder="Ej: 42306775"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className="text-xl h-16 rounded-xl border-2 border-gray-200 focus-visible:ring-primary focus-visible:border-primary mb-4 text-center font-bold tracking-widest text-black bg-gray-50"
                  />
                  <Button type="submit" className="w-full h-16 rounded-xl bg-primary hover:bg-red-700 text-white text-lg font-bold shadow-lg transition-transform hover:-translate-y-1">
                    Consultar Estado
                  </Button>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <p className="text-xs text-center font-bold text-gray-700 mb-2">DNIs de prueba disponibles:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['42306775', '08574000', '70861049'].map(num => (
                      <button 
                        key={num} 
                        type="button" 
                        onClick={() => setDni(num.toString())}
                        className="text-xs bg-white text-gray-600 px-3 py-1.5 rounded-md border border-gray-200 hover:border-primary hover:text-primary font-bold transition-colors shadow-sm"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </Card>
          </motion.div>

        </div>
      </div>

    </motion.div>
  );
};

export default Index;`;
fs.writeFileSync('src/pages/Index.tsx', top + bottom);
