import fs from "node:fs";
import path from "node:path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import * as dotenv from "dotenv";
dotenv.config();

const guildId = process.env.DISCORD_GUILD_ID || "No guild Id";
const clientId = process.env.DISCORD_APPLICATION_ID || "No client Id";
const applicationToken = process.env.DISCORD_LOGIN || "No token";

const commands = [];
const dirPath = process.env.DISCORD_DIRECTORY_PATH || "Path not given";
const commandsPath = path.join(dirPath, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file: string) => file.endsWith(".tsx"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(applicationToken);

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() =>
    console.log(
      "Successfully registered application commands to guild for development."
    )
  )
  .catch(console.error);
