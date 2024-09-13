import { settings } from "../config";
import { Participation } from "./participation.model";

export async function start_exercise(token:string, exerciseId: number): Promise<Participation>{
    const url = `${settings.base_url}/api/exercises/${exerciseId}/participations`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
    }

    const data = await response.json();

    return data as Participation;
}

export async function fetch_latest_participation(token:string, exerciseId: number): Promise<Participation>{
    const url = `${settings.base_url}/api/exercises/${exerciseId}/participation`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} message: ${response.text}`);
    }

    const data = await response.json();

    return data as Participation;
}


