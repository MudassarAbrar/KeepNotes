const chalk = require('chalk');
const { getTasks } = require('./storage');

function stripAnsi(str) {
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

function pad(str, length, align = 'left') {
  const visibleLen = stripAnsi(str).length;
  const diff = length - visibleLen;
  if (diff <= 0) return str;
  const padStr = ' '.repeat(diff);
  if (align === 'right') {
    return padStr + str;
  } else if (align === 'center') {
    const left = ' '.repeat(Math.floor(diff / 2));
    const right = ' '.repeat(Math.ceil(diff / 2));
    return left + str + right;
  }
  return str + padStr;
}

function printFooter() {
  console.log(chalk.gray('  💡 Need help? Run ') + chalk.cyan('keepnotes --help') + chalk.gray(' to see all commands.'));
  console.log(chalk.gray('  🚀 keepnotes by ') + chalk.cyan.bold('Mudassir Abrar') + '\n');
}

function list(options) {
  const banner = [
    "██╗  ██╗███████╗███████╗██████╗ ███╗   ██╗ ██████╗ ████████╗███████╗███████╗",
    "██║ ██╔╝██╔════╝██╔════╝██╔══██╗████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔════╝",
    "█████╔╝ █████╗  █████╗  ██████╔╝██╔██╗ ██║██║   ██║   ██║   █████╗  ███████╗",
    "██╔═██╗ ██╔══╝  ██╔══╝  ██╔═══╝ ██║╚██╗██║██║   ██║   ██║   ██╔══╝  ╚════██║",
    "██║  ██╗███████╗███████╗██║     ██║ ╚████║╚██████╔╝   ██║   ███████╗███████║",
    "╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝"
  ].join('\n');

  console.log(chalk.bold.cyan(banner));
  console.log('');

  let tasks = getTasks();

  if (tasks.length === 0) {
    console.log(chalk.gray('  No tasks yet. Add one with: keepnotes add "your task"\n'));
    printFooter();
    return;
  }

  // Filter
  if (options.done) tasks = tasks.filter(t => t.done);
  else if (options.pending) tasks = tasks.filter(t => !t.done);

  // Sort by priority
  const priorityOrder = { high: 0, normal: 1, low: 2 };
  tasks = tasks.sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 1;
    const pb = priorityOrder[b.priority] ?? 1;
    return pa - pb;
  });

  const total = getTasks().length;
  const doneCount = getTasks().filter(t => t.done).length;

  console.log(chalk.bold.white(`  📋  keepnotes — your tasks (${doneCount}/${total} completed)`));
  console.log('');

  const colSpecs = [
    { key: 'index', label: ' # ', align: 'center', color: chalk.bold.white },
    { key: 'status', label: ' Status ', align: 'center', color: chalk.bold.white },
    { key: 'priority', label: ' Priority ', align: 'center', color: chalk.bold.white },
    { key: 'text', label: ' Task ', align: 'left', color: chalk.bold.white },
    { key: 'id', label: ' ID ', align: 'center', color: chalk.bold.white }
  ];

  const widths = {};
  colSpecs.forEach(col => {
    widths[col.key] = col.label.length;
  });

  tasks.forEach((task, i) => {
    const indexVal = ` ${i + 1} `;
    const statusVal = task.done ? ' ✔ Done ' : ' Pending ';
    const priorityVal = ` ${(task.priority || 'normal').toUpperCase()} `;
    const textVal = ` ${task.text} `;
    const idVal = ` ${task.id} `;

    widths.index = Math.max(widths.index, indexVal.length);
    widths.status = Math.max(widths.status, statusVal.length);
    widths.priority = Math.max(widths.priority, priorityVal.length);
    widths.text = Math.max(widths.text, textVal.length);
    widths.id = Math.max(widths.id, idVal.length);
  });

  const drawLine = (left, mid, right, lineChar) => {
    return chalk.gray(
      left +
      lineChar.repeat(widths.index) + mid +
      lineChar.repeat(widths.status) + mid +
      lineChar.repeat(widths.priority) + mid +
      lineChar.repeat(widths.text) + mid +
      lineChar.repeat(widths.id) + right
    );
  };

  // Top border
  console.log(drawLine('╭', '┬', '╮', '─'));

  // Header Row
  const headerCells = colSpecs.map(col => {
    return pad(col.label, widths[col.key], col.align);
  });
  console.log(
    chalk.gray('│') +
    headerCells.map((cell, idx) => colSpecs[idx].color(cell)).join(chalk.gray('│')) +
    chalk.gray('│') + '\n' +
    drawLine('├', '┼', '┤', '─')
  );

  // Data Rows
  tasks.forEach((task, i) => {
    const indexStr = pad(` ${i + 1} `, widths.index, 'center');
    
    let statusStr = task.done ? ' ✔ Done ' : ' Pending ';
    let statusColored = task.done ? chalk.green.bold(statusStr) : chalk.yellow.bold(statusStr);
    statusStr = pad(statusColored, widths.status, 'center');

    let priorityStr = ` ${(task.priority || 'normal').toUpperCase()} `;
    let priorityColored = priorityStr;
    if (task.priority === 'high') priorityColored = chalk.red.bold(priorityStr);
    else if (task.priority === 'low') priorityColored = chalk.gray(priorityStr);
    else priorityColored = chalk.blue(priorityStr);
    priorityStr = pad(priorityColored, widths.priority, 'center');

    let textStr = ` ${task.text} `;
    let textColored = task.done ? chalk.gray.strikethrough(textStr) : chalk.white(textStr);
    textStr = pad(textColored, widths.text, 'left');

    let idStr = pad(chalk.gray(` ${task.id} `), widths.id, 'center');

    console.log(
      chalk.gray('│') +
      chalk.gray(indexStr) + chalk.gray('│') +
      statusStr + chalk.gray('│') +
      priorityStr + chalk.gray('│') +
      textStr + chalk.gray('│') +
      idStr + chalk.gray('│')
    );
  });

  // Bottom border
  console.log(drawLine('╰', '┴', '╯', '─'));
  console.log('');
  printFooter();
}

module.exports = { list };
