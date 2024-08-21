import { settings } from "../config";
import { Exercise } from "./exercise_model";

export async function fetch_exercise(token:string, courseId: string): Promise<Exercise[]>{
	const url = `${settings.base_url}/api/courses/${courseId}/programming-exercises`;

    console.log("fetching exercises");
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

export async function fetch_problem_statement(token:string, courseId: string, exerciseId: string){			
	const url = `${settings.base_url}/api/courses/${courseId}/exercises/${exerciseId}/problem-statement`;

    console.log("fetching problem statement");
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

    const data = await response.text();

    return data;
}