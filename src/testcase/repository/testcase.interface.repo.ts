import { TestCase } from "@shared/models/testcase.model";

export interface TestCaseDB {
  getTestCase(testCaseId: string): Promise<TestCase>;
  saveTestCase(testCase: TestCase): Promise<TestCase>;
}
