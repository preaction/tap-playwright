
import { FullConfig, TestStatus } from "@playwright/test";
import { Reporter, Suite, TestCase, TestResult, TestError, TestStep } from "@playwright/test/reporter";

class TapReporter implements Reporter {
  suite!: Suite;
  tests!: Array<TestCase>;
  testOutput!: { [index: number]: string };
  verbose!: boolean;

  printsToStdio():boolean { return true }

  onBegin(config: FullConfig, suite: Suite): void {
    this.suite = suite;
    this.tests = suite.allTests();
    this.testOutput = {};
    this.verbose = !!process.env.TEST_VERBOSE;

    // Write test plan line
    // Use console.log directly to skip TAP commenting
    console.log(`${1}..${this.tests.length}`);
  }

  onEnd():void {
    // XXX: If not running under a harness, write out a summary
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // XXX: Delay output to re-order tests run in parallel?
    let ok = ["expected", "skipped"].indexOf(test.outcome()) >= 0 ? "ok" : "not ok",
      idx = this.tests.indexOf( test ) + 1;
    let title = test.title;
    if ( test.outcome() === "skipped" ) {
      let anno = test.annotations.find( a => a.type == "skip" || a.type == "fixme" );
      title += " # SKIP" + ( anno && anno.description ? ` ${anno.description}` : "" );
    }
    // Use console.log directly to skip TAP commenting
    console.log(`${ok} ${idx} - ${title}`);
    if ( result.error ) {
      const err = result.error;
      if ( err.value ) {
        this.write( 'error', `[${idx}]`, err.value );
      }
      else if ( err.stack ) {
        // Remove last three lines of stack trace, since it is always in
        // Playwright's worker runner
        let stack = err.stack.split(/\n/).slice(0,-3).join("\n");
        this.write( 'error', `[${idx}]`, stack );
      }
      else {
        this.write( 'error', `[${idx}]`, err.message || 'Unknown error' );
      }
      if ( !this.verbose && this.testOutput[idx]) {
        this.write( 'log', `[${idx}]`, "Output: \n" + this.testOutput[idx] );
      }
    }
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep) {
    const idx = this.tests.indexOf( test ) + 1;
    // XXX: Delay output to re-order tests run in parallel?
    // When a step has an error, Playwright unwinds the step stack and
    // calls the onStepEnd method. One of the steps is an "expect" step,
    // which means playwright has to be instrumenting expect() somehow.
    // Maybe I can do the same to get a better assertion library working
    // with this reporter...
    if ( step.error ) {
      this.write( 'error', `[${idx}]`, `In step ${step.title}` );
    }
  }

  write( dest:'log'|'error', prefix: string, text: string|Buffer ) {
    if ( text instanceof Buffer ) {
      text = text.toString();
    }
    console[dest]( `#${prefix} ${text.replace(/\n+$/,"").replace(/\n/g,`\n#${prefix} `)}` );
  }

  onStdOut( chunk: string|Buffer, test: void|TestCase, result: void|TestResult ) {
    const idx = test ? this.tests.indexOf( test ) + 1 : 0;
    if ( this.verbose ) {
      // Prefix with test number to help unravel parallel test output
      this.write( 'log', `[${idx}]`, chunk );
    }
    else {
      this.testOutput[idx] ||= '';
      this.testOutput[idx] += chunk;
    }
  }
  onStdErr( chunk: string|Buffer, test: void|TestCase, result: void|TestResult ) {
    const idx = test ? this.tests.indexOf( test ) + 1 : 0;
    // Prefix with test number to help unravel parallel test output
    // XXX: Change color for STDERR?
    if ( this.verbose ) {
      this.write( 'error', `[${idx}]`, chunk );
    }
    else {
      this.testOutput[idx] ||= '';
      this.testOutput[idx] += chunk;
    }
  }

}

export default TapReporter;
