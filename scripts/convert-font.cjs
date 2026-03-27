const fs = require('fs');
const path = require('path');

const fontPath = 'c:\\Users\\yohan\\Desktop\\for deployment\\frontend\\src\\assets\\AmharicFont.ttf';
const outputPath = 'c:\\Users\\yohan\\Desktop\\for deployment\\frontend\\src\\assets\\AmharicFont.base64.ts';

if (!fs.existsSync(fontPath)) {
  console.error(`Font file not found at ${fontPath}`);
  process.exit(1);
}

const fontData = fs.readFileSync(fontPath);
const base64 = fontData.toString('base64');

const content = `// Auto-generated Amharic font data
export const AMHARIC_FONT_BASE64 = "${base64}";
`;

fs.writeFileSync(outputPath, content);
console.log(`Font converted and saved to ${outputPath}`);
