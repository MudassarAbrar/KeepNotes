# How keepnote Works — A Deep Explanation

This document explains every single thing happening in the keepnote project.
No shortcuts. No "just trust it". Everything from first principles.

---

## Table of Contents

1. [What is a CLI app, really?](#1-what-is-a-cli-app-really)
2. [How the terminal finds your command](#2-how-the-terminal-finds-your-command)
3. [The shebang line — `#!/usr/bin/env node`](#3-the-shebang-line)
4. [package.json — the project's ID card](#4-packagejson)
5. [How Node.js modules work — require() and exports](#5-how-nodejs-modules-work)
6. [process.argv — how your app reads what you type](#6-processargv)
7. [The commander library — why we use it](#7-the-commander-library)
8. [storage.js — reading and writing data](#8-storagejs)
9. [add.js — creating a task](#9-addjs)
10. [list.js — displaying tasks](#10-listjs)
11. [actions.js — done, undone, delete, clear](#11-actionsjs)
12. [chalk — colors in the terminal](#12-chalk)
13. [The full journey of one command](#13-the-full-journey-of-one-command)
14. [npm link — how local development works](#14-npm-link)
15. [npm publish — how strangers install your tool](#15-npm-publish)
16. [Why these design decisions?](#16-why-these-design-decisions)

---

## 1. What is a CLI app, really?

A CLI (Command Line Interface) app is just a program that:
- **reads text you type** as its input
- **prints text** as its output
- has **no window, no buttons, no mouse**

When you type `keepnote add "Buy milk"`, what actually happens is:

1. Your terminal (bash/zsh/PowerShell) receives the text you typed
2. It splits it into parts: `["keepnote", "add", "Buy milk"]`
3. It finds the program called `keepnote` on your computer
4. It starts that program and hands it those parts
5. Your program runs, does its work, prints output
6. The program exits and control returns to the terminal

That's it. A CLI app is just a program that reads its arguments and prints text. Everything else is built on top of that simple idea.

---

## 2. How the terminal finds your command

When you type `keepnote` in your terminal, how does it know where the program is?

Your operating system has a variable called `PATH`. It's a list of folders. When you type a command, the terminal searches each folder in `PATH` one by one until it finds a file with that name.

You can see your PATH by running:
```bash
echo $PATH
# Output might be: /usr/local/bin:/usr/bin:/bin:/usr/sbin
```

When you run `npm install -g keepnote`:
- npm downloads your package
- It puts a file called `keepnote` into `/usr/local/bin/` (or similar)
- `/usr/local/bin/` is already in your `PATH`
- So now when you type `keepnote`, the terminal finds that file

The file npm puts there is basically a tiny script that says: "run this Node.js file". That's the link between typing a word and running your code.

---

## 3. The shebang line

The very first line of `cli.js` is:

```js
#!/usr/bin/env node
```

This is called a **shebang** (or hashbang). It starts with `#!` which is a special signal to the operating system.

**The problem it solves:**

When the terminal runs a file, it needs to know *what program* should interpret it. A `.py` file needs Python. A `.rb` file needs Ruby. Your `cli.js` file needs Node.js.

Without the shebang, the OS would try to run it as a bash script and fail immediately because JavaScript is not bash.

**What `#!/usr/bin/env node` means:**

- `#!` = "this is a shebang, read the rest to find the interpreter"
- `/usr/bin/env` = a program that looks up other programs by name (it searches `PATH` for you)
- `node` = the program to use

So the full meaning is: *"Find the program called `node` in my PATH and use it to run this file."*

Why use `/usr/bin/env node` instead of just `/usr/bin/node` directly? Because Node.js might be installed in different places on different computers. `env` finds it wherever it is. This makes your tool work on everyone's machine.

---

## 4. package.json

This file is the identity card and instruction manual for your project. Let's go field by field:

```json
{
  "name": "keepnote",
  "version": "1.0.0",
  "description": "A simple terminal-based todo & note-keeping CLI app",
  "main": "cli.js",
  "bin": {
    "keepnote": "./cli.js"
  },
  "scripts": {
    "start": "node cli.js"
  },
  "dependencies": {
    "chalk": "^4.1.2",
    "commander": "^11.1.0"
  }
}
```

### `name`
The package name on npm. This is what people type in `npm install -g keepnote`. It must be unique across all of npm (millions of packages). It's also what npm uses to create the folder inside `node_modules/`.

### `version`
Follows **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`
- `PATCH` (1.0.**1**): bug fixes, nothing new
- `MINOR` (1.**1**.0): new features added, nothing broken
- `MAJOR` (**2**.0.0): breaking changes, old code might not work

### `main`
When someone does `require('keepnote')` in their own code, this tells Node.js which file is the entry point. For a CLI-only tool this is less important, but it's good practice.

### `bin` — THE MOST IMPORTANT FIELD FOR A CLI TOOL

```json
"bin": {
  "keepnote": "./cli.js"
}
```

This is what makes a CLI tool a CLI tool. It tells npm:

> "When this package is installed globally, create a command called `keepnote` that runs `./cli.js`"

npm takes this and creates a small executable file in `/usr/local/bin/keepnote` (on Mac/Linux) that launches Node.js with your `cli.js`. That's how `keepnote` becomes a real terminal command.

You can have multiple commands in `bin`:
```json
"bin": {
  "keepnote": "./cli.js",
  "kn": "./cli.js"
}
```
This would give users both `keepnote` and `kn` as shortcuts.

### `dependencies`
These are libraries your code needs to run. When someone installs your package, npm automatically downloads these too.

The `^` symbol means "compatible with this version". `^4.1.2` means: install version 4.1.2 or higher, but **not** version 5.0.0 (because a major version jump could break things).

### `scripts`
Shortcuts for `npm run <name>`. `npm run start` runs `node cli.js`. These are useful during development.

---

## 5. How Node.js modules work

Before understanding the code, you need to understand how files talk to each other in Node.js.

### The problem
You don't want all your code in one giant file. You split it into files by responsibility. But then each file needs to use code from other files. How?

### `module.exports` — "here's what I'm sharing"

At the bottom of every file, you'll see something like:
```js
module.exports = { getTasks, saveTasks, DATA_FILE };
```

This is the file saying: "these are the things I'm making available to anyone who imports me." Everything not listed here is private to that file.

`module.exports` is just a plain JavaScript object. You put things into it and those things become accessible from outside.

### `require()` — "I want to use your stuff"

At the top of files, you'll see:
```js
const { getTasks, saveTasks } = require('./storage');
```

`require('./storage')` loads the file `storage.js` (the `./` means "in the same folder", `.js` extension is optional) and returns whatever that file put into `module.exports`.

The `{ getTasks, saveTasks }` part is called **destructuring**. It's shorthand for:
```js
const storage = require('./storage');
const getTasks = storage.getTasks;
const saveTasks = storage.saveTasks;
```

### Built-in modules vs installed modules vs local files

There are three kinds of `require`:

```js
const fs   = require('fs');           // built into Node.js — no install needed
const path = require('path');         // built into Node.js — no install needed
const os   = require('os');           // built into Node.js — no install needed

const chalk     = require('chalk');      // installed via npm, lives in node_modules/
const commander = require('commander'); // installed via npm, lives in node_modules/

const { add } = require('./src/add');   // your own file — starts with ./ or ../
```

The distinction is:
- No path prefix (`'fs'`, `'chalk'`) → Node looks in node_modules/ or its built-ins
- Starts with `./` or `../` → your own local file

---

## 6. process.argv

This is how your running program sees what the user typed.

`process` is a global object Node.js provides. It represents the currently running process (your program). `process.argv` is an array of strings — the command and all its arguments.

**Example:** When the user types `keepnote add "Buy milk" --priority high`

`process.argv` contains:
```js
[
  '/usr/bin/node',        // [0] path to node itself
  '/usr/local/bin/keepnote', // [1] path to your script
  'add',                  // [2] first real argument
  'Buy milk',             // [3] second real argument
  '--priority',           // [4] flag name
  'high'                  // [5] flag value
]
```

Positions `[0]` and `[1]` are always Node itself and your script. Your actual user input starts at `[2]`.

This is why in `cli.js` we check:
```js
if (process.argv.length <= 2) {
  list({});  // user typed just "keepnote" with nothing after it
}
```

If there are only 2 items (`node` + `script`), the user typed nothing after `keepnote`, so we show the list by default.

Without commander, you'd have to manually parse `process.argv` — check if `argv[2]` is `'add'`, then grab `argv[3]` as the task text, etc. Commander does all of that for you.

---

## 7. The commander library

Commander is a library that turns the raw `process.argv` array into something much easier to work with. Let's trace through exactly what it does.

### Defining a command

```js
program
  .command('add <task>')
  .alias('a')
  .description('Add a new task')
  .option('-p, --priority <level>', 'Set priority: high | normal | low', 'normal')
  .action((task, options) => add(task, options));
```

Let's go piece by piece:

**`.command('add <task>')`**

This says: "I have a command called `add`. It takes one required argument called `task`."

The `<task>` in angle brackets means required. If you used `[task]` in square brackets, it would be optional.

Commander reads `process.argv`, sees `add` at position `[2]`, and knows to activate this command. It then takes whatever is at `[3]` and calls it `task`.

**`.alias('a')`**

Lets users type `keepnote a "task"` instead of `keepnote add "task"`. Just a shortcut.

**`.option('-p, --priority <level>', 'description', 'normal')`**

Defines a flag. The three arguments are:
1. `-p, --priority <level>` — short form (`-p`) and long form (`--priority`). Both work. The `<level>` means the flag expects a value after it.
2. `'Set priority...'` — description shown in `--help`
3. `'normal'` — **default value** if the user doesn't provide the flag

So if the user types `keepnote add "task"`, `options.priority` will be `'normal'`.
If they type `keepnote add "task" -p high`, `options.priority` will be `'high'`.

**`.action((task, options) => add(task, options))`**

The callback function that runs when this command is matched. Commander parses all the arguments and flags, then calls your function with them already extracted and named. No manual parsing needed.

### `program.parse(process.argv)`

This is the line that actually triggers everything. Before this line runs, you've just been *defining* commands. When `parse` runs, commander reads `process.argv`, finds the matching command, and calls its `.action()`.

---

## 8. storage.js

This file handles all reading and writing of data. It's the only file that touches the disk.

```js
const fs   = require('fs');
const path = require('path');
const os   = require('os');
```

Three built-in Node.js modules:
- `fs` (file system) — read files, write files, check if files exist
- `path` — build file paths correctly (handles `/` vs `\` on Windows vs Mac/Linux)
- `os` — get information about the operating system

### Where data is stored

```js
const DATA_FILE = path.join(os.homedir(), '.keepnote.json');
```

`os.homedir()` returns the user's home directory:
- On Mac: `/Users/yourname`
- On Linux: `/home/yourname`
- On Windows: `C:\Users\yourname`

`path.join()` combines path pieces correctly for whatever OS you're on. So `DATA_FILE` ends up as something like `/Users/yourname/.keepnote.json`.

**Why the home directory?** It's the one place that:
- Always exists on every system
- The user always has permission to write to
- Is specific to this user (not shared across users)

**Why the dot prefix (`.keepnote`)?** On Mac and Linux, files starting with `.` are hidden from normal folder views. This is a convention for config/data files that apps create — they stay out of the way. On Windows this convention doesn't apply, but the file still just sits there quietly.

**Why JSON?** JSON (JavaScript Object Notation) is:
- Human-readable (you can open `.keepnote.json` in any text editor)
- Trivial to read/write in JavaScript (`JSON.parse` and `JSON.stringify` are built in)
- Sufficient for small amounts of data like a todo list

The alternative would be a real database (SQLite, etc.), but that's massive overkill for a personal todo app.

### The `load()` function

```js
function load() {
  if (!fs.existsSync(DATA_FILE)) return { tasks: [] };
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { tasks: [] };
  }
}
```

Line by line:

**`if (!fs.existsSync(DATA_FILE)) return { tasks: [] };`**

`fs.existsSync()` checks if a file exists. Returns `true` or `false`. Synchronously (it waits for the answer).

The `!` flips it. So this says: "if the file does NOT exist, return an empty task list."

This handles first-time use. When you've never run keepnote before, `.keepnote.json` doesn't exist yet. Instead of crashing, we return a fresh empty structure.

**`fs.readFileSync(DATA_FILE, 'utf8')`**

Reads the entire file as a string. The second argument `'utf8'` tells it to treat the bytes as text (not raw binary data). Without this, you'd get a Buffer object instead of a string.

**`JSON.parse(...)`**

Converts the JSON string back into a JavaScript object. The file on disk might contain:
```json
{"tasks":[{"id":1234,"text":"Buy milk","done":false}]}
```
After `JSON.parse`, you have an actual JavaScript object with actual arrays and booleans.

**`try { ... } catch { return { tasks: [] }; }`**

If the JSON file got corrupted (maybe the disk was full mid-write, maybe someone manually edited it wrong), `JSON.parse` would throw an error and crash your program. The `try/catch` intercepts that error and returns an empty list instead of crashing.

### The `save()` function

```js
function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
```

**`JSON.stringify(data, null, 2)`**

Converts your JavaScript object back into a JSON string.
- First arg: the data to convert
- Second arg: `null` means "no custom replacer function"
- Third arg: `2` means "indent with 2 spaces"

The `2` makes the file human-readable:
```json
{
  "tasks": [
    {
      "id": 1234,
      "text": "Buy milk",
      "done": false
    }
  ]
}
```

Without it, everything would be on one line — still valid JSON but impossible to read manually.

**`fs.writeFileSync(DATA_FILE, ...)`**

Writes the string to the file. If the file doesn't exist, it creates it. If it does exist, it **overwrites** the entire file with the new content.

This is why every save operation rewrites the whole file. We load all tasks, modify the array in memory, then write the entire array back. For a small todo list this is fine. For a database with millions of rows, you'd use a real database that can update individual records.

### Why `getTasks` and `saveTasks` wrap `load` and `save`

```js
function getTasks()      { return load().tasks; }
function saveTasks(tasks) { save({ tasks }); }
```

These are convenience wrappers. Every other file only cares about the `tasks` array, not the whole `{ tasks: [...] }` object. So these functions handle that unwrapping/wrapping automatically.

`{ tasks }` in `save({ tasks })` is ES6 shorthand for `{ tasks: tasks }`. When the key and variable name are the same, you can write it once.

---

## 9. add.js

```js
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
  ...
}
```

### Validation first

```js
if (!taskText || taskText.trim() === '') {
```

`!taskText` catches `null`, `undefined`, or empty string `''`.
`taskText.trim() === ''` catches strings that are only spaces, like `"   "`. `trim()` removes leading and trailing whitespace.

Always validate input before processing it. If you skipped this, `keepnote add "  "` would create a blank task.

### The task object

```js
const newTask = {
  id: Date.now(),
  text: taskText.trim(),
  done: false,
  priority: options.priority || 'normal',
  createdAt: new Date().toISOString(),
};
```

**`id: Date.now()`**

`Date.now()` returns the current time as milliseconds since January 1, 1970 (called "Unix timestamp"). For example: `1718123456789`.

This is used as a unique ID. Two tasks created in the same millisecond would have the same ID — a real flaw for production software, but fine for a personal todo tool. A proper solution would use a UUID library.

The ID matters because list numbers (1, 2, 3...) change when tasks are deleted. The ID never changes, so you can always find the exact task.

**`text: taskText.trim()`**

`.trim()` again — removes accidental spaces from the start/end of the task text.

**`done: false`**

New tasks are always not done. Explicit. No ambiguity.

**`priority: options.priority || 'normal'`**

`||` means "or". If `options.priority` is falsy (undefined, null, empty string), use `'normal'`. This is the fallback. Commander already provides a default of `'normal'` from the `.option()` definition, so this `||` is an extra safety net.

**`createdAt: new Date().toISOString()`**

Stores when the task was created. `new Date()` creates a Date object for right now. `.toISOString()` converts it to a standard string format: `"2024-01-15T10:30:00.000Z"`. This format is sortable as a string and readable everywhere.

### `tasks.push(newTask)`

`push()` adds an item to the end of an array. The `tasks` array now has one more item in it — in memory.

### `saveTasks(tasks)`

Writes the modified array back to disk. If you removed this line, the task would exist only in memory and disappear when the program exits.

---

## 10. list.js

```js
function list(options) {
  let tasks = getTasks();

  if (tasks.length === 0) {
    console.log(chalk.gray('  No tasks yet...'));
    return;
  }

  if (options.done)    tasks = tasks.filter(t => t.done);
  else if (options.pending) tasks = tasks.filter(t => !t.done);

  const priorityOrder = { high: 0, normal: 1, low: 2 };
  tasks = tasks.sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 1;
    const pb = priorityOrder[b.priority] ?? 1;
    return pa - pb;
  });
  ...
}
```

### Filtering with `.filter()`

```js
tasks = tasks.filter(t => t.done);
```

`.filter()` creates a **new array** containing only the items where the callback returns `true`.

`t => t.done` is an arrow function. For each task `t`, return `t.done`. If `done` is `true`, include it. If `false`, exclude it.

`tasks = tasks.filter(t => !t.done)` is the opposite — `!t.done` means "include items where done is false" (pending tasks).

Note: `tasks` is `let` (not `const`) at the top. This is intentional — we need to reassign it to the filtered result. If it were `const`, this line would throw an error.

### Sorting with `.sort()`

```js
const priorityOrder = { high: 0, normal: 1, low: 2 };
tasks = tasks.sort((a, b) => {
  const pa = priorityOrder[a.priority] ?? 1;
  const pb = priorityOrder[b.priority] ?? 1;
  return pa - pb;
});
```

**How `.sort()` works:**

You give `.sort()` a function that takes two items (`a` and `b`) and returns:
- A negative number → put `a` before `b`
- A positive number → put `b` before `a`
- Zero → leave them in the same order

`return pa - pb` is the classic numeric sort. If `pa = 0` (high) and `pb = 2` (low), you get `0 - 2 = -2` (negative), so high-priority task comes first. Perfect.

**The `??` operator:**

`priorityOrder[a.priority] ?? 1`

`??` is the "nullish coalescing" operator. It returns the right side only if the left side is `null` or `undefined`. This handles a task that somehow has no `priority` field — instead of `undefined`, it defaults to `1` (normal).

This is different from `||`. The `||` operator also catches `0`, `''`, and `false` as falsy. `??` only catches `null` and `undefined`. For numbers, `??` is safer.

### Formatting the output

```js
const num = chalk.gray(`  ${String(i + 1).padStart(2)}.`);
```

`String(i + 1)` converts the number to a string (`1` → `'1'`).
`.padStart(2)` pads with spaces to reach a minimum length of 2 characters. So `'1'` becomes `' 1'`, and `'10'` stays `'10'`. This keeps the numbers aligned in a column.

```js
const idHint = chalk.gray(` #${task.id}`);
```

Shows the full timestamp ID. Users need this when doing `keepnote done <id>` — they can copy-paste it.

---

## 11. actions.js

### `resolveTask` — the smart lookup function

```js
function resolveTask(tasks, ref) {
  const byId = tasks.find(t => String(t.id) === String(ref));
  if (byId) return byId;

  const pos = parseInt(ref, 10);
  if (!isNaN(pos) && pos >= 1 && pos <= tasks.length) {
    return tasks[pos - 1];
  }

  return null;
}
```

This function accepts `ref` which is whatever the user typed — it could be:
- `"2"` meaning "task number 2 in the list"
- `"1718123456789"` meaning "the task with this exact ID"

**First attempt: match by exact ID**

```js
const byId = tasks.find(t => String(t.id) === String(ref));
```

`.find()` returns the first item in the array where the callback returns `true`. If nothing matches, it returns `undefined`.

`String(t.id)` converts the numeric ID to a string, and `String(ref)` ensures the user input is also a string, so `===` comparison works correctly. (If `t.id` is `1718` and `ref` is `"1718"`, comparing them directly with `===` would fail because one is a number and one is a string.)

**Second attempt: treat as a list position**

```js
const pos = parseInt(ref, 10);
```

`parseInt(string, radix)` converts a string to an integer. The `10` is the radix (base 10 = normal decimal numbers). Always specify the radix — without it, old JavaScript engines could interpret strings starting with `0` as octal.

`parseInt('2abc', 10)` returns `2` — it stops at the non-numeric character.
`parseInt('abc', 10)` returns `NaN` (Not a Number).

```js
if (!isNaN(pos) && pos >= 1 && pos <= tasks.length) {
  return tasks[pos - 1];
}
```

`!isNaN(pos)` — make sure parsing succeeded (it's an actual number).
`pos >= 1` — list positions start at 1, not 0.
`pos <= tasks.length` — can't pick position 10 if only 3 tasks exist.

`tasks[pos - 1]` — arrays are zero-indexed in JavaScript. Position 1 in the list is index `0` in the array. Position 2 is index `1`. So we subtract 1.

### The `done()` function

```js
function done(ref) {
  const tasks = getTasks();
  const task = resolveTask(tasks, ref);

  if (!task) { /* error */ return; }
  if (task.done) { /* already done */ return; }

  task.done = true;
  task.completedAt = new Date().toISOString();
  saveTasks(tasks);
}
```

Key insight here: `task` is a **reference** to the object inside the `tasks` array. When you do `task.done = true`, you're modifying the same object that's inside the `tasks` array. So when you call `saveTasks(tasks)` after, the array already contains the updated task.

This is how JavaScript objects work — variables don't hold values, they hold references (pointers) to values. Modifying `task` modifies the original.

### The `deleteTask()` function

```js
const updated = tasks.filter(t => t.id !== task.id);
saveTasks(updated);
```

To delete, we don't remove from the array directly. We create a **new array** that contains every task EXCEPT the one we want to delete. Then we save that new array.

`t.id !== task.id` means "include this task only if its ID is NOT the one we're deleting."

This is the functional programming approach — instead of mutating (changing) the original array, you create a new one. It's cleaner and avoids bugs.

---

## 12. chalk

Chalk is a library that adds color to terminal output.

Terminals support color through special escape codes — invisible characters that tell the terminal "start printing in red" or "make this bold". These are called ANSI escape codes.

For example, red text is actually: `\x1b[31mhello\x1b[0m`
- `\x1b[31m` = start red
- `hello` = the text
- `\x1b[0m` = reset all formatting

Nobody wants to write that. Chalk wraps it:

```js
chalk.red('hello')     // wraps with red escape codes
chalk.green('done')    // wraps with green escape codes
chalk.bold.white('hi') // bold + white, chained
chalk.bgRed.white('!') // red background, white text
chalk.gray.strikethrough('old') // gray + strikethrough
```

**Why chalk version 4 specifically?**

There are two types of JavaScript modules:
- **CommonJS** (CJS): `require()` / `module.exports` — the older Node.js style
- **ES Modules** (ESM): `import` / `export` — the newer web-standard style

Our project uses `require()` (CommonJS). Chalk version 5 switched to ESM only. Chalk version 4 still supports CommonJS. That's why `package.json` specifies `"chalk": "^4.1.2"` — version 5 would break our `require('chalk')` calls.

---

## 13. The full journey of one command

Let's trace exactly what happens when you type:

```
keepnote add "Buy milk" -p high
```

**Step 1: Terminal splits your input**
The terminal breaks this into: `["keepnote", "add", "Buy milk", "-p", "high"]`

**Step 2: Terminal finds `keepnote`**
Searches `PATH` folders, finds the file npm installed at `/usr/local/bin/keepnote`.

**Step 3: OS reads the shebang**
Opens the file, sees `#!/usr/bin/env node`. Launches Node.js and tells it to run `cli.js`.

**Step 4: Node.js starts executing `cli.js`**
Runs the `require()` lines at the top, loading commander, chalk, and your source files into memory.

**Step 5: Commander commands are defined**
All the `.command()` blocks run — but they're just *registering* commands, not executing them yet.

**Step 6: `process.argv` check**
```js
if (process.argv.length <= 2) {
```
`process.argv` is `['node', 'cli.js', 'add', 'Buy milk', '-p', 'high']` — length 6, not ≤ 2.
So we go to `program.parse(process.argv)`.

**Step 7: Commander parses**
Commander reads `process.argv[2]` = `'add'`, finds the matching `.command('add <task>')`.
Extracts `process.argv[3]` = `'Buy milk'` as the `task` argument.
Sees `-p` at `process.argv[4]` and `'high'` at `[5]`, sets `options.priority = 'high'`.

**Step 8: `.action()` fires**
Commander calls `(task, options) => add(task, options)` with:
- `task = 'Buy milk'`
- `options = { priority: 'high' }`

**Step 9: `add()` function runs (add.js)**
- Validates: `'Buy milk'` is not empty ✓
- Calls `getTasks()` → calls `load()` → reads `~/.keepnote.json` from disk → `JSON.parse` → returns `tasks` array
- Builds `newTask` object with `id: Date.now()`, `text: 'Buy milk'`, `done: false`, `priority: 'high'`
- `tasks.push(newTask)` adds it to the in-memory array
- `saveTasks(tasks)` → `save({ tasks })` → `JSON.stringify` → `fs.writeFileSync` → written to disk

**Step 10: Output**
`console.log(chalk.green('✔  Task added:'), chalk.white('Buy milk') + chalk.red(' [HIGH]'))`
Terminal receives the ANSI-escaped string and displays colored text.

**Step 11: Program exits**
The function returns. No more code to run. Node.js exits. The terminal prompt returns.

The entire process takes maybe 30–50 milliseconds.

---

## 14. npm link

During development, you don't want to publish to npm every time you change a line. `npm link` solves this.

When you run `npm link` inside your project folder, npm:
1. Registers your package globally on your computer
2. Creates a **symlink** (symbolic link) at `/usr/local/bin/keepnote` pointing to your actual project folder

A symlink is like a shortcut — it's a file that points to another location. So `/usr/local/bin/keepnote` isn't a copy of your code; it's a pointer to it.

This means when you edit `cli.js` and then run `keepnote` in the terminal, it immediately runs your updated code. No reinstalling. No copying files. The symlink always points to your current code.

To undo it: `npm unlink` in the project folder, or `npm uninstall -g keepnote`.

---

## 15. npm publish

When your tool is ready for the world:

```bash
npm login       # authenticate with npmjs.com
npm publish     # upload your package
```

What happens:
1. npm reads `package.json` for the name and version
2. Bundles all your files (excluding `node_modules/` — that would be huge)
3. Uploads the bundle to the npm registry (a giant public database of packages)
4. Anyone can now `npm install -g keepnote`

When someone installs it:
1. npm downloads your bundle from the registry
2. Installs it into their global node_modules
3. Reads your `bin` field from `package.json`
4. Creates the command at their `/usr/local/bin/keepnote`

One important thing: **you can never publish the same version twice**. If you fix a bug and want to publish again, you must bump the version number first (`1.0.0` → `1.0.1`). This is why versioning matters.

---

## 16. Why these design decisions?

### Why separate files instead of one big file?

**Separation of concerns.** Each file has one job:
- `storage.js` — only handles disk read/write
- `add.js` — only handles adding tasks
- `list.js` — only handles display
- `actions.js` — handles modification operations
- `cli.js` — only handles command routing

If a bug exists in the save logic, you know to look in `storage.js`. If display is wrong, look in `list.js`. If everything were in one file, finding bugs would mean searching through hundreds of lines.

Also: `getTasks` and `saveTasks` are called from multiple files (`add.js`, `list.js`, `actions.js`). If they were copy-pasted into each file and you needed to change how saving works, you'd have to change it in 3 places and risk making them inconsistent. One `storage.js` means one place to change.

### Why JSON and not a real database?

For a personal todo list with maybe a few hundred tasks, a JSON file is:
- Zero configuration (no database server to install)
- Zero dependencies (no database driver library)
- Human-readable (open it in any text editor)
- Plenty fast

SQLite would be the next step up if you needed thousands of tasks or complex queries (like "show tasks created between these dates").

### Why rewrite the whole file on every save?

Because our data is tiny. Reading and writing 10KB is essentially instant. The alternative (appending or updating specific records) is significantly more complex code. For a file under a few megabytes, full rewrites are simpler and perfectly fast.

### Why use `Date.now()` as an ID instead of 1, 2, 3?

Sequential numbers (1, 2, 3) seem simpler but break when you delete tasks. If you have tasks 1, 2, 3, delete #2, and add a new one, the new one would get ID 2 again — same as the deleted one. If you kept any references to task #2 anywhere, they'd now point to the wrong task.

`Date.now()` gives a unique number that will never repeat (unless two tasks are created in the exact same millisecond, which is practically impossible for a personal tool).

### Why is `list.js` using `let tasks` instead of `const tasks`?

```js
let tasks = getTasks();
// later...
tasks = tasks.filter(...);
tasks = tasks.sort(...);
```

`const` prevents reassignment. `let` allows it. We need to reassign `tasks` to the filtered/sorted result, so we need `let`. Using `const` and then trying `tasks = tasks.filter(...)` would throw: `TypeError: Assignment to constant variable`.

Note: `.push()` and direct property modification would still work on `const` arrays/objects — you can mutate what they point to, just not make them point to something new. But `.filter()` creates a new array and reassigns, which requires `let`.

---

## Summary

The full mental model of keepnote:

```
You type:  keepnote add "Task" -p high
              ↓
Terminal finds "keepnote" in PATH (put there by npm)
              ↓
OS reads shebang, starts Node.js with cli.js
              ↓
cli.js loads all modules with require()
              ↓
commander reads process.argv, matches "add" command
              ↓
add() function called with task="Task", options={priority:"high"}
              ↓
storage.js reads ~/.keepnote.json from disk
              ↓
New task object built with Date.now() ID
              ↓
Task pushed into array, array written back to disk
              ↓
chalk prints colored confirmation to terminal
              ↓
Program exits
```

Every piece of this chain has a reason it exists and a specific problem it solves. None of it is magic — it's all just code following rules and data moving between places.
