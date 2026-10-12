import test from "node:test";
import assert from "node:assert/strict";
import { calculateProgressPercentage } from "../lib/progress.js";

test("zero-chapter course has zero progress", () => assert.equal(calculateProgressPercentage(0, 0), 0));
test("progress percentage is calculated", () => assert.equal(calculateProgressPercentage(3, 4), 75));
test("progress is capped at 100", () => assert.equal(calculateProgressPercentage(5, 4), 100));
