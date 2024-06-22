import { settings_base_url } from "../config";

export async function authenticateCookie(username: string | undefined, password: string | undefined) {
	if (!username || !password) {
		throw new Error('Username and Password are required');
	}

	const url = `${settings_base_url}/api/public/authenticate`;

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

	console.log(JSON.stringify(response.headers))
}	

export async function authenticateToken(username: string | undefined, password: string | undefined) {
	if (!username || !password) {
		throw new Error('Username and Password are required');
	}

	const url = `${settings_base_url}/api/public/authenticate/token`;

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
	console.log(`response data: ${data}`);
	return data;
}	