import { settings } from "../config";
import { Course } from "./course.model";

export async function  fetch_course_by_courseId(token:string, courseId: number): Promise<Course> {
	const url = `${settings.base_url}/api/courses/${courseId}`;

	  const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status} message: ${errorText}`);
    }
        
    const data = await response.json();
    return data as Course;
}

export async function  fetch_all_courses(token:string): Promise<Course[]> {
	const url = `${settings.base_url}/api/courses`;

	  const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status} message: ${errorText}`);
    }
        
    const data = await response.json();
    return data as Course[];
}