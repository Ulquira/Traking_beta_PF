const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  // Remove all occurrences of "dark:xxxx"
  content = content.replace(/dark:[a-zA-Z0-9\-\/\[\]]+/g, '');
  // Clean up any double spaces that might be left
  content = content.replace(/  +/g, ' ');
  fs.writeFileSync(filePath, content);
  console.log(`Cleaned ${file}`);
});
