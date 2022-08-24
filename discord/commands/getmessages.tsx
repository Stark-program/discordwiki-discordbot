import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";

const client = require("../client.tsx");

interface interactionType {
  [key: string]: any;
}
interface MessageData {
  guild: {
    id: String;
    name: String;
  };
  channel: {
    id: String;
    channelName: String;
    guildId: String;
  };
  message: {
    id: String;
    channelId: String;
    username: String;
    bot: Boolean;
    content: String;
    attachment: Array<string>;
  };
}
module.exports = {
  data: new SlashCommandBuilder()
    .setName("getmessages")
    .setDescription(
      "Gives the wiki bot the entire message history of this text channel"
    ),
  async execute(interaction: interactionType) {
    const guildId = interaction.guildId;
    const channelId = interaction.channelId;
    const messages: Array<any> = [];
    const channel = client.channels.cache.get(channelId);
    await interaction.deferReply()
      await channel.messages
        .fetch({ limit: 50 })
        .then((messagePage: interactionType) => {
          messagePage.forEach((msg: interactionType) => {
            let channelData = client.channels.cache.find(
              (channel: any) => channel.id === msg.channelId
            );
            let attachments: Array<string> = [];
            if (msg.attachments.size > 0) {
              msg.attachments.forEach((value: any) => {
                attachments.push(value.attachment);
              });
            }

            //construct all necessary information to send to server
            const messageData: MessageData = {
              guild: {
                id: msg.guildId,
                name: channelData.guild.name,
              },
              channel: {
                id: msg.channelId,
                channelName: channelData.name,
                guildId: msg.guildId,
              },
              message: {
                id: msg.id,
                channelId: msg.channelId,
                username: msg.author.username,
                bot: msg.author.bot,
                content: msg.content,
                attachment: attachments,
              },
            };
            messages.push(messageData);
          });
        });
   
    console.log(messages.length);
    axios.post("http://localhost:3000/data", messages).then(async (res: any) => {
      console.log(res.data);
      await interaction.editReply(res.data) 
    });
  },
};
