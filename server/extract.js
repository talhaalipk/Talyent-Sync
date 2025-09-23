// extract.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Utility: Recursively get all file paths from a folder
function getAllFiles(dirPath, basePath = dirPath, result = []) {
  const files = fs.readdirSync(dirPath);

  for (let file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllFiles(fullPath, basePath, result);
    } else {
      const relativePath = path.relative(basePath, fullPath);
      result.push(relativePath);
    }
  }

  return result;
}

// List only folders at the same level as script
function listFolders(currentDir) {
  return fs
    .readdirSync(currentDir)
    .filter(
      (item) =>
        fs.statSync(path.join(currentDir, item)).isDirectory() &&
        item !== 'node_modules'
    );
}

// Ask user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const currentDir = __dirname;
const folders = listFolders(currentDir);

console.log('Available folders:');
folders.forEach((f, i) => console.log(`${i + 1}. ${f}`));

rl.question('Choose a folder number: ', (answer) => {
  const choice = parseInt(answer) - 1;

  if (choice < 0 || choice >= folders.length) {
    console.log('❌ Invalid choice');
    rl.close();
    return;
  }

  const chosenFolder = path.join(currentDir, folders[choice]);
  console.log(`✅ Extracting file list from: ${chosenFolder}`);

  const allFiles = getAllFiles(chosenFolder);

  const output = allFiles.join('\n');
  const outputPath = path.join(chosenFolder, 'file_list.txt');
  fs.writeFileSync(outputPath, output, 'utf-8');

  console.log(`🎉 Done! File list saved to: ${outputPath}`);
  rl.close();
});
2;

[
  { title: 'Sed odit aliquip sit', link: 'https://www.dekyluqakaj.ca' },
  { title: 'Dolorem voluptas sed', link: 'https://www.nanuj.org.uk' },
];
