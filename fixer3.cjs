const fs = require('fs');
let file = fs.readFileSync('src/pages/Seguimiento.tsx', 'utf8');
file = file.replace(/const FadeUpBox = [\s\S]*?<\/motion\.div>\r?\n\);/, '');
fs.writeFileSync('src/pages/Seguimiento.tsx', file, 'utf8');