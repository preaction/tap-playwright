
import { FullConfig, TestStatus } from "@playwright/test";
import { Reporter, Suite, TestCase, TestResult } from "@playwright/test/reporter";

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
  }
}

export default TapReporter;
