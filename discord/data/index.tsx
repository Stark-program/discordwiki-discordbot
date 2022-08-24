import { PrismaClient } from "@prisma/client";
import { GuildWidgetStyle } from "discord.js";
import express from "express";

const prisma = new PrismaClient();
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
interface interactionType {
  [key: string]: any;
}

app.post("/data", async (req: interactionType, res: any) => {
  let data = req.body;

  async function storeData(data: any) {
    let guild = data.guild;
    let channel = data.channel;
    let messages = data.message;

    const newGuild = await prisma.discordGuild.upsert({
      where: {
        Id: guild.id,
      },
      update: {
        guildName: guild.name,
      },
      create: {
        Id: guild.id,
        guildName: guild.name,
      },
    });
    const newChannel = await prisma.channel.upsert({
      where: {
        Id: channel.id,
      },
      update: {
        channelName: channel.channelName,
      },
      create: {
        Id: channel.id,
        channelName: channel.channelName,
        discordGuildId: channel.guildId,
      },
    });
    const newMessages = await prisma.message.createMany({
      data: messages,
      skipDuplicates: true,
    });

    if (newGuild && newChannel && newMessages) {
      return true;
    } else return false;
  }

  try {
    const posted = await storeData(data);
    if (posted === true) {
      res.send("All messages successfully saved to database");
    } else {
      res.send("Something went wrong saving the messages to the database");
    }
  } catch (err) {
    console.log(err);
  }
});

function getGuildAndChannelData(guildId: any, channelId: any) {
  if (channelId === null) {
    return prisma.discordGuild.findUnique({
      where: {
        Id: guildId,
      },
      include: {
        channels: true,
      },
    });
  } else {
    return prisma.discordGuild.findUnique({
      where: {
        Id: guildId,
      },
      include: {
        channels: {
          where: {
            Id: channelId,
          },
          include: {
            messages: true,
          },
        },
      },
    });
  }
}

app.get("/guilds/:guildId/:channelId", async (req, res) => {
  getGuildAndChannelData(req.params.guildId, req.params.channelId).then(
    (data: any) => {
      if (data === null || data === undefined) {
        res.send("Guild not found");
      } else if (data.channels[0] === undefined || data.channels[0] === null) {
        res.send("No Guild Channels found");
      } else if (
        data.channels[0].messages === undefined ||
        data.channels[0].messages === null
      ) {
        res.send("No messages found in channel");
      } else {
        res.send(data.channels[0].messages);
      }
    }
  );
});

app.get("/guilds/:guildId", async (req, res) => {
  getGuildAndChannelData(req.params.guildId, null).then((data: any) => {
    if (data === null || data === undefined) {
      res.send("Guild not found");
    } else {
      res.send(data);
    }
  });
});

app.get("/guilds", async (req, res) => {
  prisma.discordGuild.findMany().then((data: any) => {
    if (data === null || data === undefined) {
      res.send("No guilds found");
    } else {
      res.send(data);
    }
  });
});

export function expressServer() {
  app.listen(3000, () => {
    console.log("api server listening on port 3000");
  });
}
