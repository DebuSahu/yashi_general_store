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

console.log('=== CHECKING PROPS AND COMMON NULL TARGETS ===');
// Common nullable targets in this project:
const commonTargets = ['toast', 'product', 'editingProduct', 'order', 'targetTrackerOrder', 'orderPlacedSuccess', 'currentUser', 'adminUser', 'shopSettings', 'item', 'locationData', 'selectedAccount', 'targetAdminToReset', 'selectedFile', 'appliedCoupon'];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    commonTargets.forEach(target => {
      // Find direct property access: target.prop (not target?.prop, not target ===, not target &&, not !target)
      // We want to detect target.<word>
      const regex = new RegExp(`(?<![?\\w])${target}\\.([a-zA-Z0-9_]+)`, 'g');
      let match;
      while ((match = regex.exec(line)) !== null) {
        // filter out cases like import or function definition
        if (!line.includes(`function ${target}`) && !line.includes(`const ${target} =`) && !line.includes(`let ${target} =`)) {
          console.log(`${file}:${idx + 1} [${target}.${match[1]}] -> ${line.trim()}`);
        }
      }
    });
  });
});
