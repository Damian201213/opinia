// === Importy ===
import {
  Client, GatewayIntentBits, Partials,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, ModalBuilder, TextInputBuilder,
  TextInputStyle, EmbedBuilder, PermissionsBitField,
  SlashCommandBuilder, REST, Routes, InteractionType
} from "discord.js";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

// === Express (keep-alive) ===
const app = express();
app.get("/", (req, res) => res.send("Bot działa!"));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🌐 Keepalive listening on port ${port}`));

// === Discord Client ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

// === Stałe ===
const DROP_CHANNEL_ID = process.env.DROP_CHANNEL_ID;
const OWNER_ID = process.env.OWNER_ID;
const LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL;

// === DROP ===
const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 60 * 1000; // 1 godzina
const dropTable = [
  { item: "💎 Schemat pół auto totki", chance: 5 },
  { item: "🪙 1k na anarchi", chance: 5 },
  { item: "🥇 Mały ms", chance: 5 },
  { item: "🥇 Własna ranga (do wyboru)", chance: 5 },
  { item: "💀 Pusty drop", chance: 80 },
];
function losujDrop(table) {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const d of table) {
    sum += d.chance;
    if (rand < sum) return d.item;
  }
  return "💀 Nic...";
}

// === Nowy System Ticketów ===
const FORMS = {
  zakup: [
    { id: "pyt1", label: "Co chcesz kupić?", placeholder: "Przykład: odłamki " },
    { id: "pyt2", label: "Na jakim trybie?", placeholder: "Przykład: boxpvp" },
  ],
  pomoc: [
    { id: "pyt1", label: "Opisz problem", placeholder: "Napisz dokładnie, z czym potrzebujesz pomocy" },
  ],
  snajperka: [
    { id: "pyt1", label: "Co masz komputer czy laptop", placeholder: "komputer" },
  ],
  drop: [
    { id: "pyt1", label: "Co wygrałeś?", placeholder: "np 1k" },
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
  new SlashCommandBuilder().setName("panel").setDescription("📩 Wyślij panel ticketów"),
  new SlashCommandBuilder()
    .setName("opinia")
    .setDescription("💬 Dodaj opinię o sprzedawcy")
    .addStringOption(opt =>
      opt.setName("sprzedawca").setDescription("Wybierz sprzedawcę").setRequired(true)
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
    .addStringOption(opt => opt.setName("tresc").setDescription("Co chcesz zaproponować?").setRequired(true)),
  new SlashCommandBuilder().setName("legitcheck").setDescription("✅ Potwierdź transakcję (legit check)")
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

// === Eventy ===
client.once("ready", () => console.log(`✅ Zalogowano jako ${client.user.tag}`));

// 📩 Komenda /panel (ręczne wysłanie menu)
client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === "panel") {
    const channel = interaction.channel;

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
      .setTitle("🎟️ Leg Shop × UTWÓRZ ZGŁOSZENIE")
      .setDescription("Wybierz kategorię zgłoszenia z menu poniżej, aby rozpocząć rozmowę z supportem.")
      .setColor("#2b2d31");

    await channel.send({ embeds: [embed], components: [menu] });
    await interaction.reply({ content: "✅ Panel wysłany!", ephemeral: true });
  }
});

// 🪙 System ticketów (formularze + tworzenie kanałów)
client.on("interactionCreate", async (interaction) => {
  // Wybór kategorii
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {
    const category = interaction.values[0];
    const form = FORMS[category];
    if (!form) return interaction.reply({ content: "❌ Nie znaleziono formularza dla tej kategorii!", ephemeral: true });

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

  // Obsługa formularza
  if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith("ticket_modal_")) {
    const [_, __, category, userId] = interaction.customId.split("_");
    const form = FORMS[category];
    const categoryId = CATEGORY_MAP[category];
    if (!form || !categoryId) return interaction.reply({ content: "Błąd konfiguracji!", ephemeral: true });

    const user = interaction.user;

    const channel = await interaction.guild.channels.create({
      name: `${category}-${user.username}`.substring(0, 90),
      type: 0,
      parent: categoryId,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: process.env.SUPPORT_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      ],
    });

    const embed = new EmbedBuilder()
      .setTitle(`🎟️ Ticket — ${category}`)
      .setColor("#2b2d31")
      .setThumbnail(user.displayAvatarURL())
      .addFields({ name: "👤 Użytkownik", value: `${user} (${user.username})`, inline: false });

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

    // Logi
    const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle("🗂️ Nowy Ticket")
        .addFields(
          { name: "Użytkownik", value: `${user.tag}`, inline: true },
          { name: "Kategoria", value: category, inline: true },
          { name: "Kanał", value: `${channel}`, inline: false }
        )
        .setColor("#00FF88")
        .setTimestamp();
      await logChannel.send({ embeds: [logEmbed] });
    }
  }

  // Przyciski supportu
  if (interaction.isButton()) {
    const member = interaction.member;
    if (!member.roles.cache.has(process.env.SUPPORT_ROLE_ID)) {
      return interaction.reply({ content: "⛔ Nie masz uprawnień do tej akcji.", ephemeral: true });
    }

    if (interaction.customId === "close_ticket") {
      await interaction.reply({ content: "🗑 Ticket zostanie zamknięty za 5 sekund...", ephemeral: true });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    } else if (interaction.customId === "claim_ticket") {
      await interaction.reply({ content: `📌 Ticket przejęty przez ${interaction.user}`, ephemeral: false });
    } else if (interaction.customId === "ping_user") {
      await interaction.reply({ content: `📨 Wezwanie dla autora ticketa!`, ephemeral: false });
    }
  }

  // --- /drop, /opinia, /propozycja, /legitcheck ---
  if (interaction.isChatInputCommand() && interaction.commandName === "drop") {
    if (interaction.channelId !== DROP_CHANNEL_ID)
      return interaction.reply({ content: `❌ Użyj /drop tylko w <#${DROP_CHANNEL_ID}>!`, ephemeral: true });

    const userId = interaction.user.id;
    const now = Date.now();
    if (cooldowns.has(userId)) {
      const expires = cooldowns.get(userId) + COOLDOWN_TIME;
      if (now < expires) {
        const left = Math.ceil((expires - now) / 60000);
        return interaction.reply({ content: `⏳ Poczekaj ${left} minut przed kolejnym dropem!`, ephemeral: true });
      }
    }

    const wynik = losujDrop(dropTable);
    cooldowns.set(userId, now);

    if (wynik === "💀 Pusty drop")
      await interaction.reply("❌ Niestety, nic nie wypadło!");
    else
      await interaction.reply(`🎁 Gratulacje! Trafiłeś: **${wynik}**`);
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "opinia") {
    const sprzedawca = interaction.options.getString("sprzedawca");
    const ocena = interaction.options.getString("ocena");

    const embed = new EmbedBuilder()
      .setTitle("📩 Nowa opinia!")
      .setDescription(`💬 **Użytkownik:** ${interaction.user.username}`)
      .addFields(
        { name: "🧑 Sprzedawca", value: sprzedawca, inline: true },
        { name: "⭐ Ocena", value: `${ocena}/5`, inline: true }
      )
      .setColor(0x00AEFF)
      .setFooter({ text: "Dziękujemy za opinię 💙" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "propozycja") {
    const tresc = interaction.options.getString("tresc");
    const embed = new EmbedBuilder()
      .setTitle("💡 Nowa propozycja")
      .setDescription(tresc)
      .setColor(0x00FFAA)
      .setFooter({ text: `Propozycja od ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "legitcheck") {
    const embed = new EmbedBuilder()
      .setTitle("✅ Legitcheck")
      .setDescription("💫 Dziękujemy za zaufanie!")
      .addFields(
        { name: "👤 Sprzedawca", value: `${interaction.user}` },
        { name: "💵 Status", value: "✅ Klient otrzymał swoje zamówienie" }
      )
      .setColor(0x00FF00)
      .setFooter({ text: "System LegitCheck × WrGr Shop" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

// === Login ===
client.login(process.env.TOKEN);
