const fs = require('fs');

const file = 'src/pages/Seguimiento.tsx';
let code = fs.readFileSync(file, 'utf8');

const mainStart = code.indexOf('<main');
const buttonsStart = code.indexOf('{/* Botones de Acción */}');

const top = code.substring(0, mainStart);
const mainContent = code.substring(mainStart, buttonsStart);
const bottom = code.substring(buttonsStart);

const newMainContent = mainContent.replace('<FadeUpBox delay={0.1}>', `{status === 'cerrada' ? (
            <FadeUpBox delay={0.1}>
              <Card className="p-8 shadow-xl shadow-black/5 border-0 rounded-[2rem] bg-card text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-foreground mb-4">Atención Cerrada</h2>
                <p className="text-lg text-muted-foreground mb-8 font-medium">
                  {getMessage()}
                </p>
                <Button 
                  onClick={() => window.open('tel:017546000')} 
                  className="bg-secondary hover:bg-yellow-500 text-black font-bold rounded-xl h-14 px-8 shadow-lg"
                >
                  <Phone className="w-5 h-5 mr-2" /> Llamar a ATC
                </Button>
              </Card>
            </FadeUpBox>
          ) : (
            <>
              <FadeUpBox delay={0.1}>`).replace('</AnimatePresence>\n\n          ', '</AnimatePresence>\n            </>\n          )\n\n          ');

fs.writeFileSync(file, top + newMainContent + bottom);
