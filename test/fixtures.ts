 
import { test as base, TestInfo } from "@playwright/test";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export { expect } from "@playwright/test";

async function writeFiles(testInfo: TestInfo, files: Files) {
  const baseDir = testInfo.outputPath();

  const hasConfig = Object.keys(files).some((name) => name.includes(".config."));
  if (!hasConfig) {
    files = {
      ...files,
      "playwright.config.ts": `
        module.exports = { projects: [ { name: 'project' }, { name: 'project2' } ] };
      `,
    };
  }

  await Promise.all(
    Object.keys(files).map(async (name) => {
      const fullName = path.join(baseDir, name);
      await fs.promises.mkdir(path.dirname(fullName), { recursive: true });
      await fs.promises.writeFile(fullName, files[name]);
    }),
  );

  return baseDir;
}

async function runPlaywrightTest(
  baseDir: string,
  params: any,
  env: NodeJS.ProcessEnv,
): Promise<RunResult> {
  const paramList = [];
  let additionalArgs = "";
  for (const key of Object.keys(params)) {
    if (key === "args") {
      additionalArgs = params[key];
      continue;
    }
    for (const value of Array.isArray(params[key]) ? params[key] : [params[key]]) {
      const k = key.startsWith("-") ? key : "--" + key;
      paramList.push(params[key] === true ? `${k}` : `${k}=${value}`);
    }
  }
  const args = [require.resolve("@playwright/test/cli"), "test"];
  args.push(
    "--reporter=" + require.resolve("../dist/index.js"),
    "--workers=1",
    ...paramList,
  );
  if (additionalArgs) args.push(...additionalArgs);
  const testProcess = spawn("node", args, {
    env: {
      ...process.env,
      ...env,
    },
    cwd: baseDir,
  });
  let output = "";
  testProcess.stdout.on("data", (chunk) => {
    output += String(chunk);
    if (process.env.PW_RUNNER_DEBUG) process.stdout.write(String(chunk));
  });
  testProcess.stderr.on("data", (chunk) => {
    if (process.env.PW_RUNNER_DEBUG) process.stderr.write(String(chunk));
  });
  await new Promise<number>((x) => testProcess.on("close", x));
  return output.toString();
}

type Fixtures = {
  runInlineTest: (
    files: Files,
    params?: Params,
    env?: Env,
  ) => Promise<RunResult>;
};

export const test = base.extend<Fixtures>({
  // @ts-ignore
  runInlineTest: async ({}, use, testInfo: TestInfo) => {
    let runResult: RunResult | undefined;
    await use(
      // @ts-ignore
      async (files: Files, params: Params = {}, env: NodeJS.ProcessEnv = {}) => {
        const baseDir = await writeFiles(testInfo, files);
        runResult = await runPlaywrightTest(baseDir, params, env);
        return runResult;
      },
    );
    if (testInfo.status !== testInfo.expectedStatus && runResult && !process.env.PW_RUNNER_DEBUG) {
      console.log(runResult.output);
    }
  },
});
