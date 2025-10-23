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
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
});

// === Stałe ===
const DROP_CHANNEL_ID = process.env.DROP_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL;
const OPINIE_CHANNEL_ID = process.env.OPINIE_CHANNEL_ID;
const OWNER_ID = process.env.OWNER_ID;
const SYSTEM_LC_CHANNEL_ID = process.env.SYSTEM_LC_CHANNEL_ID;
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;
const SUPPORT_ROLE_ID = process.env.SUPPORT_ROLE_ID;

// === System powitalny ===
client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;
  const embed = new EmbedBuilder()
    .setTitle("👋 Witaj w WrGr Shop!")
    .setDescription(`Cześć ${member}! Dzięki, że dołączyłeś do naszej społeczności 💎`)
    .setColor("#00FFAA")
    .setThumbnail(member.user.displayAvatarURL());
  channel.send({ embeds: [embed] });
});

// === DROP System ===
const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 60 * 1000;
const dropTable = [
  { item: "💎 +100$ do zakupu za 1zł", chance: 2 },
  { item: "🪙 1zł do wydania na sklepie ", chance: 2 },
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

// === Formularze Ticketów ===
const FORMS = {
  zakup: [
    { id: "pyt1", label: "Co chcesz kupić?", placeholder: "np. 100k $" },
    { id: "pyt2", label: "Na jakim serwerze?", placeholder: "np. anarchia.gg, pykmc" },
    { id: "pyt3", label: "Jaką metodą płacisz?", placeholder: "np. BLIK, PSC" },
    { id: "pyt4", label: "Za ile chcesz kupić?", placeholder: "np. 20zł" },
  ],
  sprzedaż: [
    { id: "pyt1", label: "Na jakim serwerze?", placeholder: "np. anarchia lf" },
    { id: "pyt2", label: "Co chcesz sprzedać?", placeholder: "np. 100k" },
    { id: "pyt3, label: "Za ile chcesz sprzedać ?", placeholder: "np. 20zł" },
    { id: "pyt4", label: "Jaką metodą chcesz otrzymać ?", placeholder: "np. Blik" },
  ],
  inne: [
    { id: "pyt1", label: "Szczegóły", placeholder: "Opisz sytuację" },
  ],
   Snajperka: [
    { id: "pyt1", label: "Laptop czy komputer?", placeholder: "np. Musi byc komputer" },
  ],
   Wymiana: [
    { id: "pyt1", label: "Z jakiego serwera?", placeholder: "np. anarchiagg lf" },
    { id: "pyt2", label: "Na jaki serwer?", placeholder: "np. anarchiagg boxpvp" },
    { id: "pyt3", label: "Co chcesz wymeinic?", placeholder: "np. elytre" },
    { id: "pyt4", label: "Co chcesz otrzymac ?", placeholder: "np. 100k" },
  ],
    ],
   Drop: [
    { id: "pyt1", label: "Co wygrałes ?", placeholder: "np. 1zł do wydania na sklepie" },
  ],
};

// === Komendy ===
const commands = [
  new SlashCommandBuilder()
    .setName("drop")
    .setDescription("🎁 Otwórz drop i wylosuj nagrodę!"),
  new SlashCommandBuilder()
    .setName("lc")
    .setDescription("✅ Wystaw LEGIT CHECK WrGr")
    .addStringOption(opt => opt.setName("serwer").setDescription("Nazwa serwera").setRequired(true))
    .addStringOption(opt => opt.setName("cena").setDescription("Cena transakcji").setRequired(true)),
].map(cmd => cmd.toJSON());

// === Rejestracja komend ===
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
(async () => {
  try {
    console.log("🔄 Rejestrowanie komend...");
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
    console.log("✅ Komendy zarejestrowane!");
  } catch (err) { console.error(err); }
})();

// === LC numeracja ===
let lcCounter = 1;

// === Obsługa interakcji ===
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // --- /drop ---
  if (interaction.commandName === "drop") {
    if (interaction.channelId !== DROP_CHANNEL_ID)
      return interaction.reply({ content: `❌ Użyj tej komendy tylko w <#${DROP_CHANNEL_ID}>!`, ephemeral: true });

    const userId = interaction.user.id;
    const now = Date.now();
    if (cooldowns.has(userId)) {
      const expires = cooldowns.get(userId) + COOLDOWN_TIME;
      if (now < expires) {
        const left = Math.ceil((expires - now) / 60000);
        return interaction.reply({ content: `⏳ Poczekaj ${left} minut przed kolejnym dropem!`, ephemeral: true });
      }
    }

    const wynik = losujDrop();
    cooldowns.set(userId, now);
    await interaction.reply(`🎁 Gratulacje! Trafiłeś: **${wynik}**`);
  }

  // --- /lc ---
  if (interaction.commandName === "lc") {
    const serwer = interaction.options.getString("serwer");
    const cena = interaction.options.getString("cena");
    const member = interaction.member;

    if (interaction.channel.parentId !== TICKET_CATEGORY_ID)
      return interaction.reply({ content: "❌ Tę komendę możesz użyć tylko w ticketach!", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle("✅ WrGr × LEGIT CHECK")
      .setColor("#00FF00")
      .setDescription(`✅ **LEGIT?** Kupione ${cena} na serwerze **${serwer}**\n💬 *Napisz LEGIT, jeżeli transakcja przebiegła pomyślnie!* 💎`)
      .setFooter({ text: `LC wystawiony przez ${interaction.user.username}` })
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

// === System LEGIT CHECK (zdjęcia) ===
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.id !== SYSTEM_LC_CHANNEL_ID) return;

  if (msg.attachments.size > 0) {
    const attachment = msg.attachments.first();

    const embed = new EmbedBuilder()
      .setTitle(`✅ Legitcheck #${lcCounter}`)
      .setDescription(`💫 Dziękujemy wam za zaufanie!\n👤 Seller: ${msg.author}\n\n✅ Klient otrzymał swoje zamówienie — dowód poniżej:`)
      .setImage(attachment.url)
      .setColor("#00FFAA")
      .setFooter({ text: `System LegitCheck × WrGr • ${new Date().toLocaleString()}` });

    await msg.delete();
    await msg.channel.send({ embeds: [embed] });

    lcCounter++;
  }
});

// === Start bota ===
client.once("ready", () => console.log(`✅ Zalogowano jako ${client.user.tag}`));
client.login(process.env.TOKEN);
