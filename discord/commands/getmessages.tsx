import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";

const client = require("../client.tsx");

interface interactionType {
  [key: string]: any;
}
interface MessageData {
  id: String;
  timestamp: String;
  guildChannelId: String;
  username: String;
  userAvatar: String;
  isBot: Boolean;
  content: String;
  attachmentContent: Array<string>;
}

interface GuildData {
  guild: {
    id: String;
    name: String;
    guildAvatar: String;
  };
  channel: {
    id: String;
    channelName: String;
    guildId: String;
    guildName: String;
  };
  message: Array<MessageData>;
}
module.exports = {
  data: new SlashCommandBuilder()
    .setName("getmessages")
    .setDescription(
      "Gives the wiki bot the last 50 messages sent in the text channel"
    ),
  async execute(interaction: interactionType) {
    const guildName = interaction.member.guild.name;
    const guildAvatar = interaction.member.guild.iconURL();
    const guildId = interaction.guildId;
    const channelId = interaction.channelId;
    const messages: Array<any> = [];
    const channel = client.channels.cache.get(channelId);
    const channelName = channel.name;
    interaction.deferReply({ ephemeral: true });
    const data: GuildData = {
      guild: {
        id: guildId,
        name: guildName,
        guildAvatar: guildAvatar === null ? "" : guildAvatar,
      },
      channel: {
        id: channelId,
        channelName: channelName,
        guildId: guildId,
        guildName: guildName,
      },
      message: messages,
    };
    //function that gets timestamp of message and converts it to a date and time
    function getDateTime(timestamp: any) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const seconds = date.getSeconds();

      return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
    }

    await channel.messages
      .fetch({ limit: 50 })
      .then((messagePage: interactionType) => {
        messagePage.forEach((msg: interactionType) => {
          const dateOfMessage = getDateTime(msg.createdTimestamp);
          const userAvatar = msg.author.avatarURL();
          let attachments: Array<string> = [];
          if (msg.attachments.size > 0) {
            msg.attachments.forEach((value: any) => {
              attachments.push(value.attachment);
            });
          }

          //construct all necessary information to send to server
          const messageData: MessageData = {
            id: msg.id,
            timestamp: dateOfMessage,
            guildChannelId: channelId,
            username: msg.author.username,
            userAvatar: userAvatar === null ? "" : userAvatar,
            isBot: msg.author.bot,
            content: msg.content,
            attachmentContent: attachments,
          };
          messages.push(messageData);
        });
      });

    axios.post("http://localhost:3000/data", data).then(async (res: any) => {
      await interaction.editReply({ content: res.data, ephemeral: true });
    });
  },
};
