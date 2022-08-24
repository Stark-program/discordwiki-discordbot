import fs from "node:fs";
import path from "node:path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import * as dotenv from "dotenv";
dotenv.config();

const commands = [];
const dirPath = process.env.DISCORD_DIRECTORY_PATH || "Path not given";
const commandsPath = path.join(dirPath, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file: string) => file.endsWith(".tsx"));

// Place your client id here
const clientId = process.env.DISCORD_APPLICATION_ID!;
const applicationToken = process.env.DISCORD_LOGIN!;

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(applicationToken);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
