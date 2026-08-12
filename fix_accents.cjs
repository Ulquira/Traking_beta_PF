const fs = require('fs');
const path = require('path');

const filePaths = [
    path.join(__dirname, 'src', 'pages', 'Seguimiento.tsx'),
    path.join(__dirname, 'src', 'pages', 'Index.tsx')
];

const replacements = [
    { from: /InstalaciÃ³n/g, to: 'Instalación' },
    { from: /instalaciÃ³n/g, to: 'instalación' },
    { from: /TÃ©cnico/g, to: 'Técnico' },
    { from: /tÃ©cnico/g, to: 'técnico' },
    { from: /estÃ¡/g, to: 'está' },
    { from: /NÂº/g, to: 'Nº' },
    { from: /Â¡/g, to: '¡' },
    { from: /llegÃ³/g, to: 'llegó' },
    { from: /Â¿/g, to: '¿' },
    { from: /MÃ¡s/g, to: 'Más' },
    { from: /direcciÃ³n/g, to: 'dirección' },
    { from: /AtenciÃ³n/g, to: 'Atención' },
    { from: /atenciÃ³n/g, to: 'atención' },
    { from: /CuÃ©ntanos/g, to: 'Cuéntanos' },
    { from: /invÃ¡lido/g, to: 'inválido' },
    { from: /operaciÃ³n/g, to: 'operación' },
    { from: /estÃ¡n/g, to: 'están' },
    { from: /explicaciÃ³n/g, to: 'explicación' },
    { from: /informaciÃ³n/g, to: 'información' },
    { from: /ReprogramaciÃ³n/g, to: 'Reprogramación' },
    { from: /reprogramaciÃ³n/g, to: 'reprogramación' },
    { from: /ubicaciÃ³n/g, to: 'ubicación' },
];

filePaths.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        replacements.forEach(r => {
            content = content.replace(r.from, r.to);
        });
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    } else {
        console.log(`File not found: ${filePath}`);
    }
});
