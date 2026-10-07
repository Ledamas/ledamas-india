const fs = require('fs');

function fixFile(filePath) {
  let data = fs.readFileSync(filePath, 'utf8');
  data = data.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(filePath, data, 'utf8');
  console.log(`Fixed ${filePath}`);
}

fixFile('src/routes/auth.routes.ts');
fixFile('src/services/notification.service.ts');
