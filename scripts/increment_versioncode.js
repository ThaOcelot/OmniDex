import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

try {
  let content = fs.readFileSync(buildGradlePath, 'utf8');

  let newVersionCode = null;
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const newVersionName = packageJson.version;
  
  // Trova e incrementa il versionCode
  content = content.replace(/(versionCode\s+)(\d+)/, (match, p1, p2) => {
    newVersionCode = parseInt(p2, 10) + 1;
    return `${p1}${newVersionCode}`;
  });

  // Aggiorna il versionName
  content = content.replace(/(versionName\s+)".+"/, `$1"${newVersionName}"`);

  if (newVersionCode !== null) {
    fs.writeFileSync(buildGradlePath, content, 'utf8');
    console.log(`\x1b[32mSuccess: versionCode incrementato a ${newVersionCode}, versionName impostato a ${newVersionName}\x1b[0m`);
  } else {
    console.error('\x1b[31mError: Impossibile trovare versionCode nel file build.gradle\x1b[0m');
    process.exit(1);
  }
} catch (error) {
  console.error('\x1b[31mError:', error.message, '\x1b[0m');
  process.exit(1);
}
