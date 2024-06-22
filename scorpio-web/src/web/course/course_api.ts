import { token } from "../authentication/authentication";
import { settings_base_url } from "../config";


type Course = {
    id: string;
    title: string;
    description: string;
    shortName: string;
}

export async function  fetch_courses(): Promise<Course[]> {
	const url = `${settings_base_url}/api/courses`;

    console.log("fetching courses");
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
    console.log(`retrieved courses successful ${data}`);
    return data as Course[];
}