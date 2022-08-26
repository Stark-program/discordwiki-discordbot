import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";

const client = require("../client.tsx");

interface interactionType {
  [key: string]: any;
}
interface MessageData {
  id: String;
  guildChannelId: String;
  username: String;
  isBot: Boolean;
  content: String;
  attachmentContent: Array<string>;
}
module.exports = {
  data: new SlashCommandBuilder()
    .setName("getmessages")
    .setDescription(
      "Gives the wiki bot the last 50 messages sent in the text channel"
    ),
  async execute(interaction: interactionType) {
    const guildName = interaction.member.guild.name;
    const guildId = interaction.guildId;
    const channelId = interaction.channelId;
    const messages: Array<any> = [];
    const channel = client.channels.cache.get(channelId);
    const channelName = channel.name;
    interaction.deferReply();
    const data = {
      guild: {
        id: guildId,
        name: guildName,
      },
      channel: {
        id: channelId,
        channelName: channelName,
        guildId: guildId,
      },
      message: messages,
    };

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
            id: msg.id,
            guildChannelId: channelId,
            username: msg.author.username,
            isBot: msg.author.bot,
            content: msg.content,
            attachmentContent: attachments,
          };
          messages.push(messageData);
        });
      });

    axios.post("http://localhost:3000/data", data).then(async (res: any) => {
      await interaction.editReply(res.data);
    });
  },
};
