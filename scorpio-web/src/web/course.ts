import { token } from "./authentication/authentication";
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
	  const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: headers,
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status} message: ${errorText}`);
    }
        
    const data = await response.json();
    console.log(`retrieved courses successful ${data}`);
    return data as Course[];
}