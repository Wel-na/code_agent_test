import { useEffect, useState } from "react";
import { tasksApi } from "./api";

const FILTERS = {
  all: () => true,
  active: (task) => !task.completed,
  completed: (task) => task.completed
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTasks() {
      try {
        setLoading(true);
        setError("");
        const response = await tasksApi.getAll();
        if (active) {
          setTasks(response.data.tasks);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      active = false;
    };
  }, []);

  const visibleTasks = tasks.filter(FILTERS[filter]);
  const completedCount = tasks.filter((task) => task.completed).length;

  async function handleCreateTask(event) {
    event.preventDefault();
    const title = draft.trim();

    if (!title) {
      setError("Enter a task before submitting.");
      return;
    }

    try {
      setMutating(true);
      setError("");
      setNotice("");
      const response = await tasksApi.create(title);
      setTasks((current) => [response.data.task, ...current]);
      setDraft("");
      setNotice("Task added.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setMutating(false);
    }
  }

  async function handleToggleTask(task) {
    try {
      setMutating(true);
      setError("");
      setNotice("");
      const response = await tasksApi.update(task.id, {
        completed: !task.completed
      });
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? response.data.task : item))
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setMutating(false);
    }
  }

  async function handleEditTask(task) {
    const nextTitle = window.prompt("Edit task", task.title);

    if (nextTitle === null) {
      return;
    }

    const trimmedTitle = nextTitle.trim();
    if (!trimmedTitle) {
      setError("Task title cannot be empty.");
      return;
    }

    try {
      setMutating(true);
      setError("");
      setNotice("");
      const response = await tasksApi.update(task.id, {
        title: trimmedTitle
      });
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? response.data.task : item))
      );
      setNotice("Task updated.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setMutating(false);
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      setMutating(true);
      setError("");
      setNotice("");
      await tasksApi.remove(taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
      setNotice("Task removed.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setMutating(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Daily Planner</p>
        <h1>Build a calmer list.</h1>
        <p className="hero-copy">
          A React frontend backed by a hardened API, designed to stay clear under failure
          as well as during normal use.
        </p>

        <form className="task-form" onSubmit={handleCreateTask}>
          <label className="sr-only" htmlFor="task-title">
            New task
          </label>
          <input
            id="task-title"
            maxLength={120}
            name="title"
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a task"
            required
            value={draft}
          />
          <button disabled={mutating} type="submit">
            {mutating ? "Working..." : "Add Task"}
          </button>
        </form>

        {(error || notice) && (
          <p className={`feedback ${error ? "feedback-error" : "feedback-notice"}`} role="status">
            {error || notice}
          </p>
        )}
      </section>

      <section className="board">
        <header className="board-header">
          <div>
            <p className="board-label">Overview</p>
            <h2>Your tasks</h2>
          </div>
          <div className="stats">
            <span>{tasks.length} total</span>
            <span>{completedCount} done</span>
          </div>
        </header>

        <div aria-label="Task filters" className="filters" role="tablist">
          {Object.keys(FILTERS).map((value) => (
            <button
              aria-pressed={filter === value}
              className={`filter ${filter === value ? "is-active" : ""}`}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state">Loading tasks...</div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state">No tasks match this filter.</div>
        ) : (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <li className={`task-item ${task.completed ? "is-done" : ""}`} key={task.id}>
                <label className="task-main">
                  <input
                    checked={task.completed}
                    className="task-toggle"
                    disabled={mutating}
                    onChange={() => handleToggleTask(task)}
                    type="checkbox"
                  />
                  <span className="task-text">{task.title}</span>
                </label>
                <div className="task-actions">
                  <button
                    className="ghost-button"
                    disabled={mutating}
                    onClick={() => handleEditTask(task)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="ghost-button task-delete"
                    disabled={mutating}
                    onClick={() => handleDeleteTask(task.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
