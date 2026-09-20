import test from "node:test";
import assert from "node:assert/strict";
import { normaliseAdminUser, publicAdminUser } from "../src/lib/admin-users.js";

test("admin users are normalised and private fields are never exposed", () => {
  const input = normaliseAdminUser(
    {
      name: "  Site Admin ",
      email: " ADMIN@Example.com ",
      password: "long-password",
      confirmPassword: "long-password",
      active: true,
    },
    { creating: true },
  );
  assert.deepEqual(input, {
    name: "Site Admin",
    email: "admin@example.com",
    password: "long-password",
    active: true,
  });
  assert.deepEqual(
    publicAdminUser({ _id: "abc", ...input, passwordHash: "private", role: "admin" }),
    {
      id: "abc",
      name: "Site Admin",
      email: "admin@example.com",
      role: "admin",
      active: true,
      createdAt: undefined,
      updatedAt: undefined,
    },
  );
});

test("new admins require valid details and a ten-character password", () => {
  assert.throws(
    () =>
      normaliseAdminUser(
        {
          name: "",
          email: "admin@example.com",
          password: "long-password",
          confirmPassword: "long-password",
        },
        { creating: true },
      ),
    /Name is required/,
  );
  assert.throws(
    () =>
      normaliseAdminUser(
        {
          name: "Admin",
          email: "invalid",
          password: "long-password",
          confirmPassword: "long-password",
        },
        { creating: true },
      ),
    /valid email/,
  );
  assert.throws(
    () =>
      normaliseAdminUser(
        { name: "Admin", email: "admin@example.com", password: "short", confirmPassword: "short" },
        { creating: true },
      ),
    /at least 10/,
  );
  assert.throws(
    () =>
      normaliseAdminUser(
        {
          name: "Admin",
          email: "admin@example.com",
          password: "long-password",
          confirmPassword: "different-password",
        },
        { creating: true },
      ),
    /do not match/,
  );
});

test("editing an admin can retain their existing password", () => {
  assert.deepEqual(
    normaliseAdminUser({ name: "Admin", email: "admin@example.com", password: "", active: false }),
    { name: "Admin", email: "admin@example.com", active: false },
  );
});

test("editing an admin requires confirmation when changing the password", () => {
  assert.throws(
    () =>
      normaliseAdminUser({
        name: "Admin",
        email: "admin@example.com",
        password: "new-password",
        confirmPassword: "different-password",
      }),
    /do not match/,
  );
  assert.equal(
    normaliseAdminUser({
      name: "Admin",
      email: "admin@example.com",
      password: "new-password",
      confirmPassword: "new-password",
    }).password,
    "new-password",
  );
});
