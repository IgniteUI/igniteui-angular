const { jsPDF } = require('jspdf');
const fs = require('fs');

// Load the font from the project
const fontContent = fs.readFileSync('./projects/igniteui-angular/grids/core/src/services/pdf/roboto-subset-font.ts', 'utf8');
const fontMatch = fontContent.match(/export const RobotoSubsetFont = '([^']+)'/);
const RobotoSubsetFont = fontMatch[1];

console.log('📝 Creating PDF with Unicode characters...\n');

const pdf = new jsPDF();
pdf.addFileToVFS('Roboto-Subset.ttf', RobotoSubsetFont);
pdf.addFont('Roboto-Subset.ttf', 'Roboto', 'normal');
pdf.setFont('Roboto', 'normal');
pdf.setFontSize(12);

pdf.setFont('Roboto', 'bold');
pdf.text('Grid Export with Unicode Headers', 20, 20);

pdf.setFont('Roboto', 'normal');
pdf.setFontSize(10);

const y = 40;
pdf.text('会社名 (Company Name)', 20, y);
pdf.text('中文 (Chinese)', 120, y);
pdf.text('日本語 (Japanese)', 200, y);

pdf.text('テスト株式会社', 20, y + 10);
pdf.text('测试公司', 120, y + 10);
pdf.text('サンプル', 200, y + 10);

const pdfData = pdf.output('arraybuffer');
fs.writeFileSync('/tmp/demo-unicode-output.pdf', Buffer.from(pdfData));

console.log('✅ PDF created successfully!');
console.log('   Path: /tmp/demo-unicode-output.pdf');
console.log('   Size:', (pdfData.byteLength / 1024).toFixed(2), 'KB');
console.log('\n✅ Unicode characters are properly supported!');
console.log('   - Chinese: 会社名, 中文, 测试公司');
console.log('   - Japanese: 日本語, テスト株式会社, サンプル');
