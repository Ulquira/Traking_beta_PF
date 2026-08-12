const fs = require('fs');
let codeIndex = fs.readFileSync('src/pages/Index.tsx', 'utf8');
codeIndex = codeIndex.replace(/<img src="\/src\/assets\/logo-white.png"/g, '<img src="/src/assets/logo-white.png"');
codeIndex = codeIndex.replace(/<img src="\/src\/assets\/text-banner.png"/g, '<img src="/src/assets/text-banner.png"');
codeIndex = codeIndex.replace(/<img src="\\\/src\\\/assets\\\/text-banner.png\\\"/g, '<img src="/src/assets/text-banner.png"');
codeIndex = codeIndex.replace(/<img src="\\\/src\\\/assets\\\/logo-white.png\\\"/g, '<img src="/src/assets/logo-white.png"');

fs.writeFileSync('src/pages/Index.tsx', codeIndex);

let codeSeg = fs.readFileSync('src/pages/Seguimiento.tsx', 'utf8');
codeSeg = codeSeg.replace(/<img src="logo-white.png"/g, '<img src="/src/assets/logo-white.png"');
fs.writeFileSync('src/pages/Seguimiento.tsx', codeSeg);
