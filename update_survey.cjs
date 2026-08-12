const fs = require('fs');

const file = 'src/pages/Seguimiento.tsx';
let code = fs.readFileSync(file, 'utf8');

const start = code.indexOf('{/* Encuesta (Solo Finalizada) */}');
const end = code.indexOf('{/* Botones de Acción */}');

const newCode = `{/* Encuesta (Solo Finalizada) */}
          <AnimatePresence>
            {status === 'finalizada' && !encuestaEnviada && (
              <FadeUpBox delay={0.4}>
                <Card className="p-8 shadow-xl shadow-black/5 border-0 rounded-[2rem] bg-card">
                  <div className="flex items-center gap-3 mb-8">
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    <h2 className="text-2xl font-bold text-foreground">Cuéntanos sobre tu experiencia</h2>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                      <p className="font-bold mb-4 text-foreground text-lg">¿El técnico llegó dentro del horario acordado?</p>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="radio" name="q1" value="Sí" onChange={(e) => setEncuesta({...encuesta, llego_horario: e.target.value})} className="accent-primary w-5 h-5 cursor-pointer" /> 
                          <span className="font-medium group-hover:text-primary transition-colors">Sí</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="radio" name="q1" value="No" onChange={(e) => setEncuesta({...encuesta, llego_horario: e.target.value})} className="accent-primary w-5 h-5 cursor-pointer" /> 
                          <span className="font-medium group-hover:text-primary transition-colors">No</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                      <p className="font-bold mb-4 text-foreground text-lg">¿Cómo calificaría la amabilidad y profesionalismo del técnico?</p>
                      <div className="flex flex-col gap-3">
                        {['Excelente', 'Bueno', 'Aceptable', 'Malo', 'Muy malo'].map(opt => (
                          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                            <input type="radio" name="q2" value={opt} onChange={(e) => setEncuesta({...encuesta, calificacion_tecnico: e.target.value})} className="accent-primary w-5 h-5 cursor-pointer" /> 
                            <span className="font-medium group-hover:text-primary transition-colors">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                      <p className="font-bold mb-4 text-foreground text-lg">¿El técnico explicó de manera clara cómo utilizar su servicio de Internet?</p>
                      <div className="flex flex-col gap-3">
                        {['Sí, muy claro', 'Sí, algo claro', 'No, no explicó bien', 'No, no me explicó nada'].map(opt => (
                          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                            <input type="radio" name="q3" value={opt} onChange={(e) => setEncuesta({...encuesta, explicacion_clara: e.target.value})} className="accent-primary w-5 h-5 cursor-pointer" /> 
                            <span className="font-medium group-hover:text-primary transition-colors">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                      <p className="font-bold mb-4 text-foreground text-lg">¿El proceso de instalación se realizó en el tiempo adecuado?</p>
                      <div className="flex flex-col gap-3">
                        {['Sí, completamente', 'Sí, fue adecuado', 'Fue lento', 'No, fue muy lento'].map(opt => (
                          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                            <input type="radio" name="q4" value={opt} onChange={(e) => setEncuesta({...encuesta, tiempo_adecuado: e.target.value})} className="accent-primary w-5 h-5 cursor-pointer" /> 
                            <span className="font-medium group-hover:text-primary transition-colors">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                      <p className="font-bold mb-4 text-foreground text-lg">¿La información en esta página fue clara y suficiente para entender todo el proceso de instalación?</p>
                      <div className="flex flex-col gap-3">
                        {['Sí, completamente', 'En su mayoría, sí', 'No, faltaba información', 'No, fue confusa'].map(opt => (
                          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                            <input type="radio" name="q5" value={opt} onChange={(e) => setEncuesta({...encuesta, informacion_clara: e.target.value})} className="accent-primary w-5 h-5 cursor-pointer" /> 
                            <span className="font-medium group-hover:text-primary transition-colors">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                      <p className="font-bold mb-4 text-foreground text-lg">¿Qué tan probable es que nos recomiende a sus amigos o familiares?</p>
                      <p className="text-sm text-muted-foreground mb-4">1 = Nada probable, 10 = Muy probable</p>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <label key={num} className="flex-1 min-w-[45px]">
                            <div className="relative group">
                              <input type="radio" name="nps" value={num} onChange={(e) => setEncuesta({...encuesta, probabilidad_recomendar: e.target.value})} className="peer absolute opacity-0 w-full h-full cursor-pointer z-10" />
                              <div className="border-2 border-border rounded-xl text-center py-3 font-bold text-muted-foreground peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground group-hover:border-primary/50 transition-all shadow-sm">
                                {num}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                      <p className="font-bold mb-4 text-foreground text-lg">Comentarios adicionales</p>
                      <textarea 
                        value={encuesta.comentarios}
                        onChange={(e) => setEncuesta({...encuesta, comentarios: e.target.value})}
                        className="w-full bg-card border-2 border-border rounded-xl p-5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-inner" 
                        rows={4} 
                        placeholder="Escribe aquí cualquier detalle sobre tu instalación..."
                      ></textarea>
                    </div>

                    <Button 
                      onClick={handleEncuestaSubmit}
                      disabled={isSubmittingEncuesta}
                      className="w-full bg-primary hover:bg-primary-light text-primary-foreground h-16 text-xl rounded-2xl shadow-xl shadow-primary/30 transition-all hover:-translate-y-1">
                      {isSubmittingEncuesta ? "Enviando..." : "Enviar respuestas"}
                    </Button>
                  </div>
                </Card>
              </FadeUpBox>
            )}

            {status === 'finalizada' && encuestaEnviada && (
              <FadeUpBox delay={0.2}>
                <Card className="p-8 shadow-xl shadow-black/5 border-0 rounded-[2rem] bg-card text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-black text-foreground mb-4">¡Gracias por tus comentarios!</h2>
                  <p className="text-lg text-muted-foreground">Tu opinión nos ayuda a seguir mejorando para darte el mejor servicio.</p>
                </Card>
              </FadeUpBox>
            )}
          </AnimatePresence>

          `;

fs.writeFileSync(file, code.substring(0, start) + newCode + code.substring(end));