import { PrismaClient } from "@prisma/client";
import { TextInputStyle } from "discord.js";
import express from "express";

const prisma = new PrismaClient();
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

app.post("/data", async (req: any, res: any) => {
  let data = req.body;
  //   try {
  //     const newGuild = await prisma.discordGuild.create({
  //       data: {
  //         Id: data.test.guild
  //       },
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  console.log(data);
});
app.listen(3000, () => {
  console.log("api server listening on port 3000");
});
