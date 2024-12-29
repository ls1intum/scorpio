import { Course } from "@shared/models/course.model";
import { CourseDB } from "./course.interface.repo";

class CourseDBKeyValue implements CourseDB {
  getCourse(courseId: string): Promise<Course> {
    throw new Error("Method not implemented.");
  }

  saveCourse(course: Course): Promise<Course> {
    throw new Error("Method not implemented.");
  }
}
