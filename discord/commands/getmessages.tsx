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
    attachment: Array<any>;
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

    //set initial message pointer to the last message sent in the channel
    let message = await channel.messages
      .fetch({ limit: 1 })
      .then((messagePage: interactionType) => {
        if (messagePage.size === 1) {
          return messagePage;
        } else return null;
      });

    while (message) {
      await channel.messages
        .fetch({ limit: 100, before: message.id })
        .then((messagePage: interactionType) => {
          console.log("this is messagepage size", messagePage.size);
          messagePage.forEach((msg: interactionType) => {
            let channelData = client.channels.cache.find(
              (channel: any) => channel.id === msg.channelId
            );

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
                attachment: msg.attachments,
              },
            };
            messages.push(messageData);
          });
          //set new message pointer
          message =
            0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
        });
    }
    console.log(messages[3]);
    axios.post("http://localhost:3000/data", messages).then((res: any) => {
      console.log(res);
    });
  },
};
