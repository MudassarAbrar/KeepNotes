<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=keepnotes&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=A%20fast%2C%20simple%20terminal-based%20todo%20%26%20note-keeping%20CLI&descAlignY=55&descSize=18" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=A78BFA&center=true&vCenter=true&width=600&lines=No+browser%2C+no+GUI+%E2%80%94+just+your+terminal;Add%2C+track+%26+manage+tasks+instantly;Local-first.+Your+data+never+leaves+your+machine;Built+with+Node.js" alt="Typing SVG" />

<br/>

![npm version](https://img.shields.io/npm/v/@mudassirabrar/keepnotes?style=for-the-badge&color=7C3AED&logo=npm&logoColor=white)
![npm downloads](https://img.shields.io/npm/dt/@mudassirabrar/keepnotes?style=for-the-badge&color=6366F1&logo=npm&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-8B5CF6?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-A78BFA?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Stars](https://img.shields.io/github/stars/MudassarAbrar/keepnotes?style=for-the-badge&color=7C3AED&logo=github)

</div>

---

## 🟣 Overview

**keepnotes** is a lightweight, no-frills CLI tool for managing your tasks directly from the terminal. No accounts, no syncing, no distractions — just fast, local task management with a clean, color-coded interface.

```yaml
features:
  - "Add tasks with priority levels (high / normal / low)"
  - "List, filter, and track pending vs completed tasks"
  - "Mark tasks done/undone with shorthand aliases"
  - "Delete individual tasks or clear completed ones"
  - "100% local storage — nothing leaves your machine"
  - "Beautiful ASCII banner & table-based CLI output"
```

---

## 🟣 Installation

<details open>
<summary><b>📦 From npm (recommended)</b></summary>
<br/>

```bash
npm install -g @mudassirabrar/keepnotes
```

</details>

<details>
<summary><b>🛠️ From source (development)</b></summary>
<br/>

```bash
git clone https://github.com/MudassarAbrar/keepnotes.git
cd keepnotes
npm install
npm link       # makes "keepnotes" available as a global command
```

</details>

---

## 🟣 Usage

### Add a task

```bash
keepnotes add "Buy milk"
keepnotes add "Fix the login bug" --priority high
keepnotes add "Read that article" -p low
```

> Priority levels: `high` | `normal` (default) | `low`

<br/>

### List tasks

```bash
keepnotes list          # or: keepnotes ls
keepnotes list --pending   # show only incomplete tasks
keepnotes list --done      # show only completed tasks
```

<br/>

### Mark as done

```bash
keepnotes done 2        # mark task #2 (by list position)
keepnotes d 2           # shorthand alias
```

<br/>

### Mark as pending again

```bash
keepnotes undone 1
keepnotes u 1           # shorthand alias
```

<br/>

### Delete a task

```bash
keepnotes delete 3
keepnotes del 3         # shorthand alias
```

<br/>

### Clear completed tasks

```bash
keepnotes clear         # removes all completed tasks
keepnotes clear --all   # removes EVERY task (use carefully!)
```

---

## 🟣 Command Reference

<div align="center">

| Command | Alias | Description |
|---|:---:|---|
| `keepnotes add "<task>"` | — | Add a new task |
| `--priority <level>` | `-p` | Set priority: `high`, `normal`, `low` |
| `keepnotes list` | `ls` | List all tasks |
| `--pending` | — | Show only incomplete tasks |
| `--done` | — | Show only completed tasks |
| `keepnotes done <id>` | `d` | Mark a task as done |
| `keepnotes undone <id>` | `u` | Mark a task as pending again |
| `keepnotes delete <id>` | `del` | Delete a task |
| `keepnotes clear` | — | Remove all completed tasks |
| `keepnotes clear --all` | — | Remove every task |

</div>

---

## 🟣 Quick Demo

```
$ keepnotes add "Write the README" -p high
✔  Task added: Write the README [HIGH]

$ keepnotes add "Push to GitHub"
✔  Task added: Push to GitHub

$ keepnotes list

██╗  ██╗███████╗███████╗██████╗ ███╗   ██╗ ██████╗ ████████╗███████╗███████╗
██║ ██╔╝██╔════╝██╔════╝██╔══██╗████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔════╝
█████╔╝ █████╗  █████╗  ██████╔╝██╔██╗ ██║██║   ██║   ██║   █████╗  ███████╗
██╔═██╗ ██╔══╝  ██╔══╝  ██╔══╝  ██╔═══╝ ██║╚██╗██║██║   ██║   ██║   ██╔══╝  ╚════██║
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
```

---

## 🟣 Data Storage

<div align="center">

| Aspect | Details |
|---|---|
| **Storage Location** | `~/.keepnotes.json` |
| **Storage Type** | Local JSON file |
| **Network Access** | None — fully offline |
| **Privacy** | Nothing is sent anywhere |

</div>

---

## 🟣 Project Structure

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

---

## 🟣 Tech Stack

<div align="center">

![Skills](https://skillicons.dev/icons?i=nodejs,javascript,npm&theme=dark)

</div>

---

## 🟣 Publishing to npm

```bash
npm login
npm publish --access=public
```

Anyone can then install it globally with:

```bash
npm install -g @mudassirabrar/keepnotes
```

---

## 🟣 Contributing

Contributions, issues, and feature requests are welcome!

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

Then open a Pull Request 🚀

---

## 🟣 Author

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-7C3AED?style=for-the-badge&logo=github&logoColor=white)](https://github.com/MudassarAbrar)
[![Email](https://img.shields.io/badge/Email-6366F1?style=for-the-badge&logo=gmail&logoColor=white)](mailto:muhammadmudassirabrarbaig@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-8B5CF6?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/)

</div>

---

<div align="center">

*"Simplicity is the ultimate productivity tool."*

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=20,11,6&height=120&section=footer" width="100%"/>

</div>
