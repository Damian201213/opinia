require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
const commands = [];

// === Funkcja do rekurencyjnego wczytywania komend z folderu i podfolderów ===
function loadCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      loadCommands(fullPath); // wczytaj podfolder
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    }
  }
}

// Wczytaj wszystkie komendy z folderu 'commands'
loadCommands(path.join(__dirname, 'commands'));

// === Rejestracja komend na serwerze Discord ===
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

// === Express dla Uptime Pinger ===
const app = express();
app.get('/', (req, res) => res.send('Bot działa!'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Keepalive listening on port ${port}`));

// === Obsługa komend slash i modal ===
client.on('interactionCreate', async interaction => {
  // Slash command
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Błąd podczas wykonywania komendy!', ephemeral: true });
    }
  }

  // Modal (np. jeśli chcesz użyć formularza w przyszłości)
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'opiniaModal') {
      const sprzedawca = interaction.fields.getTextInputValue('sprzedawca');
      const ocena = interaction.fields.getTextInputValue('ocena');
      const szybkosci = interaction.fields.getTextInputValue('szybkosc');

      const opinieChannel = interaction.guild.channels.cache.get(process.env.OPINIE_CHANNEL_ID);
      if (opinieChannel) {
        opinieChannel.send(
          `📩 Nowa opinia od ${interaction.user.tag}:\n` +
          `Sprzedawca: ${sprzedawca}\n` +
          `Ocena: ${ocena}/5\n` +
          `Szybkość: ${szybkosc}/5`
        );
      }

      await interaction.reply({ content: '✅ Twoja opinia została wysłana!', ephemeral: true });
    }
  }
});

// === Login bota ===
client.once('clientReady', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

client.login(process.env.TOKEN);