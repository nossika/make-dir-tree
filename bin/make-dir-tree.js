#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CONFIG = {
  ROOT: process.cwd(),
  MAX_DEPTH: Infinity,
  DIR_ONLY: false,
  OUTPUT: 'dir-tree.txt',
  GAP: 2,
}

let textCache = '';

function walkDir(dir, depth, isLastItem = false, prevLine = []) {
  const list = fs.readdirSync(dir, {
    // withFileTypes: true, // need node v10.10.0+
  });
  
  list.forEach((name, index) => {
    const curPath = path.resolve(dir, name);
    const isDirectory = fs.statSync(curPath).isDirectory();
    const [isFirstItem, isLastItem] = [index === 0, index === list.length - 1];

    printLine(name, depth, isLastItem, prevLine);
    
    if (isDirectory && depth < CONFIG.MAX_DEPTH) {
      walkDir(
        curPath, 
        depth + 1, 
        isLastItem,
        isLastItem ? prevLine : prevLine.concat(depth),
      );
    }
  });
}

const charBlank = new Array(CONFIG.GAP + 1).fill(' ').join('');
const charLine = new Array(CONFIG.GAP).fill('─').join('');

function printLine(name, depth, isLastItem, prevLine) {
  let text = '';
  for (let i = 1; i <= depth; i++) {
    if (i === depth) {
      text += `${isLastItem ? ('└' + charLine) : ('├' + charLine)} ${name}`
      break;
    }
    if (prevLine.includes(i)) {
      text += '│' + charBlank;
    } else {
      text += ' ' + charBlank;
    }
  }

  textCache += text + '\n';
  console.log(text);
}

walkDir(CONFIG.ROOT, 1);

fs.writeFileSync(CONFIG.OUTPUT, textCache);









