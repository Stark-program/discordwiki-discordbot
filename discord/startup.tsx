import {discordLogin} from "./bot" 
import {expressServer} from "./data/index"
const bot = discordLogin()
const server = expressServer()