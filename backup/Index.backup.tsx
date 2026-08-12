import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Shield, Clock, CheckCircle2 } from "lucide-react";
import { mockInstallations } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import logoWin from "@/assets/logo-win.webp";

const Index = () => {
  const [dni, setDni] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dni.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa tu DNI o número de servicio",
        variant: "destructive"
      });
      return;
    }

    if (mockInstallations[dni]) {
      navigate(`/seguimiento/${dni}`);
    } else {
      toast({
        title: "No encontrado",
        description: "No se encontró una instalación con ese DNI. Intenta con: 12345678, 87654321, 44556677, 99887766 o 22223333",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logoWin} alt="Win Logo" className="h-10 object-contain" />
            <div>
              <h1 className="font-bold text-xl text-foreground">Go Win</h1>
              <p className="text-xs text-muted-foreground">Seguimiento de instalación</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin")}
            className="gap-2"
          >
            <Shield className="w-4 h-4" />
            Admin
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Seguimiento en tiempo real
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mantente informado sobre tu instalación de fibra óptica en cada paso del proceso
            </p>
          </div>

          {/* Search Card */}
          <Card className="p-8 shadow-lg border-border/50 mb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="dni" className="block text-sm font-medium mb-2 text-foreground">
                  Ingresa tu DNI o número de servicio
                </label>
                <div className="flex gap-3">
                  <Input
                    id="dni"
                    type="text"
                    placeholder="Ej: 12345678"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className="text-lg h-12"
                  />
                  <Button type="submit" size="lg" className="gap-2 px-8">
                    <Search className="w-5 h-5" />
                    Buscar
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                💡 Prueba con: 12345678, 87654321, 44556677, 99887766 o 22223333
              </p>
            </form>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Información en tiempo real</h3>
              <p className="text-sm text-muted-foreground">
                Conoce el estado exacto de tu instalación al instante
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Ubicación del técnico</h3>
              <p className="text-sm text-muted-foreground">
                Visualiza en el mapa cuando tu técnico esté en camino
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Asistencia 24/7</h3>
              <p className="text-sm text-muted-foreground">
                Chatea con nuestro asistente IA para resolver dudas
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20 bg-card/50">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Win. Transformando la experiencia de instalación.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
