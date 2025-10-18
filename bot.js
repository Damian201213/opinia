// === Importy i konfiguracja ===
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
require('dotenv').config();
const express = require('express');

// === Express keepalive (Render / Replit) ===
const app = express();
app.get('/', (req, res) => res.send('Bot działa!'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🌐 Keepalive listening on port ${port}`));

// === Tworzenie klienta Discord ===
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// === Dane dropu i cooldown ===
const DROP_CHANNEL_ID = process.env.DROP_CHANNEL_ID || '1428466122432315472';
const OPINIA_CHANNEL_ID = process.env.OPINIA_CHANNEL_ID;
const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 60 * 1000; // 1 godzina

const dropTable = [
  { item: '💎 Schemat pół auto totki', chance: 5 },
  { item: '🪙 1k na anarchi', chance: 5 },
  { item: '🥇 Mały ms', chance: 5 },
  { item: '🥇 Własna ranga (do wyboru)', chance: 5 },
  { item: '💀 Pusty drop', chance: 80 },
];

// === Funkcja losowania dropu ===
function losujDrop(table) {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const drop of table) {
    cumulative += drop.chance;
    if (rand < cumulative) return drop.item;
  }
  return '💀 Nic...';
}

// === Funkcja losowego działania matematycznego ===
function losoweDzialanie() {
  const a = Math.floor(Math.random() * 10) + 1; // 1-10
  const b = Math.floor(Math.random() * 10) + 1; // 1-10
  const wynik = a + b;
  return { dzialanie: `${a} + ${b}`, wynik };
}

// === Rejestracja komend ===
const commands = [
  // /drop
  new SlashCommandBuilder()
    .setName('drop')
    .setDescription('🎁 Otwórz drop i wylosuj nagrodę!'),

  // /opinia
  new SlashCommandBuilder()
    .setName('opinia')
    .setDescription('💬 Dodaj opinię o sprzedawcy')
    .addStringOption(option =>
      option
        .setName('sprzedawca')
        .setDescription('Wybierz sprzedawcę')
        .setRequired(true)
        .addChoices(
          { name: 'Weryfikacja_', value: 'Weryfikacja_' },
          { name: 'mojawersja', value: 'mojawersja' },
          { name: 'spoconymacis247', value: 'spoconymacis247' },
        ))
    .addStringOption(option =>
      option
        .setName('ocena')
        .setDescription('Ocena 1–5')
        .setRequired(true)
        .addChoices(
          { name: '⭐ 1', value: '1' },
          { name: '⭐⭐ 2', value: '2' },
          { name: '⭐⭐⭐ 3', value: '3' },
          { name: '⭐⭐⭐⭐ 4', value: '4' },
          { name: '⭐⭐⭐⭐⭐ 5', value: '5' },
        )),

  // /weryfikacja
  new SlashCommandBuilder()
    .setName('weryfikacja')
    .setDescription('🛡️ Zweryfikuj się klikając guzik!'),

  // /panel
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

// === Obsługa interakcji ===
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // --- /drop ---
  if (interaction.commandName === 'drop') {
    if (interaction.channelId !== DROP_CHANNEL_ID) {
      return interaction.reply({ content: `❌ Komenda /drop może być używana tylko na <#${DROP_CHANNEL_ID}>!`, ephemeral: true });
    }

    const userId = interaction.user.id;
    const now = Date.now();

    if (cooldowns.has(userId)) {
      const expirationTime = cooldowns.get(userId) + COOLDOWN_TIME;
      if (now < expirationTime) {
        const remaining = Math.ceil((expirationTime - now) / 60000);
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
  if (interaction.commandName === 'opinia') {
    const sprzedawca = interaction.options.getString('sprzedawca');
    const ocena = interaction.options.getString('ocena');

    const embed = new EmbedBuilder()
      .setTitle('📩 Nowa opinia!')
      .setDescription(`💬 Użytkownik: **${interaction.user.username}**`)
      .addFields(
        { name: '🧑 Sprzedawca', value: sprzedawca, inline: true },
        { name: '⭐ Ocena', value: `${ocena}/5`, inline: true },
      )
      .setColor(0x00AEFF)
      .setFooter({ text: 'Dziękujemy za opinię 💙' })
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();

    const kanal = client.channels.cache.get(OPINIA_CHANNEL_ID);
    if (kanal) kanal.send({ embeds: [embed] });

    await interaction.reply({ content: '✅ Twoja opinia została wysłana!', ephemeral: true });
  }

  // --- /weryfikacja ---
  if (interaction.commandName === 'weryfikacja') {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Weryfikacja')
      .setDescription('Aby się zweryfikować, naciśnij guzik poniżej!')
      .setColor(0x00FF00)
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('verify_button')
      .setLabel('Zweryfikuj')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  // --- /panel ---
  if (interaction.commandName === 'panel') {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Panel weryfikacyjny')
      .setDescription('Aby się zweryfikować, kliknij zielony guzik poniżej!')
      .setColor(0x00FF00)
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('verify_button')
      .setLabel('Zweryfikuj')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ embeds: [embed], components: [row] });
  }
});

// --- Obsługa przycisku weryfikacji ---
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'verify_button') return;

  const los = losoweDzialanie();

  await interaction.update({ content: `✏️ Podaj wynik działania: ${los.dzialanie}`, embeds: [], components: [] });

  const filter = m => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 15000 });

  collector.on('collect', async msg => {
    if (parseInt(msg.content) === los.wynik) {
      const member = await interaction.guild.members.fetch(msg.author.id);
      const role = interaction.guild.roles.cache.find(r => r.name === 'WrGr Shop');
      if (role) await member.roles.add(role);

      await interaction.followUp({ content: `✅ Gratulacje! Otrzymałeś rolę **${role.name}**.`, ephemeral: true });
    } else {
      await interaction.followUp({ content: '❌ Błędna odpowiedź. Spróbuj ponownie.', ephemeral: true });
    }
  });

  collector.on('end', collected => {
    if (collected.size === 0) {
      interaction.followUp({ content: '⌛ Nie podałeś odpowiedzi na czas!', ephemeral: true });
    }
  });
});

// === Login bota ===
client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

client.login(process.env.TOKEN);
