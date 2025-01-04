import { Course } from "@shared/models/course.model";

export interface CourseDB {
    getCourse(courseId: string): Promise<Course>;
    saveCourse(course: Course): Promise<Course>;
}