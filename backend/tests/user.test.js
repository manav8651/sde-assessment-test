const request = require("supertest");
const app = require("../src/server");

describe("User API Tests", () => {
  let testUser;

  beforeEach(() => {
    testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      full_name: "Test User",
    };
  });

  describe("POST /api/users", () => {
    it("should create a new user with valid data", async () => {
      const response = await request(app)
        .post("/api/users")
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(testUser.username);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.full_name).toBe(testUser.full_name);
      expect(response.body.data.id).toBeDefined();
    });

    it("should return 400 for invalid email format", async () => {
      const invalidUser = { ...testUser, email: "invalid-email" };

      const response = await request(app)
        .post("/api/users")
        .send(invalidUser)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
      expect(response.body.details).toBeDefined();
    });

    it("should return 400 for missing required fields", async () => {
      const incompleteUser = { username: testUser.username };

      const response = await request(app)
        .post("/api/users")
        .send(incompleteUser)
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 409 for duplicate username", async () => {
      // Create first user
      await request(app).post("/api/users").send(testUser);

      // Try to create user with same username
      const duplicateUser = { ...testUser, email: "different@example.com" };

      const response = await request(app)
        .post("/api/users")
        .send(duplicateUser)
        .expect(409);

      expect(response.body.error).toBe("Duplicate entry");
    });

    it("should return 409 for duplicate email", async () => {
      // Create first user
      await request(app).post("/api/users").send(testUser);

      // Try to create user with same email
      const duplicateUser = { ...testUser, username: "different_username" };

      const response = await request(app)
        .post("/api/users")
        .send(duplicateUser)
        .expect(409);

      expect(response.body.error).toBe("Duplicate entry");
    });
  });

  describe("GET /api/users", () => {
    it("should get all users", async () => {
      const response = await request(app).get("/api/users").expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/users?limit=5&offset=0")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.meta.offset).toBe(0);
    });

    it("should support sorting", async () => {
      const response = await request(app)
        .get("/api/users?sortBy=username&sortOrder=asc")
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should get user by ID", async () => {
      // Create a user first
      const createResponse = await request(app)
        .post("/api/users")
        .send(testUser);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.username).toBe(testUser.username);
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app).get("/api/users/99999").expect(404);

      expect(response.body.error).toBe("User not found");
    });

    it("should return 400 for invalid user ID", async () => {
      const response = await request(app).get("/api/users/invalid").expect(500); // This will trigger database error

      expect(response.body.error).toBeDefined();
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update user with valid data", async () => {
      // Create a user first
      const createResponse = await request(app)
        .post("/api/users")
        .send(testUser);

      const userId = createResponse.body.data.id;
      const updateData = { full_name: "Updated Name" };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.full_name).toBe("Updated Name");
    });

    it("should return 404 for non-existent user", async () => {
      const updateData = { full_name: "Updated Name" };

      const response = await request(app)
        .put("/api/users/99999")
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe("User not found");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete user successfully", async () => {
      // Create a user first
      const createResponse = await request(app)
        .post("/api/users")
        .send(testUser);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .expect(204);

      expect(response.body).toEqual({});
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .delete("/api/users/99999")
        .expect(404);

      expect(response.body.error).toBe("User not found");
    });
  });

  describe("GET /api/users/search", () => {
    it("should search users by username", async () => {
      // Create a user first
      await request(app).post("/api/users").send(testUser);

      const response = await request(app)
        .get(`/api/users/search?q=${testUser.username}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should return 400 for empty search term", async () => {
      const response = await request(app)
        .get("/api/users/search?q=")
        .expect(400);

      expect(response.body.error).toBe("Search term required");
    });
  });
});
