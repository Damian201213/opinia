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
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

// === Stałe ===
const DROP_CHANNEL_ID = process.env.DROP_CHANNEL_ID;
const LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL;
const OWNER_ID = process.env.OWNER_ID;

// === DROP System ===
const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 60 * 1000; // 1 godzina cooldown
const dropTable = [
  { item: "💎 Schemat pół auto totki", chance: 5 },
  { item: "🪙 1k na anarchii", chance: 5 },
  { item: "🥇 Mały ms", chance: 5 },
  { item: "🥇 Własna ranga (do wyboru)", chance: 5 },
  { item: "💀 Pusty drop", chance: 80 },
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
    { id: "pyt1", label: "Co chcesz kupić?", placeholder: "np. odłamki" },
    { id: "pyt2", label: "Na jakim trybie?", placeholder: "np. boxpvp" },
  ],
  pomoc: [
    { id: "pyt1", label: "Opisz problem", placeholder: "Co się dzieje?" },
  ],
  snajperka: [
    { id: "pyt1", label: "Masz komputer czy laptop?", placeholder: "np. komputer" },
  ],
  drop: [
    { id: "pyt1", label: "Co wygrałeś?", placeholder: "np. 1k monet" },
  ],
  inne: [
    { id: "pyt1", label: "Temat zgłoszenia", placeholder: "O co chodzi?" },
    { id: "pyt2", label: "Szczegóły", placeholder: "Opisz sytuację" },
  ],
  wlasciciel: [
    { id: "pyt1", label: "Temat sprawy", placeholder: "O co chcesz zapytać właściciela?" },
    { id: "pyt2", label: "Treść", placeholder: "Opisz swoją sprawę" },
  ],
};

// === Kategorie ticketów ===
const CATEGORY_MAP = {
  zakup: process.env.CATEGORY_ZAKUP,
  pomoc: process.env.CATEGORY_POMOC,
  snajperka: process.env.CATEGORY_SNAJPERKA,
  drop: process.env.CATEGORY_DROP,
  inne: process.env.CATEGORY_INNE,
  wlasciciel: process.env.CATEGORY_WLASCICIEL,
};

// === Komendy ===
const commands = [
  new SlashCommandBuilder().setName("drop").setDescription("🎁 Otwórz drop i wylosuj nagrodę!"),
  new SlashCommandBuilder().setName("panel").setDescription("📩 Wyślij panel ticketów WrGr Shop"),
  new SlashCommandBuilder()
    .setName("opinia")
    .setDescription("💬 Dodaj opinię o sprzedawcy")
    .addStringOption(opt =>
      opt.setName("sprzedawca").setDescription("Nazwa sprzedawcy").setRequired(true)
        .addChoices(
          { name: "Weryfikacja_", value: "Weryfikacja_" },
          { name: "mojawersja", value: "mojawersja" },
          { name: "spoconymacis247", value: "spoconymacis247" }
        ))
    .addStringOption(opt =>
      opt.setName("ocena").setDescription("Ocena 1–5").setRequired(true)
        .addChoices(
          { name: "⭐ 1", value: "1" },
          { name: "⭐⭐ 2", value: "2" },
          { name: "⭐⭐⭐ 3", value: "3" },
          { name: "⭐⭐⭐⭐ 4", value: "4" },
          { name: "⭐⭐⭐⭐⭐ 5", value: "5" }
        )),
  new SlashCommandBuilder()
    .setName("propozycja")
    .setDescription("💡 Wyślij propozycję")
    .addStringOption(opt => opt.setName("tresc").setDescription("Twoja propozycja").setRequired(true)),
  new SlashCommandBuilder().setName("legitcheck").setDescription("✅ Potwierdź transakcję (legit check)"),
].map(cmd => cmd.toJSON());

// === Rejestracja komend ===
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
(async () => {
  try {
    console.log("🔄 Rejestrowanie komend...");
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("✅ Komendy zarejestrowane!");
  } catch (err) { console.error(err); }
})();

// === Obsługa interakcji ===
client.on("interactionCreate", async (interaction) => {
  // --- /drop ---
  if (interaction.isChatInputCommand() && interaction.commandName === "drop") {
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
    if (wynik === "💀 Pusty drop") await interaction.reply("❌ Nic nie wypadło!");
    else await interaction.reply(`🎁 Gratulacje! Trafiłeś: **${wynik}**`);
  }

  // --- /panel ---
  if (interaction.isChatInputCommand() && interaction.commandName === "panel") {
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
          { label: "👑 Sprawa do właściciela", value: "wlasciciel" },
        ])
    );

    const embed = new EmbedBuilder()
      .setTitle("🎟️ WrGr Shop × UTWÓRZ ZGŁOSZENIE")
      .setDescription("Wybierz kategorię zgłoszenia z menu poniżej, aby rozpocząć rozmowę z supportem.")
      .setColor("#2b2d31");

    await interaction.channel.send({ embeds: [embed], components: [menu] });
    await interaction.reply({ content: "✅ Panel WrGr Shop wysłany!", ephemeral: true });
  }

  // --- Formularz ticketów ---
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {
    const category = interaction.values[0];
    const form = FORMS[category];
    if (!form) return interaction.reply({ content: "❌ Brak formularza dla tej kategorii!", ephemeral: true });

    const modal = new ModalBuilder()
      .setCustomId(`ticket_modal_${category}_${interaction.user.id}`)
      .setTitle(`📝 Formularz — ${category}`);

    for (const field of form) {
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(field.id)
            .setLabel(field.label)
            .setPlaceholder(field.placeholder)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      );
    }
    await interaction.showModal(modal);
  }

  // --- Tworzenie ticketa ---
  if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith("ticket_modal_")) {
    const [_, __, category, userId] = interaction.customId.split("_");
    const form = FORMS[category];
    const categoryId = CATEGORY_MAP[category];
    if (!form || !categoryId) return interaction.reply({ content: "Błąd konfiguracji!", ephemeral: true });

    const user = interaction.user;
    const guild = interaction.guild;

    const channel = await guild.channels.create({
      name: `${category}-${user.username}`.substring(0, 90),
      type: 0,
      parent: categoryId,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: process.env.SUPPORT_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      ],
    });

    const embed = new EmbedBuilder()
      .setTitle(`🎟️ Ticket — ${category}`)
      .setColor("#2b2d31")
      .setThumbnail(user.displayAvatarURL())
      .addFields({ name: "👤 Użytkownik", value: `${user} (${user.username})` });

    for (const field of form) {
      const val = interaction.fields.getTextInputValue(field.id);
      embed.addFields({ name: field.label, value: val });
    }

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("close_ticket").setLabel("Zamknij").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("claim_ticket").setLabel("Przejmij").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("ping_user").setLabel("Wezwij").setStyle(ButtonStyle.Primary)
    );

    await channel.send({
      content: `<@&${process.env.SUPPORT_ROLE_ID}> | ${user}`,
      embeds: [embed],
      components: [buttons],
    });

    await interaction.reply({ content: `✅ Ticket utworzony: ${channel}`, ephemeral: true });

    // Log
    const log = guild.channels.cache.get(LOG_CHANNEL_ID);
    if (log) {
      const logEmbed = new EmbedBuilder()
        .setTitle("🗂️ Nowy Ticket")
        .addFields(
          { name: "Użytkownik", value: `${user.tag}`, inline: true },
          { name: "Kategoria", value: category, inline: true },
          { name: "Kanał", value: `${channel}`, inline: false }
        )
        .setColor("#00FF88")
        .setTimestamp();
      await log.send({ embeds: [logEmbed] });
    }
  }

  // --- Przyciski ticketa ---
  if (interaction.isButton()) {
    if (!interaction.member.roles.cache.has(process.env.SUPPORT_ROLE_ID))
      return interaction.reply({ content: "⛔ Nie masz uprawnień do tej akcji.", ephemeral: true });

    if (interaction.customId === "close_ticket") {
      await interaction.reply({ content: "🗑 Ticket zostanie zamknięty za 5 sekund...", ephemeral: true });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    } else if (interaction.customId === "claim_ticket") {
      await interaction.reply({ content: `📌 Ticket przejęty przez ${interaction.user}`, ephemeral: false });
    } else if (interaction.customId === "ping_user") {
      await interaction.reply({ content: `📨 Wezwanie dla autora ticketa!`, ephemeral: false });
    }
  }

  // --- /opinia ---
  if (interaction.isChatInputCommand() && interaction.commandName === "opinia") {
    const sprzedawca = interaction.options.getString("sprzedawca");
    const ocena = interaction.options.getString("ocena");
    const embed = new EmbedBuilder()
      .setTitle("📩 Nowa opinia!")
      .addFields(
        { name: "🧑 Sprzedawca", value: sprzedawca },
        { name: "⭐ Ocena", value: `${ocena}/5` },
        { name: "🗣️ Autor", value: interaction.user.tag }
      )
      .setColor("#00AEFF")
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }

  // --- /propozycja ---
  if (interaction.isChatInputCommand() && interaction.commandName === "propozycja") {
    const tresc = interaction.options.getString("tresc");
    const embed = new EmbedBuilder()
      .setTitle("💡 Nowa propozycja")
      .setDescription(tresc)
      .setColor("#00FFAA")
      .setFooter({ text: `Propozycja od ${interaction.user.tag}` })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }

  // --- /legitcheck ---
  if (interaction.isChatInputCommand() && interaction.commandName === "legitcheck") {
    const embed = new EmbedBuilder()
      .setTitle("✅ LegitCheck")
      .setDescription("💫 Dziękujemy za zaufanie!")
      .addFields(
        { name: "👤 Sprzedawca", value: `${interaction.user}` },
        { name: "💵 Status", value: "✅ Klient otrzymał swoje zamówienie" }
      )
      .setColor("#00FF00")
      .setFooter({ text: "System LegitCheck × WrGr Shop" })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// === Start bota ===
client.once("ready", () => console.log(`✅ Zalogowano jako ${client.user.tag}`));
client.login(process.env.TOKEN);
