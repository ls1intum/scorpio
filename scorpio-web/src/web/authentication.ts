import axios from 'axios';
import { base_url } from './config';

export async function authenticate(username: string, password: string) {
    const url = `${base_url}/public/authenticate`;
    axios.post(url, {
        "username": username,
        "password": password,
        "rememberMe": true
    }
    ).then(response => {
        console.log('Response data:', response.data);
      })
      .catch(error => {
        console.error('There was an error!', error.message);
      });
}