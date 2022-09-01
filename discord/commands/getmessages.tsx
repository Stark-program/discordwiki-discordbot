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
    interaction.deferReply();
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

    await channel.messages
      .fetch({ limit: 50 })
      .then((messagePage: interactionType) => {
        messagePage.forEach((msg: interactionType) => {
          const userAvatar = msg.author.avatarURL();
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
            userAvatar: userAvatar === null ? "" : userAvatar,
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
