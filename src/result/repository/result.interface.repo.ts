import { Result } from "@shared/models/result.model";

export interface ResultDB {
  getResult(resultId: string): Promise<Result>;
  saveResult(result: Result): Promise<Result>;
}
