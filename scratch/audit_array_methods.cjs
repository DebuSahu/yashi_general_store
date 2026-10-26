const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.jsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('./client/src');
console.log('=== CHECKING ARRAY METHOD INVOCATIONS ===');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // look for .map(, .filter(, .reduce(, .forEach(
    const match = line.match(/([a-zA-Z0-9_]+)\.(map|filter|reduce|forEach)\(/);
    if (match) {
      const varName = match[1];
      const method = match[2];
      // ignore Array, Object, list literals, or safe chained ?.
      if (!line.includes(`?.${method}`) && !['Array', 'Object', 'lines', 'files'].includes(varName)) {
        console.log(`${file}:${idx + 1} -> ${line.trim()}`);
      }
    }
  });
});
