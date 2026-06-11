const chalk = require('chalk');
const { getTasks, saveTasks } = require('./storage');

function resolveTask(tasks, ref) {
  // Try by #id (numeric timestamp)
  const byId = tasks.find(t => String(t.id) === String(ref));
  if (byId) return byId;

  // Try by list position (1-based)
  const pos = parseInt(ref, 10);
  if (!isNaN(pos) && pos >= 1 && pos <= tasks.length) {
    return tasks[pos - 1];
  }

  return null;
}

function done(ref) {
  const tasks = getTasks();
  const task = resolveTask(tasks, ref);

  if (!task) {
    console.log(chalk.red(`✖  No task found for: ${ref}`));
    console.log(chalk.gray('  Use the number shown in "keepnotes list"'));
    return;
  }

  if (task.done) {
    console.log(chalk.yellow('  Already marked as done:'), chalk.gray(task.text));
    return;
  }

  task.done = true;
  task.completedAt = new Date().toISOString();
  saveTasks(tasks);
  console.log(chalk.green('✔  Marked done:'), chalk.gray.strikethrough(task.text));
}

function undone(ref) {
  const tasks = getTasks();
  const task = resolveTask(tasks, ref);

  if (!task) {
    console.log(chalk.red(`✖  No task found for: ${ref}`));
    return;
  }

  task.done = false;
  delete task.completedAt;
  saveTasks(tasks);
  console.log(chalk.yellow('↩  Marked pending:'), chalk.white(task.text));
}

function deleteTask(ref) {
  const tasks = getTasks();
  const task = resolveTask(tasks, ref);

  if (!task) {
    console.log(chalk.red(`✖  No task found for: ${ref}`));
    return;
  }

  const updated = tasks.filter(t => t.id !== task.id);
  saveTasks(updated);
  console.log(chalk.red('🗑  Deleted:'), chalk.gray(task.text));
}

function clearDone() {
  const tasks = getTasks();
  const remaining = tasks.filter(t => !t.done);
  const removed = tasks.length - remaining.length;

  if (removed === 0) {
    console.log(chalk.gray('  No completed tasks to clear.'));
    return;
  }

  saveTasks(remaining);
  console.log(chalk.green(`✔  Cleared ${removed} completed task${removed > 1 ? 's' : ''}.`));
}

function clearAll() {
  saveTasks([]);
  console.log(chalk.green('✔  All tasks cleared.'));
}

module.exports = { done, undone, deleteTask, clearDone, clearAll };
