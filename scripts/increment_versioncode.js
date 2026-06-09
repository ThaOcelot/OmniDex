import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

try {
  let content = fs.readFileSync(buildGradlePath, 'utf8');

  let newVersionCode = null;
  
  // Trova e incrementa il versionCode
  content = content.replace(/(versionCode\s+)(\d+)/, (match, p1, p2) => {
    newVersionCode = parseInt(p2, 10) + 1;
    return `${p1}${newVersionCode}`;
  });

  if (newVersionCode !== null) {
    fs.writeFileSync(buildGradlePath, content, 'utf8');
    console.log(`\x1b[32mSuccess: versionCode incrementato a ${newVersionCode}\x1b[0m`);
  } else {
    console.error('\x1b[31mError: Impossibile trovare versionCode nel file build.gradle\x1b[0m');
    process.exit(1);
  }
} catch (error) {
  console.error('\x1b[31mError:', error.message, '\x1b[0m');
  process.exit(1);
}
