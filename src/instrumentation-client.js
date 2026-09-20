import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    { path: "/api/submissions", method: "POST" },
    { path: "/api/applications", method: "POST" },
    { path: "/api/newsletter", method: "POST" },
    { path: "/api/auth/login", method: "POST" },
    { path: "/api/auth/forgot-password", method: "POST" },
    { path: "/api/auth/reset-password", method: "POST" },
    { path: "/api/portal/auth/login", method: "POST" },
    { path: "/api/portal/auth/register", method: "POST" },
    { path: "/api/portal/password", method: "PUT" },
  ],
});
