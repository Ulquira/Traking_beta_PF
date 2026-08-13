const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Seguimiento.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import logoImg from "../assets/logo-1.png";\n', '');
// Second attempt if not matched
content = content.replace('import logoImg from "../assets/logo-1.png";', '');

const fadeUpMatch = content.match(/const FadeUpBox = [\s\S]*?\);\n/);
if (fadeUpMatch) {
  content = content.replace(fadeUpMatch[0], '');
}

fs.writeFileSync(file, content);
console.log('Fixed typescript warnings 2');