import { token } from "./authentication";
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
    return fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Cookie': `jwt=${token}`,
        },
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
        }
        return response.json();
    }).then((data) => {
        console.log(`retrieved exercises successful ${data}`);
        return data as Exercise[];
    })
}