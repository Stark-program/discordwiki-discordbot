import { PrismaClient } from "@prisma/client";
import express from "express";
import { DiscordGuild, Channel, Message } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));




interface interactionType {
  [key: string]: any;
}

app.post("/data", async (req: interactionType, res: any) => {
  let data = req.body;
  data.forEach(async (msg: interactionType) => {
    try {
      const newGuild: DiscordGuild = await prisma.discordGuild.upsert({
        where: {
          Id: msg.guild.id,
        },
        update: {},
        create: {
          Id: msg.guild.id,
          guildName: msg.guild.name,
        },
      });
      const newChannel: Channel = await prisma.channel.upsert({
        where: {
          Id: msg.channel.id,
        },
        update: {
          channelName: msg.channel.channelName,
        },
        create: {
          Id: msg.channel.id,
          channelName: msg.channel.channelName,
          discordGuildId: msg.channel.guildId,
        },
      });

      const newMessage: Message = await prisma.message.upsert({
        where: {
          Id: msg.message.id,
        },
        update: { 
          attachmentContent:
            msg.message.attachment.length > 0
              ? msg.message.attachment
              : undefined,
        },

        create: {
          Id: msg.message.id,
          guildChannelId: msg.message.channelId,
          username: msg.message.username,
          isBot: msg.message.bot,
          content: msg.message.content,
          attachmentContent:
            msg.message.attachment.length > 0
              ? msg.message.attachment
              : undefined,
        },
      });
    } catch (err) {
      console.log(err);
    }
  });
});

export function expressServer() {
app.listen(3000, () => {
  console.log("api server listening on port 3000");
});
}

