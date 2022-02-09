
import { FullConfig, TestStatus } from "@playwright/test";
import { Reporter, Suite, TestCase, TestResult, TestError } from "@playwright/test/reporter";

class TapReporter implements Reporter {
  suite!: Suite;
  tests!: Array<TestCase>;

  printsToStdio():boolean { return true }

  onBegin(config: FullConfig, suite: Suite): void {
    this.suite = suite;
    this.tests = suite.allTests();

    // Write test plan line
    console.log(`${1}..${this.tests.length}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    let ok = ["expected", "skipped"].indexOf(test.outcome()) >= 0 ? "ok" : "not ok",
      idx = this.tests.indexOf( test ) + 1;
    let title = test.title;
    if ( test.outcome() === "skipped" ) {
      let anno = test.annotations.find( a => a.type == "skip" || a.type == "fixme" );
      title += " # SKIP" + ( anno && anno.description ? ` ${anno.description}` : "" );
    }
    console.log(`${ok} ${idx} - ${title}`);
    if ( result.error ) {
      this.onError( result.error );
    }
  }

  onStdOut( chunk: string|Buffer, test: void|TestCase, result: void|TestResult ) {
    if ( !!process.env.TEST_VERBOSE ) {
      this.writeOut( chunk );
    }
  }
  onStdErr( chunk: string|Buffer, test: void|TestCase, result: void|TestResult ) {
    this.writeErr( chunk );
  }
  onError( err:TestError ) {
    if ( err.value ) {
      this.writeErr( `ERROR: ${err.value}` );
    }
    else if ( err.stack ) {
      // Remove last three lines of stack trace, since it is always in
      // Playwright's worker runner
      let stack = err.stack.split(/\n/).slice(0,-3).join("\n");
      this.writeErr( `ERROR: ${stack}` );
    }
    else {
      this.writeErr( `ERROR: ${err.message}` );
    }
  }

  writeOut( text:string|Buffer ) {
    if ( text instanceof Buffer ) {
      text = text.toString();
    }
    console.log( `# ${text.replace(/\n+$/,"").replace(/\n/g, "\n# ")}` );
  }
  writeErr( text:string|Buffer ) {
    if ( text instanceof Buffer ) {
      text = text.toString();
    }
    console.error( `# ${text.replace(/\n+$/,"").replace(/\n/g, "\n# ")}` );
  }
}

export default TapReporter;
