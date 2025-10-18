// === Importy ===
const { 
  Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, StringSelectMenuBuilder
} = require('discord.js');
require('dotenv').config();
const express = require('express');

// === Express / uptime ===
const app = express();
app.get('/', (req, res) => res.send('Bot działa!'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Keepalive listening on port ${port}`));

// === Discord Client ===
const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
] });

// === Stałe i konfiguracje ===
const DROP_CHANNEL_ID = process.env.DROP_CHANNEL_ID;
const OWNER_ID = process.env.OWNER_ID; // Twój Discord ID
const LOG_CHANNEL_ID = process.env.TICKET_LOG_CHANNEL; // kanał logów

// === Drop ===
const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 60 * 1000; // 1h
const dropTable = [
  { item: '💎 Schemat pół auto totki', chance: 5 },
  { item: '🪙 1k na anarchi', chance: 5 },
  { item: '🥇 Mały ms', chance: 5 },
  { item: '🥇 Własna ranga (do wyboru)', chance: 5 },
  { item: '💀 Pusty drop', chance: 80 },
];
function losujDrop(table) {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const drop of table) {
    cumulative += drop.chance;
    if (rand < cumulative) return drop.item;
  }
  return '💀 Nic...';
}

// === Kategorie ticketów ===
const ticketCategories = [
  {
    label: 'Zakup',
    id: 'zakupy',
    channelId: process.env.TICKET_CHANNEL_ZAKUPY,
    fields: [
      { id: 'nick_mc', label: 'Twój nick w Minecraft', style: TextInputStyle.Short, required: true },
      { id: 'produkt', label: 'Produkt do zakupu', style: TextInputStyle.Paragraph, required: true }
    ]
  },
  {
    label: 'Problem',
    id: 'tech',
    channelId: process.env.TICKET_CHANNEL_TECH,
    fields: [
      { id: 'opis_problemu', label: 'Opisz problem', style: TextInputStyle.Paragraph, required: true }
    ]
  },
  {
    label: 'Wygrana w /drop',
    id: 'drop',
    channelId: process.env.TICKET_CHANNEL_DROP,
    fields: [
      { id: 'co_wygrales', label: 'Co wygrałeś?', style: TextInputStyle.Paragraph, required: true }
    ]
  },
  {
    label: 'Sprawa do właściciela',
    id: 'wlasciciel',
    channelId: process.env.TICKET_CHANNEL_WLASCICIEL,
    fields: [
      { id: 'sprawa', label: 'Jaką masz sprawę?', style: TextInputStyle.Paragraph, required: true }
    ]
  },
  {
    label: 'Snajperka',
    id: 'snajperka',
    channelId: process.env.TICKET_CHANNEL_SNIPER,
    fields: [
      { id: 'komputer_laptop', label: 'Masz komputer czy laptopa?', style: TextInputStyle.Short, required: true }
    ]
  },
  {
    label: 'Inne',
    id: 'inne',
    channelId: process.env.TICKET_CHANNEL_INNE,
    fields: [
      { id: 'inne_opis', label: 'Napisz o co chodzi', style: TextInputStyle.Paragraph, required: true }
    ]
  }
];

// === Komendy ===
const commands = [
  new SlashCommandBuilder().setName('drop').setDescription('🎁 Otwórz drop i wylosuj nagrodę!'),
  new SlashCommandBuilder().setName('panel').setDescription('📌 Wyślij panel ticketów publicznie'),
  new SlashCommandBuilder().setName('opinia').setDescription('💬 Dodaj opinię o sprzedawcy')
    .addStringOption(option =>
      option.setName('sprzedawca').setDescription('Wybierz sprzedawcę').setRequired(true)
      .addChoices(
        { name: 'Weryfikacja_', value: 'Weryfikacja_' },
        { name: 'mojawersja', value: 'mojawersja' },
        { name: 'spoconymacis247', value: 'spoconymacis247' }
      ))
    .addStringOption(option =>
      option.setName('ocena').setDescription('Ocena 1–5').setRequired(true)
      .addChoices(
        { name: '⭐ 1', value: '1' },
        { name: '⭐⭐ 2', value: '2' },
        { name: '⭐⭐⭐ 3', value: '3' },
        { name: '⭐⭐⭐⭐ 4', value: '4' },
        { name: '⭐⭐⭐⭐⭐ 5', value: '5' }
      )
    ),
  new SlashCommandBuilder().setName('propozycja').setDescription('💡 Wyślij propozycję').addStringOption(opt => 
    opt.setName('tresc').setDescription('Co chcesz zaproponować?').setRequired(true)
  )
].map(cmd => cmd.toJSON());

// === Rejestracja komend ===
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
  try {
    console.log('🔄 Rejestrowanie komend...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Komendy zarejestrowane!');
  } catch (err) { console.error(err); }
})();

// === Obsługa interakcji ===
client.on('interactionCreate', async interaction => {

  // --- /drop ---
  if (interaction.isChatInputCommand() && interaction.commandName === 'drop') {
    if (interaction.channelId !== DROP_CHANNEL_ID)
      return interaction.reply({ content: `❌ Komenda /drop może być używana tylko na <#${DROP_CHANNEL_ID}>!`, ephemeral: true });

    const userId = interaction.user.id;
    const now = Date.now();
    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + COOLDOWN_TIME;
      if (now < expirationTime) {
        const remaining = Math.ceil((expirationTime - now) / 60000);
        return interaction.reply({ content: `⏳ Poczekaj jeszcze ${remaining} minut!`, ephemeral: true });
      }
    }

    const nagroda = losujDrop(dropTable);
    cooldowns.set(userId, now);

    if (nagroda === '💀 Pusty drop') await interaction.reply('❌ Niestety, nic nie wypadło!');
    else await interaction.reply(`🎁 Gratulacje! Trafiłeś: **${nagroda}**`);
  }

  // --- /panel ---
  if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {
    const openButton = new ButtonBuilder()
      .setCustomId('open_ticket')
      .setLabel('📩 Utwórz zgłoszenie')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(openButton);
    await interaction.channel.send({
      content: `🎫 **WrGr Tickety**\nKliknij przycisk poniżej, aby otworzyć zgłoszenie.`,
      components: [row]
    });
    await interaction.reply({ content: '✅ Panel został wysłany!', ephemeral: true });
  }

  // --- Kliknięcie przycisku ---
  if (interaction.isButton() && interaction.customId === 'open_ticket') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_select_category')
      .setPlaceholder('📂 Wybierz kategorię')
      .addOptions(ticketCategories.map(cat => ({ label: cat.label, value: cat.id })));

    const row = new ActionRowBuilder().addComponents(menu);
    await interaction.update({ content: '📋 Wybierz kategorię zgłoszenia:', components: [row] });
  }

  // --- Wybór kategorii ---
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select_category') {
    const categoryId = interaction.values[0];
    const category = ticketCategories.find(c => c.id === categoryId);
    if (!category) return;

    const modal = new ModalBuilder()
      .setCustomId(`ticket_modal_${category.id}_${interaction.user.id}`)
      .setTitle(`Nowy ticket: ${category.label}`);

    const rows = category.fields.map(f =>
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId(f.id).setLabel(f.label).setStyle(f.style).setRequired(f.required)
      )
    );

    modal.addComponents(...rows);
    await interaction.showModal(modal);
  }

  // --- Obsługa formularza ---
  if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith('ticket_modal_')) {
    const parts = interaction.customId.split('_');
    const categoryId = parts[2];
    const userId = parts[3];
    if (interaction.user.id !== userId)
      return interaction.reply({ content: '❌ To nie Twój ticket!', ephemeral: true });

    const category = ticketCategories.find(c => c.id === categoryId);
    if (!category) return;

    const guild = interaction.guild;
    const ticketName = `${interaction.user.username}-${category.id}`;

    const ticketChannel = await guild.channels.create({
      name: ticketName,
      type: 0,
      parent: category.channelId,
      permissionOverwrites: [
        { id: guild.id, deny: ['ViewChannel'] },
        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'AttachFiles'] },
        { id: OWNER_ID, allow: ['ViewChannel', 'SendMessages', 'ManageMessages'] }
      ]
    });

    const values = category.fields.map(f => ({
      name: f.label,
      value: interaction.fields.getTextInputValue(f.id)
    }));

    const embed = new EmbedBuilder()
      .setTitle(`🎫 Ticket - ${category.label}`)
      .setColor(0x00AEFF)
      .setDescription(`**Użytkownik:** ${interaction.user}`)
      .addFields(values)
      .setTimestamp()
      .setFooter({ text: `Ticket utworzony przez ${interaction.user.tag}` });

    await ticketChannel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Ticket utworzony: ${ticketChannel}`, ephemeral: true });

    // === Logi ===
    const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('🗂️ Nowy Ticket')
        .addFields(
          { name: 'Użytkownik', value: `${interaction.user.tag}`, inline: true },
          { name: 'Kategoria', value: category.label, inline: true },
          { name: 'Kanał', value: `${ticketChannel}`, inline: false }
        )
        .setColor(0x00FF88)
        .setTimestamp();
      await logChannel.send({ embeds: [logEmbed] });
    }
  }
});

// === Login ===
client.once('ready', () => console.log(`✅ Zalogowano jako ${client.user.tag}`));
client.login(process.env.TOKEN);
