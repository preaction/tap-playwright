
# Test-Anything Protocol (TAP) Reporter for Playwright

## Getting Started

First, install the module.

    $ npm install --save-dev @preactionme/tap-playwright

Then, configure Playwright to use the module as its reporter by editing
the `playwright.config.ts` file:

    // playwright.config.ts
    import { PlaywrightTestConfig } from '@playwright/test';
    const config: PlaywrightTestConfig = {
      reporter: '@preactionme/tap-playwright',
    };
    export default config;

Then, run your tests!

## Executing Tests / Running Under `prove`

To run under the `prove` test harness, add the following line as the
very first line of the file:

    #!/usr/bin/env -S npx playwright test

## Tests Not Running?

Playwright by default only runs tests in files matching
`.*(test|spec)\.(js|ts|mjs)`. Either rename your test, or add a 
[`testMatch` config to your config
file](https://playwright.dev/docs/api/class-testconfig#test-config-test-match).

## Environment Variables

### TEST_VERBOSE

If this variable is set, all output from the test written to `STDOUT` will be shown.
By default, only output written to `STDERR` is displayed.

