import { token } from "./authentication/authentication";
import { base_url } from "./config";

export async function getTest() {
	const url = `${base_url}/api/public/headers`;
    const headers = new Headers(
        {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    );

    const response = await fetch(url, {
        method: 'GET',
        headers: headers
    })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
        }

        return await response.text();
}