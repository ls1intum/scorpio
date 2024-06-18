import {base_url} from './config';

export var token:string;

export async function authenticateCookie(username: string, password: string) {
	const url = `${base_url}/api/public/authenticate`;

	  fetch(url, {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({
		  "username": username,
		  "password": password,
		  "rememberMe": true
		})
		}).then((response) => {		
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status} message: ${response.body}`);
			}

		})
}	

export async function authenticateToken(username: string, password: string) {
	const url = `${base_url}/api/public/authenticate/token`;

	  fetch(url, {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({
		  "username": username,
		  "password": password,
		  "rememberMe": true
		})
		}).then((response) => {		
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status} message: ${response.body}`);
			}
			
			return response.text()
		}).then((data) => {
			console.log(`response data: ${data}`);
			token = data;
		})
}		