
import { test, expect } from "./fixtures";

test("should report test status", async ({ runInlineTest }) => {
  const result = await runInlineTest(
    {
      "a.test.ts": `
      import { test, expect } from '@playwright/test';
      test('should pass', async ({}) => {
      });
      test('should fail', async ({}) => {
        expect(true).toBe(false);
      });
      test('should break', async ({}) => {
        test.setTimeout(1);
        await new Promise(() => {});
      });
      test('should skip', async ({}) => {
        test.skip(true, 'for reasons');
      });
      test('should fixme', async ({}) => {
        test.fixme(true);
      });
      test('should expect fail', async ({}) => {
        test.fail(true);
        expect(true).toBe(false);
      });
    `,
    },
  );
  let lines = result.split("\n");
  expect(lines).toEqual([
    "1..6",
    "ok 1 - should pass",
    "not ok 2 - should fail",
    // XXX: diagnostics
    "not ok 3 - should break",
    // XXX: diagnostics
    "ok 4 - should skip # SKIP for reasons",
    "ok 5 - should fixme # SKIP",
    "ok 6 - should expect fail",
    "", // Final newline
  ]);
});
