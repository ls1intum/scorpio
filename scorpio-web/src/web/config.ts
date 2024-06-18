import dotenv from "dotenv";

// Parsing the env file.
dotenv.config();

export const base_url = process.env.BASE_URL || "http://localhost:8080";
export const testuser = process.env.TEST_USER || "artemis_admin";
export const testpassword = process.env.TEST_PASSWORD || "artemis_admin";