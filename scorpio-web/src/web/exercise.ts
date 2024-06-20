import { token } from "./authentication/authentication";
import { base_url } from "./config";

type Exercise = {
    type: string,
    id: number,
    title: string,
    shortName: string
    problemStatement: string,
}

export async function fetch_exercise(courseId: string): Promise<Exercise[]>{
	const url = `${base_url}/api/courses/${courseId}/programming-exercises`;

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

    console.log(`retrieved exercises successful ${data}`);
    return data as Exercise[];
}