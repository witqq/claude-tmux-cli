## Назначение

CLI утилита для запуска долгих задач (dev серверы, сборки, watchers) в tmux с автоматической привязкой к директории проекта.

## Базовые команды

```bash
# Запуск процесса
claude-tmux exec "npm run start"
claude-tmux exec server "npm run start"

# Чтение output
claude-tmux read
claude-tmux read server --lines 20

# Подключение пользователя
claude-tmux connect
```

## Пример

```bash
cd /Users/mike/project

claude-tmux exec api "npm run start"
claude-tmux exec web "npm run dev"
claude-tmux read api --lines 10
claude-tmux connect
```

Проект: `/Users/mike/WebstormProjects/claude-tmux-cli`
