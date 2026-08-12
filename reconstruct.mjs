import fs from 'fs'; const topHalf = fs.readFileSync('uber_redesign.txt', 'utf8'); fs.writeFileSync('src/pages/Seguimiento.tsx', topHalf);  
