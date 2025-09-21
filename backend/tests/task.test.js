const request = require("supertest");
const app = require("../src/server");

describe("Task API Tests", () => {
  let testUser;
  let testTask;
  let userId;

  beforeAll(async () => {
    // Create a test user for task assignment
    const userResponse = await request(app)
      .post("/api/users")
      .send({
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        full_name: "Test User",
      });

    testUser = userResponse.body.data;
    userId = testUser.id;
  });

  beforeEach(() => {
    testTask = {
      title: `Test Task ${Date.now()}`,
      description: "This is a test task description",
      status: "todo",
      priority: "medium",
      due_date: "2024-12-31",
      assigned_to: userId,
    };
  });

  describe("POST /api/tasks", () => {
    it("should create a new task with valid data", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send(testTask)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(testTask.title);
      expect(response.body.data.description).toBe(testTask.description);
      expect(response.body.data.status).toBe(testTask.status);
      expect(response.body.data.priority).toBe(testTask.priority);
      expect(response.body.data.id).toBeDefined();
    });

    it("should create a task without assignment", async () => {
      const unassignedTask = { ...testTask };
      delete unassignedTask.assigned_to;

      const response = await request(app)
        .post("/api/tasks")
        .send(unassignedTask)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assigned_to).toBeNull();
    });

    it("should return 400 for missing title", async () => {
      const invalidTask = { ...testTask };
      delete invalidTask.title;

      const response = await request(app)
        .post("/api/tasks")
        .send(invalidTask)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for invalid status", async () => {
      const invalidTask = { ...testTask, status: "invalid-status" };

      const response = await request(app)
        .post("/api/tasks")
        .send(invalidTask)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for invalid priority", async () => {
      const invalidTask = { ...testTask, priority: "invalid-priority" };

      const response = await request(app)
        .post("/api/tasks")
        .send(invalidTask)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for non-existent user assignment", async () => {
      const invalidTask = { ...testTask, assigned_to: 99999 };

      const response = await request(app)
        .post("/api/tasks")
        .send(invalidTask)
        .expect(400);

      expect(response.body.error).toBe("Invalid assignment");
    });

    it("should return 400 for invalid date format", async () => {
      const invalidTask = { ...testTask, due_date: "invalid-date" };

      const response = await request(app)
        .post("/api/tasks")
        .send(invalidTask)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("GET /api/tasks", () => {
    it("should get all tasks", async () => {
      const response = await request(app).get("/api/tasks").expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
    });

    it("should filter tasks by status", async () => {
      const response = await request(app)
        .get("/api/tasks?status=todo")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.filters.status).toBe("todo");
    });

    it("should filter tasks by priority", async () => {
      const response = await request(app)
        .get("/api/tasks?priority=high")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.filters.priority).toBe("high");
    });

    it("should filter tasks by assigned user", async () => {
      const response = await request(app)
        .get(`/api/tasks?assignedTo=${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.filters.assignedTo).toBe(userId.toString());
    });

    it("should filter unassigned tasks", async () => {
      const response = await request(app)
        .get("/api/tasks?assignedTo=unassigned")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.filters.assignedTo).toBe("unassigned");
    });

    it("should search tasks by title", async () => {
      // Create a task first
      await request(app).post("/api/tasks").send(testTask);

      const response = await request(app)
        .get(`/api/tasks?search=${testTask.title}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.filters.search).toBe(testTask.title);
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/tasks?limit=5&offset=0")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.meta.offset).toBe(0);
    });

    it("should support sorting", async () => {
      const response = await request(app)
        .get("/api/tasks?sortBy=title&sortOrder=asc")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.sorting.sortBy).toBe("title");
      expect(response.body.meta.sorting.sortOrder).toBe("asc");
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should get task by ID", async () => {
      // Create a task first
      const createResponse = await request(app)
        .post("/api/tasks")
        .send(testTask);

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(taskId);
      expect(response.body.data.title).toBe(testTask.title);
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app).get("/api/tasks/99999").expect(404);

      expect(response.body.error).toBe("Task not found");
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update task with valid data", async () => {
      // Create a task first
      const createResponse = await request(app)
        .post("/api/tasks")
        .send(testTask);

      const taskId = createResponse.body.data.id;
      const updateData = { title: "Updated Task Title", status: "in-progress" };

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Updated Task Title");
      expect(response.body.data.status).toBe("in-progress");
    });

    it("should return 404 for non-existent task", async () => {
      const updateData = { title: "Updated Task Title" };

      const response = await request(app)
        .put("/api/tasks/99999")
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe("Task not found");
    });
  });

  describe("PATCH /api/tasks/:id/status", () => {
    it("should change task status", async () => {
      // Create a task first
      const createResponse = await request(app)
        .post("/api/tasks")
        .send(testTask);

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .send({ status: "done" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("done");
    });

    it("should return 400 for invalid status", async () => {
      // Create a task first
      const createResponse = await request(app)
        .post("/api/tasks")
        .send(testTask);

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .send({ status: "invalid-status" })
        .expect(400);

      expect(response.body.error).toBe("Invalid status");
    });
  });

  describe("PATCH /api/tasks/:id/assign", () => {
    it("should assign task to user", async () => {
      // Create a task first
      const createResponse = await request(app)
        .post("/api/tasks")
        .send({ ...testTask, assigned_to: null });

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/tasks/${taskId}/assign`)
        .send({ assigned_to: userId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assigned_to).toBe(userId);
    });

    it("should unassign task", async () => {
      // Create a task first
      const createResponse = await request(app)
        .post("/api/tasks")
        .send(testTask);

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/tasks/${taskId}/assign`)
        .send({ assigned_to: null })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.assigned_to).toBeNull();
    });

    it("should return 400 for non-existent user", async () => {
      // Create a task first
      const createResponse = await request(app)
        .post("/api/tasks")
        .send({ ...testTask, assigned_to: null });

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/tasks/${taskId}/assign`)
        .send({ assigned_to: 99999 })
        .expect(400);

      expect(response.body.error).toBe("User not found");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete task successfully", async () => {
      // Create a task first
      const createResponse = await request(app)
        .post("/api/tasks")
        .send(testTask);

      const taskId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(204);

      expect(response.body).toEqual({});
    });

    it("should return 404 for non-existent task", async () => {
      const response = await request(app)
        .delete("/api/tasks/99999")
        .expect(404);

      expect(response.body.error).toBe("Task not found");
    });
  });

  describe("GET /api/tasks/stats", () => {
    it("should get task statistics", async () => {
      const response = await request(app).get("/api/tasks/stats").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_tasks).toBeDefined();
      expect(response.body.data.todo_tasks).toBeDefined();
      expect(response.body.data.in_progress_tasks).toBeDefined();
      expect(response.body.data.done_tasks).toBeDefined();
    });
  });

  describe("GET /api/tasks/status/:status", () => {
    it("should get tasks by status", async () => {
      const response = await request(app)
        .get("/api/tasks/status/todo")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.status).toBe("todo");
    });

    it("should return 400 for invalid status", async () => {
      const response = await request(app)
        .get("/api/tasks/status/invalid")
        .expect(400);

      expect(response.body.error).toBe("Invalid status");
    });
  });

  describe("GET /api/tasks/overdue", () => {
    it("should get overdue tasks", async () => {
      const response = await request(app).get("/api/tasks/overdue").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.type).toBe("overdue");
    });
  });
});
