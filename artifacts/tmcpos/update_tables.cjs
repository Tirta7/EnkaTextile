const fs = require('fs');
const files = fs.readdirSync('src/pages').filter(f => f.endsWith('.tsx'));
files.forEach(file => {
  const path = 'src/pages/' + file;
  let content = fs.readFileSync(path, 'utf8');
  let updated = false;
  
  // Update th
  const newContent = content.replace(/<th className="([^"]*)"/g, (match, p1) => {
    if (!p1.includes('whitespace-nowrap')) {
      updated = true;
      return '<th className="' + p1 + ' whitespace-nowrap"';
    }
    return match;
  });
  
  // Also update td for names and identifiers where sensible
  const finalContent = newContent.replace(/<td className="([^"]*py-2\.5 px-3[^"]*)">/g, (match, p1) => {
    if (!p1.includes('whitespace-nowrap') && !p1.includes('truncate') && !p1.includes('max-w-')) {
      updated = true;
      return '<td className="' + p1 + ' whitespace-nowrap">';
    }
    return match;
  });

  if (updated) {
    fs.writeFileSync(path, finalContent);
    console.log('Updated ' + file);
  }
});
