const fs = require('fs');
const code = fs.readFileSync('src/pages/Index.tsx', 'utf8');
const top = code.substring(0, code.indexOf('return ('));
const bottom = `return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background transition-colors duration-300 relative overflow-hidden flex flex-col font-['Corbel']"
    >
      {/* Header estilo PeruFibra */}
      <header className="border-b-4 border-primary bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <PeruFibraLogo className="h-12 w-auto" />
            <div className="hidden md:block pl-4 border-l-2 border-muted h-8 pt-1">
              <span className="text-sm font-bold text-foreground tracking-widest uppercase">Portal de Clientes</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-full p-1 border border-primary/20">
               <ModeToggle />
            </div>
            <Button
              onClick={() => window.open('https://perufibra.pe/', '_blank')}
              className="hidden sm:flex rounded-full bg-primary hover:bg-primary-light text-white font-bold"
            >
              Ir a la web principal
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section con Banner Oscuro similar a la web */}
      <div className="bg-[#1a1a1a] relative py-16 md:py-24 overflow-hidden border-b-4 border-secondary">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex-1 text-center md:text-left"
            >
              <h2 className="text-4xl md:text-5xl font-['Helvetica_Neue'] font-black mb-4 text-white leading-tight">
                Sigue tu <span className="text-secondary">instalación</span> <br/>en tiempo real
              </h2>
              <p className="text-xl text-gray-300 mb-8 font-medium">
                Conoce el estado de tu orden y el recorrido del técnico asignado de manera rápida y sencilla.
              </p>
            </motion.div>

            {/* Cuadro de búsqueda */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md"
            >
              <Card className="p-8 shadow-2xl border-t-8 border-t-primary rounded-2xl bg-card">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground font-['Helvetica_Neue']">Rastrea tu Servicio</h3>
                    <p className="text-muted-foreground mt-2">Ingresa tus datos para continuar</p>
                  </div>
                  
                  <div>
                    <label htmlFor="dni" className="block text-sm font-bold mb-3 text-foreground">
                      DNI o Número de Orden
                    </label>
                    <Input
                      id="dni"
                      type="text"
                      placeholder="Ej: 42306775"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      className="text-lg h-14 rounded-xl border-2 border-border focus-visible:ring-primary focus-visible:border-primary bg-muted/50 mb-4"
                    />
                    <Button type="submit" className="w-full h-14 rounded-xl bg-primary hover:bg-primary-light text-white text-lg font-bold shadow-lg transition-transform hover:-translate-y-1">
                      Rastrear Instalación
                    </Button>
                  </div>
                  
                  <div className="bg-accent/30 p-4 rounded-xl border border-accent">
                    <p className="text-xs text-center font-medium text-foreground mb-2">DNIs de prueba disponibles:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['42306775', '08574000', '70861049'].map(num => (
                        <button 
                          key={num} 
                          type="button" 
                          onClick={() => setDni(num.toString())}
                          className="text-xs bg-white dark:bg-black px-2 py-1 rounded border hover:border-primary hover:text-primary font-bold transition-colors"
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
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-auto bg-card relative z-10">
        <div className="container mx-auto px-4 py-8 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <PeruFibraLogo className="scale-50 origin-left" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            © 2026 Perú Fibra. Transformando la experiencia de conectividad.
          </p>
        </div>
      </footer>
    </motion.div>
  );
};

export default Index;`;
fs.writeFileSync('src/pages/Index.tsx', top + bottom);
