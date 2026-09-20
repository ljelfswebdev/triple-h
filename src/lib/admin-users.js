import { RequestError } from "./request-security.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value) => (typeof value === "string" ? value.trim() : "");

export function normaliseAdminUser(input, { creating = false } = {}) {
  const name = clean(input?.name);
  const email = clean(input?.email).toLowerCase();
  const password = typeof input?.password === "string" ? input.password : "";
  const confirmPassword = typeof input?.confirmPassword === "string" ? input.confirmPassword : "";

  if (!name) throw new RequestError("Name is required");
  if (name.length > 120) throw new RequestError("Name must be 120 characters or fewer");
  if (email.length > 254) throw new RequestError("Email address is too long");
  if (password.length > 128) throw new RequestError("Password must be 128 characters or fewer");
  if (!emailPattern.test(email)) throw new RequestError("Enter a valid email address");
  if ((creating || password) && password.length < 10) {
    throw new RequestError("Password must be at least 10 characters");
  }
  if ((creating || password) && password !== confirmPassword) {
    throw new RequestError("Passwords do not match");
  }

  return {
    name,
    email,
    active: input?.active !== false,
    ...(password ? { password } : {}),
  };
}

export function publicAdminUser(user) {
  const source = user.toObject ? user.toObject() : user;
  return {
    id: String(source._id || source.id),
    name: source.name,
    email: source.email,
    role: source.role,
    active: source.active !== false,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}
