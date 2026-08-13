const fs = require('fs'); 
let file = fs.readFileSync('src/pages/Seguimiento.tsx', 'utf8'); 

file = file.replace(
  'import { Card } from "@/components/ui/card";',
  ''
);

const fadeBoxStr = `const FadeUpBox = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
  >
    {children}
  </motion.div>
);`;

file = file.replace(fadeBoxStr, '');

file = file.replace('setAppNotification({ title, body });', '// setAppNotification({ title, body });');
file = file.replace('setTimeout(() => setAppNotification(null), 8000);', '// setTimeout(() => setAppNotification(null), 8000);');


fs.writeFileSync('src/pages/Seguimiento.tsx', file, 'utf8');