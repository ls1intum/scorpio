import { Exercise } from "./exercise.model";

export class Course {
  public id?: number;
  public title?: string;
  public description?: string;
  public shortName?: string;
  public startDate?: Date;
  public endDate?: Date;
  public semester?: string;
  public testCourse?: boolean;

  public presentationScore?: number;
  public maxComplaints?: number;
  public maxTeamComplaints?: number;
  public maxComplaintTimeDays?: number;
  public maxComplaintTextLimit?: number;
  public maxComplaintResponseTextLimit?: number;
  public complaintsEnabled?: boolean;
  public requestMoreFeedbackEnabled?: boolean;
  public maxRequestMoreFeedbackTimeDays?: number;
  public maxPoints?: number;
  public accuracyOfScores?: number;

  // the following values are only used in course administration
  public numberOfStudents?: number;
  public numberOfTeachingAssistants?: number;
  public numberOfEditors?: number;
  public numberOfInstructors?: number;

  public exercises?: Exercise[];

  // helper attributes
  public relativeScore?: number;
  public absoluteScore?: number;
  public maxScore?: number;

  constructor() {}
}
