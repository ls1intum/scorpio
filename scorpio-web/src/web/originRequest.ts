import { base_url } from "./config";

export async function getOrigin() {
	const url = `${base_url}/api/public/origin`;

    return fetch(url, {
        method: 'GET',
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
        }
        return response.text();
    });
}