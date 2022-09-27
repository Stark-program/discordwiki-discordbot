import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();
const {
  MessageMentions: { USERS_PATTERN },
} = require("discord.js");

const API_ENDPOINT = process.env.API_ENDPOINT;
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

    function getNameOfUserMention(userId: string) {
      if (userId.startsWith("<@") && userId.endsWith(">")) {
        userId = userId.slice(2, -1);

        if (userId.startsWith("!")) {
          userId = userId.slice(1);
        }
        const user = client.users.cache.get(userId);

        if (user === undefined) {
          return "User not found";
        } else {
          return user.username;
        }
      } else {
        const user = client.users.cache.get(userId);

        if (user === undefined) {
          return "User not found";
        } else {
          return user.username;
        }
      }
    }

    function spliceUserMention(mention: string) {
      const mentionArray = mention.split(/[ ,]+/);

      // Regex checking for userId in the message content between the chcracters <@ and >
      const regexMatch = /^<@!?(\d+)>$/;

      for (let i = 0; i < mentionArray.length; i++) {
        if (mentionArray[i].includes("<@")) {
          if (mentionArray[i].match(regexMatch)) {
            const username = getNameOfUserMention(mentionArray[i]);
            mentionArray[i] = "@" + username;
          } else {
            let mentionString = mentionArray[i].substring(
              mentionArray[i].indexOf("@") + 1,
              mentionArray[i].indexOf(">")
            );
            const username = getNameOfUserMention(mentionString);
            mentionArray[i] = "@" + username;
          }
        }
      }
      const finalString = mentionArray.join(" ");
      return finalString;
    }

    const messagePage = await channel.messages.fetch({ limit: 50 });

    messagePage.forEach((msg: any) => {
      try {
        const dateOfMessage = getDateTime(msg.createdTimestamp);
        const userAvatar = msg.author.avatarURL();
        const isUserMentioned = msg.mentions.users.size > 0;
        const finalContentString = isUserMentioned
          ? spliceUserMention(msg.content)
          : msg.content;

        let attachments: Array<string> = [];
        if (msg.attachments.size > 0) {
          console.log(msg);
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
      } catch (error) {
        console.log(error);
      }
    });
    const response = await axios.post(`${API_ENDPOINT}data`, data);
    await interaction.editReply({ content: response.data, ephemeral: true });
  },
};
