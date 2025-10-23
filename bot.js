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
app.get("/", (req, res) => res.send("✅ WrGr Bot działa!"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Keep-Alive wystartował"));

// === Discord Client ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
});

// === Stałe ===
const {
  TOKEN, CLIENT_ID, GUILD_ID,
  DROP_CHANNEL_ID, OPINIE_CHANNEL_ID,
  CATEGORY_ZAKUP, CATEGORY_POMOC, CATEGORY_SNAJPERKA,
  CATEGORY_DROP, CATEGORY_INNE, CATEGORY_WLASCICIEL,
  SUPPORT_ROLE_ID, WELCOME_CHANNEL_ID, LC_CHANNEL_ID, TICKET_LOG_CHANNEL
} = process.env;

// === Licznik LC ===
let lcCounter = 1;

// === Drop System ===
const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 60 * 1000; // 1h
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

// === Ticket Formularze ===
const FORMS = {
  zakup: [
    { id: "pyt1", label: "Co chcesz kupić?", placeholder: "np. 100k $" },
    { id: "pyt2", label: "Na jakim serwerze?", placeholder: "np. anarchia.gg" },
    { id: "pyt3", label: "Metoda płatności?", placeholder: "np. BLIK, PSC" },
    { id: "pyt4", label: "Za ile chcesz kupić?", placeholder: "np. 20zł" },
  ],
  pomoc: [
    { id: "pyt1", label: "W czym potrzebujesz pomocy?", placeholder: "np. problem z zakupem" },
  ],
  snajperka: [
    { id: "pyt1", label: "Masz komputer czy laptop?", placeholder: "Musi być komputer!" },
  ],
  drop: [
    { id: "pyt1", label: "Co wygrałeś?", placeholder: "np. 1zł do wydania" },
  ],
  inne: [
    { id: "pyt1", label: "Opisz sytuację", placeholder: "np. zgłoszenie problemu" },
  ],
  wymiana: [
    { id: "pyt1", label: "Z jakeigo serwera?", placeholder: "np. anarchiagg lf" },
    { id: "pyt2", label: "Na jaki serwer?", placeholder: "np. anarchiagg boxpvp" },
    { id: "pyt3", label: "Co chcesz wymienic?", placeholder: "np. elytrę" },
    { id: "pyt4", label: "Co chcesz otrzymac?", placeholder: "np. 100k" },
  ],
};

// === Kategorie ===
const CATEGORY_MAP = {
  zakup: CATEGORY_ZAKUP,
  pomoc: CATEGORY_POMOC,
  snajperka: CATEGORY_SNAJPERKA,
  drop: CATEGORY_DROP,
  inne: CATEGORY_INNE,
  wlasciciel: CATEGORY_WLASCICIEL,
};

// === Komendy ===
const commands = [
  new SlashCommandBuilder().setName("drop").setDescription("🎁 Otwórz drop i wylosuj nagrodę!"),
  new SlashCommandBuilder().setName("panel").setDescription("🎟️ Wyślij panel ticketów WrGr"),
  new SlashCommandBuilder().setName("opinia")
    .setDescription("💬 Dodaj opinię o WrGr Shop")
    .addStringOption(opt => opt.setName("tresc").setDescription("Treść opinii").setRequired(true)),
  new SlashCommandBuilder().setName("propozycja")
    .setDescription("💡 Wyślij propozycję")
    .addStringOption(opt => opt.setName("tresc").setDescription("Twoja propozycja").setRequired(true)),
  new SlashCommandBuilder().setName("lc")
    .setDescription("📦 Wystaw LegitCheck")
    .addStringOption(opt => opt.setName("serwer").setDescription("Serwer").setRequired(true))
    .addStringOption(opt => opt.setName("cena").setDescription("Cena").setRequired(true)),
].map(c => c.toJSON());

// === Rejestracja komend ===
const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
  try {
    console.log("🔁 Rejestrowanie komend...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log("✅ Komendy zarejestrowane!");
  } catch (err) { console.error(err); }
})();

// === Powitalnia ===
client.on("guildMemberAdd", async (member) => {
  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!ch) return;
  const embed = new EmbedBuilder()
    .setTitle("👋 Witamy w WrGr Shop!")
    .setDescription(`Cześć ${member}, miło że do nas dołączyłeś!\n💎 Sprawdź nasz sklep i zgłoszenia.`)
    .setColor("#00AEFF")
    .setThumbnail(member.user.displayAvatarURL());
  ch.send({ embeds: [embed] });
});

// === Obsługa interakcji ===
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // --- /drop ---
  if (interaction.commandName === "drop") {
    if (interaction.channelId !== DROP_CHANNEL_ID)
      return interaction.reply({ content: `❌ Użyj tej komendy tylko w <#${DROP_CHANNEL_ID}>!`, ephemeral: true });
    const id = interaction.user.id;
    const now = Date.now();
    if (cooldowns.has(id)) {
      const expires = cooldowns.get(id) + COOLDOWN_TIME;
      if (now < expires) {
        const left = Math.ceil((expires - now) / 60000);
        return interaction.reply({ content: `⏳ Poczekaj ${left} minut!`, ephemeral: true });
      }
    }
    cooldowns.set(id, now);
    const wynik = losujDrop();
    interaction.reply(`🎁 Gratulacje! Trafiłeś: **${wynik}**`);
  }

  // --- /panel ---
  if (interaction.commandName === "panel") {
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("📨 Wybierz kategorię zgłoszenia")
        .addOptions([
          { label: "🛒 Zakup", value: "zakup" },
          { label: "🆘 Pomoc", value: "pomoc" },
          { label: "🎯 Snajperka", value: "snajperka" },
          { label: "🎁 Wygrana drop", value: "drop" },
          { label: "⚙️ Inne", value: "inne" },
          { label: "👑 Właściciel", value: "wlasciciel" },
        ])
    );
    const embed = new EmbedBuilder()
      .setTitle("🎟️ WrGr × UTWÓRZ ZGŁOSZENIE")
      .setDescription("Wybierz kategorię, aby rozpocząć rozmowę z supportem.")
      .setColor("#2b2d31");
    await interaction.channel.send({ embeds: [embed], components: [menu] });
    await interaction.reply({ content: "✅ Panel wysłany!", ephemeral: true });
  }

  // --- /opinia ---
  if (interaction.commandName === "opinia") {
    const opinieChannel = interaction.guild.channels.cache.get(OPINIE_CHANNEL_ID);
    if (!opinieChannel) return interaction.reply({ content: "❌ Brak kanału opinii!", ephemeral: true });
    const embed = new EmbedBuilder()
      .setTitle("⭐ Opinia o WrGr Shop")
      .setDescription(interaction.options.getString("tresc"))
      .setColor("#FFD700")
      .setFooter({ text: `Autor: ${interaction.user.tag}` })
      .setTimestamp();
    await opinieChannel.send({ embeds: [embed] });
    await interaction.reply({ content: "✅ Opinia wysłana!", ephemeral: true });
  }

  // --- /lc ---
  if (interaction.commandName === "lc") {
    const serwer = interaction.options.getString("serwer");
    const cena = interaction.options.getString("cena");
    const embed = new EmbedBuilder()
      .setTitle(`✅ WrGr Legit Check #${lcCounter}`)
      .addFields(
        { name: "🧾 Serwer", value: serwer, inline: true },
        { name: "💰 Cena", value: cena, inline: true },
        { name: "📩 Wystawiono przez", value: `${interaction.user}` }
      )
      .setColor("#00FF00")
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({ text: `System LegitCheck × WrGr` })
      .setTimestamp();
    lcCounter++;
    await interaction.reply({ embeds: [embed] });
  }
});

// === System LC — automatyczne embedowanie zdjęć ===
client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== LC_CHANNEL_ID) return;
  if (msg.author.bot) return;
  if (msg.attachments.size < 1) return;

  const attachment = msg.attachments.first();
  const embed = new EmbedBuilder()
    .setTitle(`✅ WrGr Legit Check #${lcCounter}`)
    .setDescription(`💬 Wystawiony przez ${msg.author}`)
    .setColor("#00FF00")
    .setImage(attachment.url)
    .setThumbnail(msg.author.displayAvatarURL())
    .setFooter({ text: "System LC × WrGr" })
    .setTimestamp();
  lcCounter++;
  await msg.delete();
  await msg.channel.send({ embeds: [embed] });
  try {
    await msg.author.send(`✅ Twój LegitCheck został wystawiony na <#${msg.channel.id}>!`);
  } catch (e) { console.log("Nie można wysłać DM."); }
});

// === Start ===
client.once("ready", () => console.log(`✅ Zalogowano jako ${client.user.tag}`));
client.login(TOKEN);
