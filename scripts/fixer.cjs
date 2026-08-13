const fs = require('fs'); 
let file = fs.readFileSync('src/pages/Seguimiento.tsx', 'utf8'); 

file = file.replace(
  'import { ArrowLeft, Phone, CheckCircle2, Calendar, User, Navigation, Wrench, Clock, MapPin, CalendarDays, XCircle, Star, BellRing } from "lucide-react";',
  'import { Phone, CheckCircle2, User, XCircle, Star } from "lucide-react";'
);
file = file.replace(
  'const { status, tecnico, eta, fecha_programacion, tramo } = data;',
  'const { status, tecnico, eta, fecha_programacion } = data;'
);
file = file.replace(
  'import { es } from "date-fns/locale";',
  ''
);
file = file.replace(
  'const [appNotification, setAppNotification] = useState<{title: string, body: string} | null>(null);',
  ''
);
file = file.replace(
  'const FadeUpBox = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (\\n  <motion.div\\n    initial={{ opacity: 0, y: 30 }}\\n    animate={{ opacity: 1, y: 0 }}\\n    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}\\n  >\\n    {children}\\n  </motion.div>\\n);',
  ''
);

fs.writeFileSync('src/pages/Seguimiento.tsx', file, 'utf8');