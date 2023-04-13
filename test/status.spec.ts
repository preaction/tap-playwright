
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
  let 
  lines = result.split("\n"),
  expectedLines = [
    // XXX: diagnostics
    "1..12",
    /^ok 1 - project   a\.test\.ts  should pass \(\d+\.\d{2}s\)/,
    /^not ok 2 - project   a\.test\.ts  should fail \(\d+\.\d{2}s\)/,
    // XXX: diagnostics
    /^not ok 3 - project   a\.test\.ts  should break \(\d+\.\d{2}s\)/,
    // XXX: diagnostics
    /^ok 4 - project   a\.test\.ts  should skip \(\d+\.\d{2}s\) # SKIP for reasons/,
    /^ok 5 - project   a\.test\.ts  should fixme \(\d+\.\d{2}s\) # SKIP/,
    /^ok 6 - project   a\.test\.ts  should expect fail \(\d+\.\d{2}s\)/,
    /^ok 7 - project2  a\.test\.ts  should pass \(\d+\.\d{2}s\)/,
    /^not ok 8 - project2  a\.test\.ts  should fail \(\d+\.\d{2}s\)/,
    /^not ok 9 - project2  a\.test\.ts  should break \(\d+\.\d{2}s\)/,
    /^ok 10 - project2  a\.test\.ts  should skip \(\d+\.\d{2}s\) # SKIP for reasons/,
    /^ok 11 - project2  a\.test\.ts  should fixme \(\d+\.\d{2}s\) # SKIP/,
    /^ok 12 - project2  a\.test\.ts  should expect fail \(\d+\.\d{2}s\)/,
    "", // Final newline
  ];
  
  lines.map((line, i) => {
    expect(line).toMatch(expectedLines[i])
  })
});
