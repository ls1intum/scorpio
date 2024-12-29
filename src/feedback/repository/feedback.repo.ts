import { Feedback } from "@shared/models/feedback.model";
import { FeedbackDB } from "./feedback.interface.repo";

class FeedbackDBKeyValue implements FeedbackDB {
  getFeedback(feedbackId: string): Promise<Feedback> {
    throw new Error("Method not implemented.");
  }

  saveFeedback(feedback: Feedback): Promise<Feedback> {
    throw new Error("Method not implemented.");
  }
}
