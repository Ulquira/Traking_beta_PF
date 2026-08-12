const fs = require('fs');
const code = fs.readFileSync('src/pages/Seguimiento.tsx', 'utf8');
const breakPoint = '  if (loading) {';
const topHalf = code.substring(0, code.indexOf(breakPoint));
const bottomHalf = fs.readFileSync('fix_seguimiento.txt', 'utf8');
// remove the very last line if it has backtick
const cleanBottom = bottomHalf.replace('`;\n', '').replace('`;', '').trim();
fs.writeFileSync('src/pages/Seguimiento.tsx', topHalf + '  if (loading) {\n' + cleanBottom, 'utf8');
