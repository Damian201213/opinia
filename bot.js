// === Importy i konfiguracja ===
const { 
  Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, 
  ActionRowBuilder, TextInputBuilder, TextInputStyle, ModalBuilder, InteractionType 
} = require('discord.js');
require('dotenv').config();
const express = require('express');

// === Uptime Pinger / Express ===
const app = express();
app.get('/', (req, res) => res.send('Bot działa!'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Keepalive listening on port ${port}`));

// === Tworzenie klienta Discord ===
const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
] });

// === Drop ===
const DROP_CHANNEL_ID = process.env.DROP_CHANNEL_ID;
const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 60 * 1000; // 1 godzina

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

// === Licznik LegitCheck ===
let legitCounter = 1;

// === Slash Commands ===
const commands = [
  new SlashCommandBuilder()
    .setName('drop')
    .setDescription('🎁 Otwórz drop i wylosuj nagrodę!'),
  new SlashCommandBuilder()
    .setName('opinia')
    .setDescription('💬 Dodaj opinię o sprzedawcy')
    .addStringOption(option =>
      option.setName('sprzedawca')
        .setDescription('Wybierz sprzedawcę')
        .setRequired(true)
        .addChoices(
          { name: 'Weryfikacja_', value: 'Weryfikacja_' },
          { name: 'mojawersja', value: 'mojawersja' },
          { name: 'spoconymacis247', value: 'spoconymacis247' }
        ))
    .addStringOption(option =>
      option.setName('ocena')
        .setDescription('Ocena 1–5')
        .setRequired(true)
        .addChoices(
          { name: '⭐ 1', value: '1' },
          { name: '⭐⭐ 2', value: '2' },
          { name: '⭐⭐⭐ 3', value: '3' },
          { name: '⭐⭐⭐⭐ 4', value: '4' },
          { name: '⭐⭐⭐⭐⭐ 5', value: '5' }
        )),
  new SlashCommandBuilder()
    .setName('propozycja')
    .setDescription('💡 Dodaj propozycję')
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
client.on('interactionCreate', async (interaction) => {

  // --- /drop ---
  if (interaction.isChatInputCommand() && interaction.commandName === 'drop') {
    if (interaction.channelId !== DROP_CHANNEL_ID)
      return interaction.reply({ content: `❌ Komenda /drop może być używana tylko na <#${DROP_CHANNEL_ID}>!`, ephemeral: true });

    const userId = interaction.user.id;
    const now = Date.now();

    if (cooldowns.has(userId)) {
      const expiration = cooldowns.get(userId) + COOLDOWN_TIME;
      if (now < expiration) {
        const remaining = Math.ceil((expiration - now)/60000);
        return interaction.reply({ content: `⏳ Musisz poczekać jeszcze ${remaining} minut zanim użyjesz /drop!`, ephemeral: true });
      }
    }

    const nagroda = losujDrop(dropTable);
    cooldowns.set(userId, now);

    if (nagroda === '💀 Pusty drop') {
      await interaction.reply('❌ Niestety, tym razem nic nie wypadło!');
    } else {
      await interaction.reply(`🎁 Gratulacje! Trafiłeś: **${nagroda}**`);
    }
  }

  // --- /opinia ---
  if (interaction.isChatInputCommand() && interaction.commandName === 'opinia') {
    const sprzedawca = interaction.options.getString('sprzedawca');
    const ocena = interaction.options.getString('ocena');

    const embed = new EmbedBuilder()
      .setTitle('📩 Nowa opinia!')
      .setDescription(`💬 **Użytkownik:** ${interaction.user.username}`)
      .addFields(
        { name: '🧑 Sprzedawca', value: sprzedawca, inline: true },
        { name: '⭐ Ocena', value: `${ocena}/5`, inline: true }
      )
      .setColor(0x00AEFF)
      .setFooter({ text: 'Dziękujemy za opinię 💙' })
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();

    const channel = interaction.guild.channels.cache.get(process.env.OPINION_CHANNEL_ID);
    if (!channel) return interaction.reply({ content: '❌ Nie mogę znaleźć kanału opinii!', ephemeral: true });
    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Twoja opinia została wysłana!', ephemeral: true });
  }

  // --- /propozycja ---
  if (interaction.isChatInputCommand() && interaction.commandName === 'propozycja') {
    const modal = new ModalBuilder()
      .setCustomId(`proposal_modal_${interaction.user.id}`)
      .setTitle('💡 Dodaj propozycję');

    const proposalInput = new TextInputBuilder()
      .setCustomId('proposal')
      .setLabel('Co chcesz zaproponować?')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(proposalInput));
    await interaction.showModal(modal);
  }

  // --- Obsługa modala propozycji ---
  if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith('proposal_modal_')) {
    const userId = interaction.customId.split('_')[2];
    if (interaction.user.id !== userId) return interaction.reply({ content: '❌ To nie twoja propozycja!', ephemeral: true });

    const proposal = interaction.fields.getTextInputValue('proposal');
    const embed = new EmbedBuilder()
      .setTitle('💡 Nowa propozycja!')
      .setDescription(`💬 **Użytkownik:** ${interaction.user.username}`)
      .addFields({ name: 'Propozycja', value: proposal })
      .setColor(0xFFD700)
      .setTimestamp();

    const channel = interaction.guild.channels.cache.get(process.env.PROPOSAL_CHANNEL_ID);
    if (!channel) return interaction.reply({ content: '❌ Nie mogę znaleźć kanału propozycji!', ephemeral: true });
    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Twoja propozycja została wysłana!', ephemeral: true });
  }

});

// --- Automatyczny LegitCheck dla każdej wiadomości ---
client.on('messageCreate', async (message) => {
  if (message.channel.id !== process.env.LEGIT_CHANNEL_ID || message.author.bot) return;

  let imageUrl = null;
  if (message.attachments.size > 0) {
    imageUrl = message.attachments.first().url;
  } else {
    const urlMatch = message.content.match(/https?:\/\/\S+\.(png|jpg|jpeg|gif|webp)/i);
    if (urlMatch) imageUrl = urlMatch[0];
  }

  if (!imageUrl) return;

  const embed = new EmbedBuilder()
    .setTitle(`✅ Legitcheck ${legitCounter}`)
    .setDescription(`💫 × Dziękujemy wam za zaufanie\n👤 × Seller: ${message.author}`)
    .addFields(
      { name: '💵 Dowód:', value: imageUrl }
    )
    .setImage(imageUrl)
    .setColor(0x00FF00)
    .setFooter({ text: 'System legitcheck × Leg Shop' })
    .setTimestamp();

  await message.channel.send({ embeds: [embed] });
  await message.delete(); // opcjonalnie
  legitCounter++;
});

// === Login bota ===
client.once('ready', () => console.log(`✅ Zalogowano jako ${client.user.tag}`));
client.login(process.env.TOKEN);
