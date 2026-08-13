const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Seguimiento.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<div className="absolute top-0 left-0 w-full h-[55vh] z-0 bg-muted">',
  '<div className="absolute top-0 left-0 w-full h-[65vh] z-0 bg-muted">'
);

content = content.replace(
  '{/* Shadow fade to blend map with bottom sheet */}\n <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent z-10 pointer-events-none"></div>',
  ''
);

content = content.replace(
  '<div className="w-full flex justify-center py-4 shrink-0 cursor-grab active:cursor-grabbing">\n <div className="w-14 h-1.5 bg-gray-300 rounded-full"></div>',
  '<div className="w-full flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing">\n <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>'
);

content = content.replace(
  '<div className="flex-1 overflow-y-auto px-6 pb-10 scrollbar-hide pt-4">',
  '<div className="flex-1 overflow-y-auto px-6 pb-10 scrollbar-hide pt-1">'
);

fs.writeFileSync(file, content);
console.log('Fixed padding and shadows');
