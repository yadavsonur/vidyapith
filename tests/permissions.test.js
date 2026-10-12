import test from "node:test";
import assert from "node:assert/strict";
import { COURSE_PERMISSIONS, COURSE_ROLE_PERMISSIONS, isStaffRole } from "../lib/permissions.js";

test("RBAC identifies staff roles", () => {
  assert.equal(isStaffRole("TEACHER"), true);
  assert.equal(isStaffRole("ADMIN"), true);
  assert.equal(isStaffRole("STUDENT"), false);
});

test("owner has full course-management permissions", () => {
  assert.equal(COURSE_ROLE_PERMISSIONS.OWNER.has(COURSE_PERMISSIONS.EDIT_COURSE), true);
  assert.equal(COURSE_ROLE_PERMISSIONS.OWNER.has(COURSE_PERMISSIONS.MANAGE_INSTRUCTORS), true);
  assert.equal(COURSE_ROLE_PERMISSIONS.OWNER.has(COURSE_PERMISSIONS.DELETE_COURSE), true);
});

test("instructor cannot change course settings or delete", () => {
  assert.equal(COURSE_ROLE_PERMISSIONS.INSTRUCTOR.has(COURSE_PERMISSIONS.MANAGE_CONTENT), true);
  assert.equal(COURSE_ROLE_PERMISSIONS.INSTRUCTOR.has(COURSE_PERMISSIONS.EDIT_COURSE), false);
  assert.equal(COURSE_ROLE_PERMISSIONS.INSTRUCTOR.has(COURSE_PERMISSIONS.DELETE_COURSE), false);
});
