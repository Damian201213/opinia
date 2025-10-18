const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const express = require('express');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// === UTRZYMANIE PRZY ŻYCIU (Render ping) ===
const app = express();
app.get('/', (req, res) => res.send('Bot działa!'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Keepalive listening on port ${port}`));

// === KOMENDA /opinia ===
const commands = [
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
        ))
].map(cmd => cmd.toJSON());

// === REJESTRACJA KOMENDY ===
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Rejestrowanie komendy /opinia...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Komenda /opinia zarejestrowana!');
  } catch (error) {
    console.error(error);
  }
})();

// === OBSŁUGA KOMEND ===
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'opinia') {
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
});

client.once('clientReady', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

client.login(process.env.TOKEN);
