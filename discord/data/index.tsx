import { PrismaClient } from "@prisma/client";
import express from "express";
var cors = require("cors");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
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
        id: guild.id,
      },
      update: {
        guildName: guild.name,
        guildAvatar: guild.guildAvatar,
      },
      create: {
        id: guild.id,
        guildName: guild.name,
        guildAvatar: guild.guildAvatar,
      },
    });
    const newChannel = await prisma.channel.upsert({
      where: {
        id: channel.id,
      },
      update: {
        channelName: channel.channelName,
        guildName: channel.guildName,
      },
      create: {
        id: channel.id,
        channelName: channel.channelName,
        discordGuildId: channel.guildId,
        guildName: channel.guildName,
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
        id: guildId,
      },
      include: {
        channels: true,
      },
    });
  } else {
    return prisma.discordGuild.findUnique({
      where: {
        id: guildId,
      },
      include: {
        channels: {
          where: {
            id: channelId,
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
        res.send(`No Channels found by that id in ${data.guildName}`);
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
      res.send([]);
    } else {
      res.send([data]);
    }
  });
});

app.get("/guilds", async (req, res) => {
  prisma.discordGuild.findMany().then((data: any) => {
    if (data === null || data === undefined) {
      res.send("No guilds found by that id");
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
