const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Seguimiento.tsx');

let content = fs.readFileSync(filePath, 'utf8');

const regex = /\{\/\* Header inside sheet \*\/\}.*?\{\/\* Action Buttons Footer \*\/\}[^{]*\{\/\* Action Buttons Footer \*\/\}[\s\S]*?\n\s+\}\)\}/g;
// Wait, the regex needs to accurately capture the exact block.
