const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Seguimiento.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';", "import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';");
content = content.replace('import logoImg from "../assets/logo-1.png";\n', '');
content = content.replace(/const FadeUpBox = \(\{ children, delay = 0 \}: \{ children: React\.ReactNode, delay\?: number \}\) => \([\s\S]*?<\/motion\.div>\n\);\n/, '');
content = content.replace('const handleDragEnd = (e: any, info: any) => {', 'const handleDragEnd = (_e: any, info: any) => {');

fs.writeFileSync(file, content);
console.log('Fixed typescript warnings');