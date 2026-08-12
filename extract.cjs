const fs = require('fs');
const txt = fs.readFileSync('fix4.cjs', 'utf8');
const start = txt.indexOf('const targetStr = `') + 19;
const end = txt.indexOf('`;\n\n// Actually the file content has:');
let cleanContent = txt.substring(start, end);

// The cleanContent we extracted was the target of replacement in fix4, which is the state from before the buggy replacements
fs.writeFileSync('src/pages/Seguimiento.tsx', cleanContent);
console.log('Restaurado!');