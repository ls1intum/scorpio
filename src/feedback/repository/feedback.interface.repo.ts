import { Feedback } from "@shared/models/feedback.model";

export interface FeedbackDB {
  getFeedback(feedbackId: string): Promise<Feedback>;
  saveFeedback(feedback: Feedback): Promise<Feedback>;
}
