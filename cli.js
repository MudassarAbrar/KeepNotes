#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { add } = require('./src/add');
const { list } = require('./src/list');
const { done, undone, deleteTask, clearDone, clearAll } = require('./src/actions');

program
  .name('keepnotes')
  .description('📋  A simple terminal todo & note-keeping app')
  .version('1.0.0');

// ── add ──────────────────────────────────────────────────
program
  .command('add <task>')
  .alias('a')
  .description('Add a new task')
  .option('-p, --priority <level>', 'Set priority: high | normal | low', 'normal')
  .action((task, options) => add(task, options));

// ── list ─────────────────────────────────────────────────
program
  .command('list')
  .alias('ls')
  .description('List all tasks')
  .option('--done', 'Show only completed tasks')
  .option('--pending', 'Show only pending tasks')
  .action((options) => list(options));

// ── done ─────────────────────────────────────────────────
program
  .command('done <ref>')
  .alias('d')
  .description('Mark a task as done (by list number or #id)')
  .action((ref) => done(ref));

// ── undone ───────────────────────────────────────────────
program
  .command('undone <ref>')
  .alias('u')
  .description('Mark a task as pending again')
  .action((ref) => undone(ref));

// ── delete ───────────────────────────────────────────────
program
  .command('delete <ref>')
  .alias('del')
  .description('Delete a task permanently')
  .action((ref) => deleteTask(ref));

// ── clear ────────────────────────────────────────────────
program
  .command('clear')
  .description('Clear all completed tasks')
  .option('--all', 'Clear ALL tasks (including pending)')
  .action((options) => {
    if (options.all) clearAll();
    else clearDone();
  });

// ── default: show list if no command ─────────────────────
if (process.argv.length <= 2) {
  list({});
} else {
  program.parse(process.argv);
}
