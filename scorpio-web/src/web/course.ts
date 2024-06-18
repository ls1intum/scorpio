import { token } from "./authentication";
import { base_url } from "./config";


type Course = {
    id: string;
    title: string;
    description: string;
    shortName: string;
}

export async function  fetch_courses(): Promise<Course[]> {
	const url = `${base_url}/api/courses`;

    const headers = {
        'Content-Type': 'application/json',
        'Cookie': `jwt=${token}`,
    }

    console.log("fetching courses");
	  return fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: headers,
    }).then((response) => {
        if (!response.ok) {
            response.text().then((text) => {
                throw new Error(`HTTP error! status: ${response.status} message: ${text}`);
            });
        }
        
        return response.json();
    }).then((data) => {
        console.log(`retrieved courses successful ${data}`);
        return data as Course[];
    })
}