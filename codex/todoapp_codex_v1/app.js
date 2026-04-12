const STORAGE_KEY = "task-current-items";

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const stats = document.querySelector("#stats");
const template = document.querySelector("#task-template");
const filterButtons = [...document.querySelectorAll(".filter")];

let tasks = loadTasks();
let activeFilter = "all";

render();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    done: false
  });

  input.value = "";
  persist();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });

    render();
  });
});

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedTasks();
  } catch {
    return seedTasks();
  }
}

function seedTasks() {
  return [
    { id: "seed-1", text: "Sketch today's top priority", done: false },
    { id: "seed-2", text: "Clear one small lingering task", done: true }
  ];
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  list.innerHTML = "";

  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "active") {
      return !task.done;
    }

    if (activeFilter === "done") {
      return task.done;
    }

    return true;
  });

  if (visibleTasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Nothing here yet. Add a task or switch filters.";
    list.append(empty);
  } else {
    visibleTasks.forEach((task) => {
      const fragment = template.content.cloneNode(true);
      const item = fragment.querySelector(".task-item");
      const toggle = fragment.querySelector(".task-toggle");
      const text = fragment.querySelector(".task-text");
      const editButton = fragment.querySelector(".task-edit");
      const deleteButton = fragment.querySelector(".task-delete");

      item.dataset.id = task.id;
      item.classList.toggle("is-done", task.done);
      toggle.checked = task.done;
      text.textContent = task.text;

      toggle.addEventListener("change", () => {
        updateTask(task.id, { done: toggle.checked });
      });

      editButton.addEventListener("click", () => {
        const nextText = window.prompt("Edit task", task.text);

        if (nextText === null) {
          return;
        }

        const trimmed = nextText.trim();
        if (!trimmed) {
          return;
        }

        updateTask(task.id, { text: trimmed });
      });

      deleteButton.addEventListener("click", () => {
        tasks = tasks.filter((itemTask) => itemTask.id !== task.id);
        persist();
        render();
      });

      list.append(fragment);
    });
  }

  const doneCount = tasks.filter((task) => task.done).length;
  stats.innerHTML = `<span>${tasks.length} total</span><span>${doneCount} done</span>`;
}

function updateTask(id, changes) {
  tasks = tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    return { ...task, ...changes };
  });

  persist();
  render();
}
