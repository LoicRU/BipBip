import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import authMiddleware from "../src/middleware/auth.middleware.js";
import { errorMiddleware } from "../src/middleware/error.js";
import requireRole from "../src/middleware/role.middleware.js";
import { validate } from "../src/middleware/validate.js";
import validateBody from "../src/middleware/validate.middleware.js";
import { AppError } from "../src/utils/error.js";
import { generateToken } from "../src/utils/jwt.js";

function createJsonResponseDouble() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  return res;
}

describe("authMiddleware", () => {
  it("rejects requests without bearer token", () => {
    const req = { headers: {} };
    const res = createJsonResponseDouble();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects invalid tokens", () => {
    const req = {
      headers: {
        authorization: "Bearer invalid-token",
      },
    };
    const res = createJsonResponseDouble();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches decoded user on valid token", () => {
    const token = generateToken({
      id: 42,
      email: "admin@test.com",
      role: { name: "admin" },
    });
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const res = createJsonResponseDouble();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({
      userId: 42,
      email: "admin@test.com",
      role: "admin",
    });
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("requireRole", () => {
  it("rejects when no authenticated user is present", () => {
    const middleware = requireRole("admin");
    const req = {};
    const res = createJsonResponseDouble();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects users with a different role", () => {
    const middleware = requireRole("admin");
    const req = { user: { role: "user" } };
    const res = createJsonResponseDouble();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
    expect(next).not.toHaveBeenCalled();
  });

  it("allows users with the expected role", () => {
    const middleware = requireRole("admin");
    const req = { user: { role: "admin" } };
    const res = createJsonResponseDouble();
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("validate", () => {
  it("stores parsed query and params values", () => {
    const middleware = validate({
      query: z.object({
        page: z.coerce.number().int().min(1),
      }),
      params: z.object({
        id: z.string().trim().min(1),
      }),
    });
    const req = {
      query: { page: "2" },
      params: { id: "job-1" },
    };
    const next = vi.fn();

    middleware(req, {}, next);

    expect(req.validatedQuery).toEqual({ page: 2 });
    expect(req.validatedParams).toEqual({ id: "job-1" });
    expect(next).toHaveBeenCalledWith();
  });

  it("converts zod errors into AppError instances", () => {
    const middleware = validate({
      query: z.object({
        page: z.coerce.number().int().min(1),
      }),
    });
    const req = {
      query: { page: "0" },
      params: {},
    };
    const next = vi.fn();

    middleware(req, {}, next);

    const [error] = next.mock.calls[0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Validation error");
    expect(error.details.issues).toEqual([
      {
        field: "page",
        message: "Number must be greater than or equal to 1",
      },
    ]);
  });

  it("passes non-zod errors through next", () => {
    const expectedError = new Error("boom");
    const middleware = validate({
      query: {
        parse() {
          throw expectedError;
        },
      },
    });
    const next = vi.fn();

    middleware({ query: {} }, {}, next);

    expect(next).toHaveBeenCalledWith(expectedError);
  });
});

describe("validateBody", () => {
  it("stores the parsed request body", () => {
    const middleware = validateBody(
      z.object({
        email: z.string().email(),
      })
    );
    const req = {
      body: {
        email: "test@example.com",
      },
    };
    const res = createJsonResponseDouble();
    const next = vi.fn();

    middleware(req, res, next);

    expect(req.validatedBody).toEqual({ email: "test@example.com" });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns a 400 response on invalid body", () => {
    const middleware = validateBody(
      z.object({
        email: z.string().email(),
      })
    );
    const req = {
      body: {
        email: "not-an-email",
      },
    };
    const res = createJsonResponseDouble();
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Validation error",
      details: expect.any(Array),
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("errorMiddleware", () => {
  it("formats AppError instances into standardized payloads", () => {
    const res = createJsonResponseDouble();

    errorMiddleware(
      new AppError(422, "Invalid payload", { field: "email" }),
      {},
      res,
      vi.fn()
    );

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: "Invalid payload",
        details: { field: "email" },
      },
    });
  });

  it("falls back to a 500 response for generic errors", () => {
    const res = createJsonResponseDouble();

    errorMiddleware(new Error(), {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        message: "Internal server error",
        details: undefined,
      },
    });
  });
});
