import { discordLogin } from "./bot";
import { expressServer } from "../api/index";
const bot = discordLogin();
const server = expressServer();
