import { base_url } from "../config";

export async function authenticateCookie(username: string, password: string) {
	const url = `${base_url}/api/public/authenticate`;

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
}	

export async function authenticateToken(username: string, password: string) {
	const url = `${base_url}/api/public/authenticate/token`;

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