const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Seguimiento.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace('export default Seguimiento;\nexport default Seguimiento;', 'export default Seguimiento;');
content = content.replace('<AutoFitMap routePoints={routePoints} position={position} vehiclePosition={vehiclePosition} />', '');

fs.writeFileSync(file, content);
console.log('Cleaned up');
