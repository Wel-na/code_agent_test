import { Router } from "express";
import { ValidationError } from "../errors.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

function validateCreatePayload(body) {
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!title) {
    throw new ValidationError("Task title is required.");
  }

  if (title.length > 120) {
    throw new ValidationError("Task title must be 120 characters or fewer.");
  }

  return { title };
}

function validateUpdatePayload(body) {
  const updates = {};

  if (Object.hasOwn(body, "title")) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      throw new ValidationError("Task title cannot be empty.");
    }
    if (title.length > 120) {
      throw new ValidationError("Task title must be 120 characters or fewer.");
    }
    updates.title = title;
  }

  if (Object.hasOwn(body, "completed")) {
    if (typeof body.completed !== "boolean") {
      throw new ValidationError("Task completed must be a boolean.");
    }
    updates.completed = body.completed;
  }

  if (Object.keys(updates).length === 0) {
    throw new ValidationError("Provide at least one valid field to update.");
  }

  return updates;
}

export function createTaskRouter(taskRepository) {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      const tasks = await taskRepository.list();
      response.json({ data: { tasks } });
    })
  );

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      const { title } = validateCreatePayload(request.body ?? {});
      const task = await taskRepository.create(title);
      response.status(201).json({ data: { task } });
    })
  );

  router.patch(
    "/:taskId",
    asyncHandler(async (request, response) => {
      const updates = validateUpdatePayload(request.body ?? {});
      const task = await taskRepository.update(request.params.taskId, updates);
      response.json({ data: { task } });
    })
  );

  router.delete(
    "/:taskId",
    asyncHandler(async (request, response) => {
      await taskRepository.remove(request.params.taskId);
      response.status(204).send();
    })
  );

  return router;
}
