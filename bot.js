const { 
  Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder,
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle
} = require('discord.js');
require('dotenv').config();
const express = require('express');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// --- Express keepalive ---
const app = express();
app.get('/', (req, res) => res.send('Bot działa!'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🌐 Keepalive listening on port ${port}`));

// --- Kanały i cooldowns ---
const DROP_CHANNEL_ID = process.env.DROP_CHANNEL_ID;
const OPINIA_CHANNEL_ID = process.env.OPINIA_CHANNEL_ID;
const WERYFIKACJA_CHANNEL_ID = process.env.WERYFIKACJA_CHANNEL_ID;

const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 60 * 1000; // 1h

// --- Drop ---
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

// --- Weryfikacja ---
const dzialaniaMap = new Map(); // userId -> wynik
const panelSent = new Set(); // userId -> czy panel wysłany

function losoweDzialanie() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  return { dzialanie: `${a} + ${b}`, wynik: a + b };
}

// --- Rejestracja komend ---
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

  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('📋 Wyślij panel weryfikacyjny')
].map(cmd => cmd.toJSON());

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
client.on('interactionCreate', async interaction => {

  // --- /drop ---
  if (interaction.isChatInputCommand() && interaction.commandName === 'drop') {
    if (interaction.channelId !== DROP_CHANNEL_ID) {
      return interaction.reply({ content: `❌ Komenda /drop tylko w <#${DROP_CHANNEL_ID}>`, ephemeral: true });
    }
    const userId = interaction.user.id;
    const now = Date.now();
    if (cooldowns.has(userId)) {
      const expiration = cooldowns.get(userId) + COOLDOWN_TIME;
      if (now < expiration) {
        const remaining = Math.ceil((expiration - now)/60000);
        return interaction.reply({ content: `⏳ Musisz poczekać ${remaining} minut!`, ephemeral: true });
      }
    }
    const nagroda = losujDrop(dropTable);
    cooldowns.set(userId, now);
    await interaction.reply(nagroda === '💀 Pusty drop' ? '❌ Niestety nic nie wypadło!' : `🎁 Trafiłeś: **${nagroda}**`);
  }

  // --- /opinia ---
  if (interaction.isChatInputCommand() && interaction.commandName === 'opinia') {
    if (interaction.channelId !== OPINIA_CHANNEL_ID) {
      return interaction.reply({ content: `❌ Komenda /opinia tylko w <#${OPINIA_CHANNEL_ID}>`, ephemeral: true });
    }
    const sprzedawca = interaction.options.getString('sprzedawca');
    const ocena = interaction.options.getString('ocena');
    const embed = new EmbedBuilder()
      .setTitle('📩 Nowa opinia!')
      .setDescription(`💬 **Użytkownik:** ${interaction.user.username}`)
      .addFields(
        { name: '🧑 Sprzedawca', value: sprzedawca, inline: true },
        { name: '⭐ Ocena', value: `${ocena}/5`, inline: true },
      )
      .setColor(0x00AEFF)
      .setFooter({ text: 'Dziękujemy za opinię 💙' })
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }

  // --- /panel ---
  if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {
    if (interaction.channelId !== WERYFIKACJA_CHANNEL_ID) {
      return interaction.reply({ content: '❌ Panel tylko w kanale weryfikacji!', ephemeral: true });
    }
    if (panelSent.has(interaction.user.id)) {
      return interaction.reply({ content: '❌ Panel już wysłany.', ephemeral: true });
    }
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

  // --- Guzik weryfikacyjny ---
  if (interaction.isButton() && interaction.customId === 'verify_button') {
    const los = losoweDzialanie();
    dzialaniaMap.set(interaction.user.id, los.wynik);

    const modal = new ModalBuilder()
      .setCustomId('verify_modal')
      .setTitle('🛡️ Weryfikacja')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('wynik_input')
            .setLabel(`Podaj wynik działania: ${los.dzialanie}`)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      );

    await interaction.showModal(modal);

    setTimeout(() => {
      if (dzialaniaMap.has(interaction.user.id)) {
        dzialaniaMap.delete(interaction.user.id);
        panelSent.delete(interaction.user.id); // można ponownie wysłać panel
      }
    }, 30000); // 30 sekund
  }

  // --- Modal weryfikacyjny ---
  if (interaction.isModalSubmit() && interaction.customId === 'verify_modal') {
    const odpowiedz = parseInt(interaction.fields.getTextInputValue('wynik_input'));
    const poprawny = dzialaniaMap.get(interaction.user.id);

    dzialaniaMap.delete(interaction.user.id);
    panelSent.delete(interaction.user.id); // można ponownie wysłać panel

    if (odpowiedz === poprawny) {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      const role = interaction.guild.roles.cache.find(r => r.name === 'WrGr Shop');
      if (role) await member.roles.add(role);
      await interaction.reply({ content: `✅ Poprawnie! Otrzymałeś rolę **${role.name}**.`, ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Błędna odpowiedź lub czas minął. Spróbuj ponownie.', ephemeral: true });
    }
  }

});

// --- Login bota ---
client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

client.login(process.env.TOKEN);
