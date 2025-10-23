// === Importy ===
import {
  Client, GatewayIntentBits, Partials,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle,
  EmbedBuilder, SlashCommandBuilder, REST, Routes, InteractionType, PermissionsBitField
} from "discord.js";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

// === Express Keep-Alive ===
const app = express();
app.get("/", (req, res) => res.send("✅ WrGr Shop Bot działa!"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Keep-Alive wystartował"));

// === Discord Client ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel],
});

// === Stałe ===
const DROP_CHANNEL_ID = process.env.DROP_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL;
const OPINIE_CHANNEL_ID = process.env.OPINIE_CHANNEL_ID;
const OWNER_ID = process.env.OWNER_ID;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID; // kanał powitań

// === Drop System ===
const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 60 * 1000;
const dropTable = [
  { item: "💎 +100$ do zakupu za 1zł", chance: 2 },
  { item: "🪙 1zł do wydania na sklepie", chance: 2 },
];
function losujDrop() {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const d of dropTable) {
    sum += d.chance;
    if (rand < sum) return d.item;
  }
  return "💀 Nic...";
}

// === Kategorie ticketów ===
const CATEGORY_MAP = {
  zakup: process.env.CATEGORY_ZAKUP,
  pomoc: process.env.CATEGORY_POMOC,
  snajperka: process.env.CATEGORY_SNAJPERKA,
  drop: process.env.CATEGORY_DROP,
  inne: process.env.CATEGORY_INNE,
  wlasciciel: process.env.CATEGORY_WLASCICIEL,
};

// === Formularze ===
const FORMS = {
  zakup: [
    { id: "pyt1", label: "Co chcesz kupić?", placeholder: "np. 100k $" },
    { id: "pyt2", label: "Na jakim serwerze?", placeholder: "np. Anarchia.gg" },
    { id: "pyt3", label: "Jaką metodą płacisz?", placeholder: "np. BLIK" },
    { id: "pyt4", label: "Za ile?", placeholder: "np. 10zł" },
  ],
  inne: [
    { id: "pyt1", label: "Szczegóły", placeholder: "Opisz swoją sprawę" },
  ],
};

// === Komendy ===
const commands = [
  new SlashCommandBuilder().setName("drop").setDescription("🎁 Otwórz drop i wylosuj nagrodę!"),
  new SlashCommandBuilder().setName("panel").setDescription("📩 Wyślij panel ticketów WrGr Shop"),
  new SlashCommandBuilder()
    .setName("opinia")
    .setDescription("💬 Dodaj opinię o WrGr Shop")
    .addStringOption(opt =>
      opt.setName("czas").setDescription("Ocena czasu oczekiwania (1–5)").setRequired(true)
        .addChoices(
          { name: "⭐ 1", value: "1" },
          { name: "⭐⭐ 2", value: "2" },
          { name: "⭐⭐⭐ 3", value: "3" },
          { name: "⭐⭐⭐⭐ 4", value: "4" },
          { name: "⭐⭐⭐⭐⭐ 5", value: "5" }
        ))
    .addStringOption(opt =>
      opt.setName("przebieg").setDescription("Ocena przebiegu transakcji (1–5)").setRequired(true)
        .addChoices(
          { name: "⭐ 1", value: "1" },
          { name: "⭐⭐ 2", value: "2" },
          { name: "⭐⭐⭐ 3", value: "3" },
          { name: "⭐⭐⭐⭐ 4", value: "4" },
          { name: "⭐⭐⭐⭐⭐ 5", value: "5" }
        ))
    .addStringOption(opt =>
      opt.setName("realizacja").setDescription("Ocena realizacji (1–5)").setRequired(true)
        .addChoices(
          { name: "⭐ 1", value: "1" },
          { name: "⭐⭐ 2", value: "2" },
          { name: "⭐⭐⭐ 3", value: "3" },
          { name: "⭐⭐⭐⭐ 4", value: "4" },
          { name: "⭐⭐⭐⭐⭐ 5", value: "5" }
        ))
    .addStringOption(opt =>
      opt.setName("tresc").setDescription("Treść opinii").setRequired(true)),
  new SlashCommandBuilder().setName("lc").setDescription("✅ Stwórz LEGIT CHECK (dla Supporta)").addStringOption(opt => opt.setName("serwer").setDescription("Nazwa serwera").setRequired(true)).addStringOption(opt => opt.setName("cena").setDescription("Cena przedmiotu").setRequired(true)),
].map(cmd => cmd.toJSON());

// === Rejestracja komend ===
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
    console.log("✅ Komendy WrGr zarejestrowane!");
  } catch (err) { console.error(err); }
})();

// === Powitanie ===
client.on("guildMemberAdd", async member => {
  const welcome = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!welcome) return;

  const embed = new EmbedBuilder()
    .setColor("#00FFAA")
    .setTitle("👋 Witaj w WrGr Shop!")
    .setDescription(`Cześć ${member}, miło Cię widzieć na naszym serwerze!\n🛒 Sprawdź kanały, aby rozpocząć zakupy lub handel!`)
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: "WrGr Shop – najlepsze oferty!", iconURL: member.guild.iconURL() })
    .setTimestamp();

  await welcome.send({ content: `<@${member.id}>`, embeds: [embed] });
});

// === Obsługa interakcji ===
client.on("interactionCreate", async interaction => {

  // --- /lc ---
  if (interaction.isChatInputCommand() && interaction.commandName === "lc") {
    const member = interaction.member;
    if (!member.roles.cache.has(process.env.SUPPORT_ROLE_ID))
      return interaction.reply({ content: "❌ Tylko Support może wystawiać LC!", ephemeral: true });

    const serwer = interaction.options.getString("serwer");
    const cena = interaction.options.getString("cena");

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("✅ Tanie Itemy × LEGIT CHECK")
      .setDescription(`✅ **LEGIT?** Kupione **${cena}** na **${serwer}**\n\n💬 Napisz **LEGIT**, jeżeli transakcja przebiegła pomyślnie! 💎`)
      .setFooter({ text: `LC wystawiony przez ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  // --- /opinia ---
  if (interaction.isChatInputCommand() && interaction.commandName === "opinia") {
    const czas = interaction.options.getString("czas");
    const przebieg = interaction.options.getString("przebieg");
    const realizacja = interaction.options.getString("realizacja");
    const tresc = interaction.options.getString("tresc");
    const oceny = (o) => "⭐".repeat(Number(o));

    const embed = new EmbedBuilder()
      .setColor("#00AEFF")
      .setTitle("⭐ WrGr Shop × OPINIA")
      .addFields(
        { name: "👤 Autor", value: `${interaction.user}` },
        { name: "💬 Treść", value: tresc },
        { name: "🕒 Czas oczekiwania", value: oceny(czas), inline: true },
        { name: "💰 Przebieg transakcji", value: oceny(przebieg), inline: true },
        { name: "📦 Realizacja", value: oceny(realizacja), inline: true }
      )
      .setTimestamp();

    const ch = interaction.guild.channels.cache.get(OPINIE_CHANNEL_ID);
    if (!ch) return interaction.reply({ content: "❌ Brak kanału opinii!", ephemeral: true });
    await ch.send({ embeds: [embed] });
    await interaction.reply({ content: "✅ Opinia wysłana!", ephemeral: true });
  }

});

// === Start ===
client.once("ready", () => console.log(`✅ Zalogowano jako ${client.user.tag}`));
client.login(process.env.TOKEN);
