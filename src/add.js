const chalk = require('chalk');
const { getTasks, saveTasks } = require('./storage');

function add(taskText, options) {
  if (!taskText || taskText.trim() === '') {
    console.log(chalk.red('✖  Please provide a task description.'));
    return;
  }

  const tasks = getTasks();
  const newTask = {
    id: Date.now(),
    text: taskText.trim(),
    done: false,
    priority: options.priority || 'normal',
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  saveTasks(tasks);

  const priorityTag =
    newTask.priority === 'high'
      ? chalk.red(' [HIGH]')
      : newTask.priority === 'low'
      ? chalk.gray(' [LOW]')
      : '';

  console.log(chalk.green('✔  Task added:'), chalk.white(newTask.text) + priorityTag);
}

module.exports = { add };
