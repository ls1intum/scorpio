import { settings } from "../config";

export async function authenticateToken(username: string | undefined, password: string | undefined) {
	if (!username || !password) {
		throw new Error('Username and Password are required');
	}

	var url = new URL(`${settings.base_url}/api/public/authenticate`);
	url.searchParams.append('as-bearer', 'true');

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			"username": username,
			"password": password,
			"rememberMe": true
		})
	})

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status} message: ${response.body}`);
	}
	
	const data = await response.text()
	return data;
}	