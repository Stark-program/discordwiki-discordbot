-- CreateTable
CREATE TABLE "DiscordGuild" (
    "Id" TEXT NOT NULL,

    CONSTRAINT "DiscordGuild_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "Id" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "discordGuildId" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Message" (
    "Id" TEXT NOT NULL,
    "guildChannelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "content" TEXT,
    "attachment" BOOLEAN NOT NULL,
    "attachmentContent" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordGuild_Id_key" ON "DiscordGuild"("Id");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_Id_key" ON "Channel"("Id");

-- CreateIndex
CREATE UNIQUE INDEX "Message_Id_key" ON "Message"("Id");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_discordGuildId_fkey" FOREIGN KEY ("discordGuildId") REFERENCES "DiscordGuild"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_guildChannelId_fkey" FOREIGN KEY ("guildChannelId") REFERENCES "Channel"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
