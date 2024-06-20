import dotenv from "dotenv";
import path from "path";

// Parsing the env file.
dotenv.config();

console.log(`env: ${JSON.stringify(process.env)}`);

// export const base_url = process.env.BASE_URL || 'https://artemis-test9.artemis.cit.tum.de';
// export const testuser = process.env.TEST_USER || 'artemis_admin';
// export const testpassword = process.env.TEST_PASSWORD || '***REMOVED***';

export const base_url = process.env.BASE_URL || 'http://localhost:8080';
export const testuser = process.env.TEST_USER || 'artemis_admin';
export const testpassword = process.env.TEST_PASSWORD || 'artemis_admin';