import { Result } from "@shared/models/result.model";
import { ResultDB } from "./result.interface.repo";

class ResultDBKeyValue implements ResultDB {
  getResult(resultId: string): Promise<Result> {
    throw new Error("Method not implemented.");
  }

  saveResult(result: Result): Promise<Result> {
    throw new Error("Method not implemented.");
  }
}
