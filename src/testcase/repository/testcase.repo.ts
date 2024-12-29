import { TestCase } from "@shared/models/testcase.model";
import { TestCaseDB } from "./testcase.interface.repo";

class TestCaseDBKeyValue implements TestCaseDB {
  getTestCase(testCaseId: string): Promise<TestCase> {
    throw new Error("Method not implemented.");
  }

  saveTestCase(testCase: TestCase): Promise<TestCase> {
    throw new Error("Method not implemented.");
}
}
