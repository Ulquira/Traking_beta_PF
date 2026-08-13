const fs = require('fs');
const lines = fs.readFileSync('src/pages/Seguimiento.tsx', 'utf8').split('\n');
const topHalf = lines.slice(0, 267).join('\n');
fs.writeFileSync('uber_redesign.tsx', topHalf + '\n');
