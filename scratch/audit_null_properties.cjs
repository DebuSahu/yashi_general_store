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
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('./client/src');
console.log('=== FINDING ALL useState(null) ===');
const nullStates = [];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const match = line.match(/const\s+\[([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\]\s*=\s*useState\((null|\'\'|\{\}|\[\])?\)/);
    if (line.includes('useState(null)')) {
      console.log(`${f}:${idx + 1} -> ${line.trim()}`);
      const m = line.match(/const\s+\[([a-zA-Z0-9_]+)/);
      if (m) {
        nullStates.push({ file: f, varName: m[1] });
      }
    }
  });
});

console.log('\n=== CHECKING PROPERTY ACCESS ON NULLABLE STATES ===');
nullStates.forEach(({ file, varName }) => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  // Match varName.something but NOT varName?.something
  const regex = new RegExp(`\\b${varName}\\.([a-zA-Z0-9_]+)`, 'g');
  lines.forEach((line, idx) => {
    // ignore if it's setVarName
    if (regex.test(line)) {
      console.log(`POTENTIAL NULL ACCESS: ${file}:${idx + 1} (${varName}) -> ${line.trim()}`);
    }
  });
});
