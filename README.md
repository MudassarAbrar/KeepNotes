# keepnotes 📋

A fast, simple terminal-based todo & note-keeping CLI app. Runs directly from your terminal — no browser, no GUI.

---

## Installation

### From npm (once published)
```bash
npm install -g @mudassirabrar/keepnotes
```

### From GitHub (for development)
```bash
git clone https://github.com/YOUR_USERNAME/keepnotes.git
cd keepnotes
npm install
npm link       # makes "keepnotes" available as a global command
```

---

## Commands

### Add a task
```bash
keepnotes add "Buy milk"
keepnotes add "Fix the login bug" --priority high
keepnotes add "Read that article" -p low
```
Priority levels: `high` | `normal` (default) | `low`

### List tasks
```bash
keepnotes list          # or: keepnotes ls
keepnotes list --pending   # show only incomplete tasks
keepnotes list --done      # show only completed tasks
```

### Mark as done
```bash
keepnotes done 2        # mark task #2 (by list position)
keepnotes d 2           # shorthand alias
```

### Mark as pending again
```bash
keepnotes undone 1
keepnotes u 1           # shorthand alias
```

### Delete a task
```bash
keepnotes delete 3
keepnotes del 3         # shorthand alias
```

### Clear completed tasks
```bash
keepnotes clear         # removes all completed tasks
keepnotes clear --all   # removes EVERY task (use carefully!)
```

---

## Quick demo

```
$ keepnotes add "Write the README" -p high
✔  Task added: Write the README [HIGH]

$ keepnotes add "Push to GitHub"
✔  Task added: Push to GitHub

$ keepnotes list

██╗  ██╗███████╗███████╗██████╗ ███╗   ██╗ ██████╗ ████████╗███████╗███████╗
██║ ██╔╝██╔════╝██╔════╝██╔══██╗████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔════╝
█████╔╝ █████╗  █████╗  ██████╔╝██╔██╗ ██║██║   ██║   ██║   █████╗  ███████╗
██╔═██╗ ██╔══╝  ██╔══╝  ██╔═══╝ ██║╚██╗██║██║   ██║   ██║   ██╔══╝  ╚════██║
██║  ██╗███████╗███████╗██║     ██║ ╚████║╚██████╔╝   ██║   ███████╗███████║
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝

  📋  keepnotes — your tasks (0/2 completed)

╭───┬─────────┬──────────┬──────────────────┬───────────────╮
│ # │ Status  │ Priority │ Task             │      ID       │
├───┼─────────┼──────────┼──────────────────┼───────────────┤
│ 1 │ Pending │   HIGH   │ Write the README │ 1729381203492 │
│ 2 │ Pending │  NORMAL  │ Push to GitHub   │ 1729381203493 │
╰───┴─────────┴──────────┴──────────────────┴───────────────╯

$ keepnotes done 1
✔  Marked done: Write the README

$ keepnotes list
```

---

## Data storage

All tasks are saved locally in `~/.keepnotes.json` on your machine. Nothing is sent anywhere.

---

## Publishing to npm

1. Create an account at [npmjs.com](https://npmjs.com)
2. In the project folder:
```bash
npm login
npm publish --access=public
```
3. Anyone can now install it with `npm install -g @mudassirabrar/keepnotes`

---

## Project structure

```
keepnotes/
├── cli.js          ← entry point, defines all commands
├── src/
│   ├── add.js      ← add command logic
│   ├── list.js     ← list command logic
│   ├── actions.js  ← done, undone, delete, clear
│   └── storage.js  ← reads/writes ~/.keepnotes.json
└── package.json
```
