import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN } = process.env;
const { CLIENT_ID } = process.env;
const { GUILD_ID } = process.env;
const { API_KEY } = process.env;
const { API_KEY_V2 } = process.env;

if (!DISCORD_TOKEN) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  CLIENT_ID,
  GUILD_ID,
  API_KEY,
  API_KEY_V2,
};
