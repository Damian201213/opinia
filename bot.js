require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Komenda /opinia
const commands = [
  new SlashCommandBuilder()
    .setName('opinia')
    .setDescription('Wyślij opinię o sprzedawcy')
    .addStringOption(option =>
      option.setName('sprzedawca')
        .setDescription('Wybierz sprzedawcę')
        .setRequired(true)
        .addChoices(
          { name: '@Weryfikacja_', value: 'Weryfikacja_' },
          { name: 'mojawersja', value: 'mojawersja' },
          { name: 'spoconymacis247', value: 'spoconymacis247' }
        )
    )
    .addStringOption(option =>
      option.setName('ocena')
        .setDescription('Twoja ocena')
        .setRequired(true)
        .addChoices(
          { name: '1', value: '1' },
          { name: '2', value: '2' },
          { name: '3', value: '3' },
          { name: '4', value: '4' },
          { name: '5', value: '5' }
        )
    )
].map(cmd => cmd.toJSON());

// Rejestracja komend
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

// Express dla uptime
const app = express();
app.get('/', (req, res) => res.send('Bot działa!'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Keepalive listening on port ${port}`));

// Obsługa komendy /opinia
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'opinia') {
    const sprzedawca = interaction.options.getString('sprzedawca');
    const ocena = interaction.options.getString('ocena');

    const opinieChannel = interaction.guild.channels.cache.get(process.env.OPINIE_CHANNEL_ID);
    if (opinieChannel) {
      opinieChannel.send(
        `📩 Nowa opinia od ${interaction.user.tag}:\n` +
        `Sprzedawca: ${sprzedawca}\n` +
        `Ocena: ${ocena}/5`
      );
    }

    await interaction.reply({ content: '✅ Twoja opinia została wysłana!', ephemeral: true });
  }
});

client.once('clientReady', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

client.login(process.env.TOKEN);
