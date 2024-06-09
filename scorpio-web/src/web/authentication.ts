import { base_url } from './config';

export async function authenticate(username: string, password: string) {
	const url = `${base_url}/public/authenticate`;
  
	try{
	  let response = await fetch(url, {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({
		  "username": username,
		  "password": password,
		  "rememberMe": true
		})
		}); 
  
	  console.log(`response: ${response.status}`);
  
	  const data = await response.json();
	  console.log(`data: ${data}`);
  
	} catch (e) {
	  if (typeof e === "string") {
		console.log(e)
	  } else if (e instanceof Error) {
		  console.log(e.message)
	  }
	  console.log(`${e}`)
	}
}