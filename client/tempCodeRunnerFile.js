// tree.js
import fs  from 'fs'
import path from 'path'
import readline from 'readline'

// function to print folder tree
function printTree(dirPath, prefix = '') {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  files.forEach((file, index) => {
    const isLast = index === files.length - 1;
    const pointer = isLast ? '└── ' : '├── ';

    console.log(prefix + pointer + file.name);

    if (file.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      printTree(path.join(dirPath, file.name), newPrefix);
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
