const { 
  Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder,
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType
} = require('discord.js');
require('dotenv').config();
const express = require('express');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// --- Express keepalive ---
const app = express();
app.get('/', (req, res) => res.send('Bot działa!'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🌐 Keepalive listening on port ${port}`));

// === Konfiguracja ===
const DROP_CHANNEL_ID = process.env.DROP_CHANNEL_ID;
const WERYFIKACJA_CHANNEL_ID = process.env.WERYFIKACJA_CHANNEL_ID;
const SUGGESTIONS_CHANNEL_ID = process.env.SUGGESTIONS_CHANNEL_ID;
const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 60 * 1000; // 1 godzina

// --- Drop table ---
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

// --- Komendy ---
const commands = [
  new SlashCommandBuilder().setName('drop').setDescription('🎁 Otwórz drop i wylosuj nagrodę!'),
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
              { name: 'spoconymacis247', value: 'spoconymacis247' },
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
              { name: '⭐⭐⭐⭐⭐ 5', value: '5' },
            )),
  new SlashCommandBuilder().setName('panel').setDescription('📋 Wyślij panel weryfikacyjny'),
  new SlashCommandBuilder().setName('propozycja').setDescription('💡 Wyślij propozycję do serwera')
].map(cmd => cmd.toJSON());

// --- REST i rejestracja ---
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Rejestrowanie komend...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Komendy zarejestrowane!');
  } catch (error) {
    console.error(error);
  }
})();

// --- Obsługa interakcji ---
const panelSent = new Set();

client.on('interactionCreate', async interaction => {

  // === /drop ===
  if (interaction.isChatInputCommand() && interaction.commandName === 'drop') {
    if (interaction.channelId !== DROP_CHANNEL_ID) {
      return interaction.reply({ content: `❌ Komenda /drop tylko w <#${DROP_CHANNEL_ID}>!`, ephemeral: true });
    }
    const userId = interaction.user.id;
    const now = Date.now();
    if (cooldowns.has(userId)) {
      const expTime = cooldowns.get(userId) + COOLDOWN_TIME;
      if (now < expTime) {
        const remaining = Math.ceil((expTime - now)/60000);
        return interaction.reply({ content: `⏳ Musisz poczekać ${remaining} min. przed kolejnym dropem!`, ephemeral: true });
      }
    }
    const nagroda = losujDrop(dropTable);
    cooldowns.set(userId, now);
    await interaction.reply(nagroda === '💀 Pusty drop' ? '❌ Niestety nic nie wypadło!' : `🎁 Trafiłeś: **${nagroda}**`);
  }

  // === /opinia ===
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

    await interaction.reply({ embeds: [embed] });
  }

  // === /panel weryfikacji ===
  if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {
    if (interaction.channelId !== WERYFIKACJA_CHANNEL_ID) return interaction.reply({ content: '❌ Panel tylko w kanale weryfikacji!', ephemeral: true });
    if (panelSent.has(interaction.user.id)) return interaction.reply({ content: '❌ Panel już wysłany.', ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('🛡️ Panel weryfikacyjny')
      .setDescription('Kliknij guzik, aby się zweryfikować!')
      .setColor(0x00FF00);

    const button = new ButtonBuilder()
      .setCustomId('verify_button')
      .setLabel('Zweryfikuj')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ embeds: [embed], components: [row] });
    panelSent.add(interaction.user.id);
  }

  // === Kliknięcie guzika weryfikacyjnego ===
  if (interaction.isButton() && interaction.customId === 'verify_button') {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const role = interaction.guild.roles.cache.find(r => r.name === 'WrGr Shop');
    if (!role) return interaction.reply({ content: '❌ Rola WrGr Shop nie istnieje!', ephemeral: true });

    const botMember = await interaction.guild.members.fetch(client.user.id);
    if (role.position >= botMember.roles.highest.position) return interaction.reply({ content: '❌ Nie mogę nadać tej roli – jest wyżej niż moja najwyższa rola!', ephemeral: true });

    await member.roles.add(role);
    await interaction.reply({ content: `✅ Otrzymałeś rolę **${role.name}**!`, ephemeral: true });
    panelSent.delete(interaction.user.id);
  }

  // === /propozycja ===
  if (interaction.isChatInputCommand() && interaction.commandName === 'propozycja') {
    const modal = new ModalBuilder()
      .setCustomId('suggestion_modal')
      .setTitle('💡 Propozycja serwera');

    const input = new TextInputBuilder()
      .setCustomId('suggestion_input')
      .setLabel('Co chcesz zaproponować?')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  // --- Po wysłaniu formularza propozycji ---
  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'suggestion_modal') {
    const suggestion = interaction.fields.getTextInputValue('suggestion_input');
    const channel = interaction.guild.channels.cache.get(SUGGESTIONS_CHANNEL_ID);
    if (!channel) return interaction.reply({ content: '❌ Nie mogę znaleźć kanału propozycji!', ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('💡 Nowa propozycja')
      .setDescription(suggestion)
      .setFooter({ text: `Autor: ${interaction.user.tag}` })
      .setTimestamp()
      .setColor(0x00AEFF);

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Twoja propozycja została wysłana!', ephemeral: true });
  }

});

// --- Login bota ---
client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

client.login(process.env.TOKEN);
