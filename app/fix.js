const fs = require('fs');
const path = require('path');

function fixFiles(dir) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      if (item !== 'node_modules' && item !== '.next') {
        fixFiles(fullPath);
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('@import url')) {
        const fixed = content.split('\n')
          .filter(line => !line.includes('@import url'))
          .join('\n');
        fs.writeFileSync(fullPath, fixed, 'utf8');
        console.log('Fixed: ' + fullPath);
      }
    }
  });
}

fixFiles('.');
console.log('All done!');
