import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NotFoundError } from "../errors.js";

export class TaskRepository {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async list() {
    const tasks = await this.#read();
    return tasks.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async create(title) {
    const tasks = await this.#read();
    const timestamp = new Date().toISOString();

    const task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    tasks.push(task);
    await this.#write(tasks);
    return task;
  }

  async update(taskId, changes) {
    const tasks = await this.#read();
    const index = tasks.findIndex((task) => task.id === taskId);

    if (index === -1) {
      throw new NotFoundError("Task not found.");
    }

    const nextTask = {
      ...tasks[index],
      ...changes,
      updatedAt: new Date().toISOString()
    };

    tasks[index] = nextTask;
    await this.#write(tasks);
    return nextTask;
  }

  async remove(taskId) {
    const tasks = await this.#read();
    const nextTasks = tasks.filter((task) => task.id !== taskId);

    if (nextTasks.length === tasks.length) {
      throw new NotFoundError("Task not found.");
    }

    await this.#write(nextTasks);
  }

  async #read() {
    try {
      const content = await fs.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        await this.#write([]);
        return [];
      }

      throw error;
    }
  }

  async #write(tasks) {
    const tempFile = `${this.filePath}.tmp`;
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(tempFile, JSON.stringify(tasks, null, 2), "utf8");
    await fs.rename(tempFile, this.filePath);
  }
}
