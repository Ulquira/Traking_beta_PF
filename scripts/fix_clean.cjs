const fs = require('fs'); 
let file = fs.readFileSync('src/pages/Seguimiento.tsx', 'utf8'); 

file = file.replace(
  'import { ArrowLeft, Phone, CheckCircle2, Calendar, User, Navigation, Wrench, Clock, MapPin, CalendarDays, XCircle, Star, BellRing } from "lucide-react";',
  'import { Phone, CheckCircle2, User, XCircle, Star } from "lucide-react";'
);
file = file.replace('const { status, tecnico, eta, fecha_programacion, tramo } = data;', 'const { status, tecnico, eta, fecha_programacion } = data;');
file = file.replace('import { es } from "date-fns/locale";', '');
file = file.replace('const [appNotification, setAppNotification] = useState<{title: string, body: string} | null>(null);', '');
file = file.replace(/const FadeUpBox = [\s\S]*?<\/motion\.div>\r?\n\);\r?\n/, '');
file = file.replace('import { Card } from "@/components/ui/card";', '');

// Also comment out notification to avoid compile errors
file = file.replace('setAppNotification({ title, body });', '// setAppNotification({ title, body });');
file = file.replace('setTimeout(() => setAppNotification(null), 8000);', '// setTimeout(() => setAppNotification(null), 8000);');

fs.writeFileSync('src/pages/Seguimiento.tsx', file, 'utf8');