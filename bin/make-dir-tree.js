#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = new (require('commander').Command)();
const info = require('../package.json');

program.version(info.version);

program
  .option('-d, --depth <num>', 'max dir depth')
  .option('-n, --output <filename>', 'output filename')
  .option('-e, --excludes <pattern>', 'excludes rule')
  .option('-o, --only-dir', 'show dir only');

program.parse(process.argv);

const CONFIG = {
  ROOT: process.cwd(),
  MAX_DEPTH: +program.depth || Infinity,
  ONLY_DIR: !!program.onlyDir,
  OUTPUT: program.output || '',
  EXCLUDES: program.excludes || '',
  GAP: 2,
};

const charBlank = new Array(CONFIG.GAP + 1).fill(' ').join('');
const charLine = new Array(CONFIG.GAP).fill('─').join('');

const patternExcludes = new RegExp(CONFIG.EXCLUDES);

let textCache = '';

function walkDir(dir, depth, prevPath = '', isLastItem = false, prevLine = []) {
  const list = fs
    .readdirSync(dir, {
      // withFileTypes: true, // need node v10.10.0+
    })
    .filter(name => !isIgnored(prevPath + name));
  
  list.forEach((name, index) => {

    const curPath = path.resolve(dir, name);
    const isDirectory = fs.statSync(curPath).isDirectory();
    const isLastItem = index === list.length - 1;

    if (!(CONFIG.ONLY_DIR && !isDirectory)) {
      printLine(name, depth, isLastItem, prevLine);
    }
    
    if (isDirectory && depth < CONFIG.MAX_DEPTH) {
      walkDir(
        curPath, 
        depth + 1,
        name + '/',
        isLastItem,
        isLastItem ? prevLine : prevLine.concat(depth),
      );
    }
  });
}

function isIgnored(name) {
  return CONFIG.EXCLUDES && patternExcludes.test(name)
}

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

  consoleLog(text);
}

function consoleLog(...argv) {
  console.log(...argv);
}

walkDir(CONFIG.ROOT, 1);

CONFIG.OUTPUT && fs.writeFileSync(CONFIG.OUTPUT, textCache);



