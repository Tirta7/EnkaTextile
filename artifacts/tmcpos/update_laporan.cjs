const fs = require('fs');
const path = 'src/pages/Laporan.tsx';
let content = fs.readFileSync(path, 'utf8');
let updated = false;

const newContent = content.replace(/<TableHead className="([^"]*)"/g, (match, p1) => {
  if (!p1.includes('whitespace-nowrap')) {
    updated = true;
    return '<TableHead className="' + p1 + ' whitespace-nowrap"';
  }
  return match;
});

const finalContent = newContent.replace(/<TableCell className="([^"]*)"/g, (match, p1) => {
  if (!p1.includes('whitespace-nowrap') && !p1.includes('truncate') && !p1.includes('max-w-')) {
    updated = true;
    return '<TableCell className="' + p1 + ' whitespace-nowrap"';
  }
  return match;
});

if (updated) {
  fs.writeFileSync(path, finalContent);
  console.log('Updated Laporan.tsx');
}
