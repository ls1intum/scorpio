import { settings } from "../config";
import { Course } from "../course/course.model";
import { Exercise } from "./exercise.model";

export async function fetch_exercise_by_exerciseId(token:string, exerciseId: number): Promise<Exercise>{
	const url = `${settings.base_url}/api/exercises/${exerciseId}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
    }

    const data = await response.json();

    return data as Exercise;
}

export async function fetch_programming_exercises_by_courseId(token:string, courseId: number): Promise<Exercise[]>{
	const url = `${settings.base_url}/api/courses/${courseId}/programming-exercises`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
    }

    const data = await response.json();

    return data as Exercise[];
}

export async function fetch_course_exercise_projectKey(token:string, projectKey: string): Promise<{course: Course, exercise: Exercise}>{
	const url = `${settings.base_url}/api/programming-exercises/project-key/${projectKey}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
    }

    const data: {[key: string]: any} = await response.json();

    return {course: data.course as Course, exercise: data as Exercise};
}
