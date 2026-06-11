const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_FILE = path.join(os.homedir(), '.keepnotes.json');

function load() {
  if (!fs.existsSync(DATA_FILE)) return { tasks: [] };
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { tasks: [] };
  }
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getTasks() {
  return load().tasks;
}

function saveTasks(tasks) {
  save({ tasks });
}

module.exports = { getTasks, saveTasks, DATA_FILE };
