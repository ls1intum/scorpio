import { settings } from "../config";
import { Exercise } from "./exercise_model";

export async function fetch_exercise(token:string, courseId: number): Promise<Exercise[]>{
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
