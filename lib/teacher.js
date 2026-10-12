// Compatibility helper for any external code that may still import this file.
// Runtime authorization is implemented in lib/auth.js and stored in the database.
export const isTeacher = (role) => role === "TEACHER" || role === "ADMIN";
