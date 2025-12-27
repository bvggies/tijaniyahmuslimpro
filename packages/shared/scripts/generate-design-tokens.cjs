const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const content = `const { DESIGN_TOKENS } = require('./index.js');
module.exports = { DESIGN_TOKENS };
`;

fs.writeFileSync(path.join(distPath, 'design-tokens.cjs'), content);
console.log('✅ Generated design-tokens.cjs');

