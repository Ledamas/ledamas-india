const fs = require('fs');
const path = require('path');

const clientDir = path.join('c:/Users/user/Desktop/Ledamas-india/client');

function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findTsFiles(fullPath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const tsFiles = findTsFiles(clientDir);

for (const file of tsFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Find strings that start with / and end with png|jpg|webp and contain spaces
  const regex = /\/([^"'\`]+?\.(png|jpg|webp))/g;
  content = content.replace(regex, (match) => {
    if (match.includes(' ')) {
      changed = true;
      let newMatch = match.replace(/ /g, '-');
      return newMatch;
    }
    return match;
  });
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed spaces in:', file);
  }
}
