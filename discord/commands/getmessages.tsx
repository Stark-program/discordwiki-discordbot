import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";
const {
  MessageMentions: { USERS_PATTERN },
} = require("discord.js");

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

    async function getNameOfUserMention(userId: string) {
      if (userId.startsWith("<@") && userId.endsWith(">")) {
        userId = userId.slice(2, -1);

        if (userId.startsWith("!")) {
          userId = userId.slice(1);
        }
        const user = client.users.cache.get(userId);
        return user.username;
      }
    }

    async function spliceUserMention(mention: string) {
      const mentionArray = mention.split(" ");

      // Regex checking for userId in the message content between the chcracters <@ and >
      const regexMatch = /^<@!?(\d+)>$/;

      for (let i = 0; i < mentionArray.length; i++) {
        if (mentionArray[i].match(regexMatch)) {
          const username = await getNameOfUserMention(mentionArray[i]);
          mentionArray[i] = "@" + username;
        }
      }
      const finalString = mentionArray.join(" ");
      return finalString;
    }

    const messagePage = await channel.messages.fetch({ limit: 50 });

    for await (const msg of messagePage.values()) {
      const dateOfMessage = getDateTime(msg.createdTimestamp);
      const userAvatar = msg.author.avatarURL();
      const isUserMentioned = msg.mentions.users.size > 0;
      const finalContentString = isUserMentioned
        ? await spliceUserMention(msg.content)
        : msg.content;

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
        content: finalContentString,
        attachmentContent: attachments,
      };

      messages.push(messageData);
    }

    axios.post("http://localhost:3000/data", data).then(async (res: any) => {
      await interaction.editReply({ content: res.data, ephemeral: true });
    });
  },
};
