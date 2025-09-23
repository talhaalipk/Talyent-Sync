import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// helper to count lines in a file
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch (err) {
    return 0; // fallback if file is unreadable
  }
}

// function to print folder tree
function printTree(dirPath, prefix = '') {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  files.forEach((file, index) => {
    const isLast = index === files.length - 1;
    const pointer = isLast ? '└── ' : '├── ';

    if (file.isDirectory()) {
      console.log(prefix + pointer + file.name + '/');
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      printTree(path.join(dirPath, file.name), newPrefix);
    } else {
      const filePath = path.join(dirPath, file.name);
      const lines = countLines(filePath);
      console.log(`${prefix}${pointer}${file.name} (${lines} lines)`);
    }
  });
}

// ask user for folder name
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('1) name ', (folderName) => {
  const targetDir = path.join(__dirname, folderName);

  if (!fs.existsSync(targetDir)) {
    console.log('❌ Folder does not exist!');
    rl.close();
    return;
  }

  console.log(folderName);
  printTree(targetDir);

  rl.close();
});
