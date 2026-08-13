const fs = require('fs');
let cap = fs.readFileSync('capa_intermedia/index.ts', 'utf8');

cap = cap.replace(
  /await fs\.promises\.appendFile\(csvPath, csvLine, 'utf8'\);\n\n  \} catch \(error\) \{/,
  `await fs.promises.appendFile(csvPath, csvLine, 'utf8');\n\n    res.json({ success: true, message: 'Encuesta guardada con éxito' });\n  } catch (error) {`
);

fs.writeFileSync('capa_intermedia/index.ts', cap);
console.log("Capa arreglada.");