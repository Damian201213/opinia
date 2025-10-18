// deploy-commands.js
require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const commands = [
  new SlashCommandBuilder()
    .setName('setup-ticket')
    .setDescription('Wystawia panel ticketów w wybranym kanale (potrzebne: Manage Messages).')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env[config.botTokenEnvVarName]);

(async () => {
  try {
    console.log('Deploying commands...');
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
    console.log('Commands deployed.');
  } catch (err) {
    console.error(err);
  }
})();
