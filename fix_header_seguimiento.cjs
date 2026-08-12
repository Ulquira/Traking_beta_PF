const fs = require('fs');

const file = 'src/pages/Seguimiento.tsx';
let code = fs.readFileSync(file, 'utf8');

const headerIndex = code.indexOf('<header');
const headerEnd = code.indexOf('</header>') + 9;

const top = code.substring(0, headerIndex);
const bottom = code.substring(headerEnd);

const newHeader = `      <header className="bg-gradient-to-b from-primary via-primary/80 to-transparent pt-4 pb-12 relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.05\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-6">
              <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <img src="/src/assets/logo-1.png" alt="Peru Fibra" className="h-6 md:h-8 lg:h-10 w-auto object-contain drop-shadow-lg transition-all" />
              </div>
              <div className="hidden md:block pl-6 border-l-2 border-white/20">
                <button onClick={() => navigate('/')} className="flex items-center text-sm font-bold text-white/80 hover:text-white transition-colors uppercase tracking-wider">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Portal
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button onClick={() => window.open('tel:017546000')} className="hidden sm:flex bg-secondary hover:bg-yellow-500 text-black border-0 font-bold rounded-full shadow-lg px-6">
                <Phone className="w-4 h-4 mr-2" /> Llamar a Central
              </Button>
              <ModeToggle />
            </div>
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-center pb-4"
          >
            <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight text-white drop-shadow-md" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Seguimiento de Instalación
            </h1>
            <p className="text-black font-black text-sm tracking-widest uppercase bg-secondary inline-block px-5 py-1.5 rounded-full shadow-md">
              Ticket: #{dni}
            </p>
          </motion.div>
        </div>
      </header>`;

fs.writeFileSync(file, top + newHeader + bottom);