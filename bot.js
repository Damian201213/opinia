import {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events,
  SlashCommandBuilder,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// ====== KLIENT ======
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

// ====== START ======
client.once(Events.ClientReady, () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

// ====== KOMENDY TEKSTOWE ======
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // --- !regulamin ---
  if (message.content === '!regulamin') {
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🔥 Lava Shop × REGULAMIN 🧾')
      .setDescription(`
**NIE ZAPOZNAJĄC SIĘ Z REGULAMINEM NIE ZWALNIA CIĘ Z JEGO PRZESTRZEGANIA!**

> 1️⃣ Wulgaryzmy i wyzwiska — przerwa lub ban.  
> 2️⃣ Nadmierne pingowanie — przerwa 1d.  
> 3️⃣ Reklama innego serwera — perm ban.  
> 4️⃣ Szanuj obsługę — każdy ma życie prywatne.  
> 5️⃣ Próby oszustwa — natychmiastowy ban.  
> 6️⃣ Admin ma prawo do kary po wielokrotnym ostrzeżeniu.

🧨 *Regulamin może ulec zmianie.*
`)
      .setFooter({ text: 'Lava Shop © 2025', iconURL: client.user.displayAvatarURL() });

    await message.channel.send({ embeds: [embed] });
  }
// --- KONFIGURACJA KURSÓW ---
const KURSY = {
  "anarchia.gg": {
    kupno: 3.5,
    sprzedaż: 2.8
  },
  "donutsmp": {
    kupno: 4.0,
    sprzedaż: 3.2
  }
};

// --- PRZYCISK i MODAL ---
if (message.content === '!kalkulator' || message.content === '/lc') {
  const embed = new EmbedBuilder()
    .setTitle('💰 Kalkulator transakcji')
    .setDescription('Kliknij przycisk poniżej, aby obliczyć wartość 💸')
    .setColor(0x5865f2);

  const button = new ButtonBuilder()
    .setCustomId('open_kalkulator')
    .setLabel('🧮 Otwórz kalkulator')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);
  await message.channel.send({ embeds: [embed], components: [row] });
}

// --- OBSŁUGA PRZYCISKU I MODALA ---
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // otwarcie modala
    if (interaction.isButton() && interaction.customId === 'open_kalkulator') {
      const modal = new ModalBuilder()
        .setCustomId('kalkulator_modal')
        .setTitle('💰 Kalkulator transakcji');

      const metoda = new TextInputBuilder()
        .setCustomId('metoda')
        .setLabel('Metoda płatności (PSC / BLIK / PayPal)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const typ = new TextInputBuilder()
        .setCustomId('typ')
        .setLabel('Kupno / Sprzedaż')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const serwer = new TextInputBuilder()
        .setCustomId('serwer')
        .setLabel('Serwer (Anarchia.gg / DonutSMP)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const kwota = new TextInputBuilder()
        .setCustomId('kwota')
        .setLabel('Kwota (zł)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(metoda),
        new ActionRowBuilder().addComponents(typ),
        new ActionRowBuilder().addComponents(serwer),
        new ActionRowBuilder().addComponents(kwota)
      );

      await interaction.showModal(modal);
      return;
    }

    // obsługa modala (submit)
    if (interaction.isModalSubmit() && interaction.customId === 'kalkulator_modal') {
      const metodaRaw = interaction.fields.getTextInputValue('metoda');
      const typRaw = interaction.fields.getTextInputValue('typ');
      const serwerRaw = interaction.fields.getTextInputValue('serwer');
      const kwotaRaw = interaction.fields.getTextInputValue('kwota');

      const metoda = metodaRaw.trim().toLowerCase();
      const typ = typRaw.trim().toLowerCase();
      const serwer = serwerRaw.trim().toLowerCase();
      const kwota = parseFloat(kwotaRaw.replace(',', '.'));

      const dozwoloneMetody = ['psc', 'blik', 'paypal'];
      const dozwoloneTypy = ['kupno', 'sprzedaz', 'sprzedaż', 'buy', 'sell'];

      if (!dozwoloneMetody.includes(metoda))
        return interaction.reply({ content: '❌ Niepoprawna metoda płatności.', flags: 64 });

      if (!dozwoloneTypy.includes(typ))
        return interaction.reply({ content: '❌ Niepoprawny typ (Kupno/Sprzedaż).', flags: 64 });

      if (isNaN(kwota) || kwota <= 0)
        return interaction.reply({ content: '❌ Podaj poprawną kwotę.', flags: 64 });

      let serwerKey = null;
      if (serwer.includes('anarchia')) serwerKey = 'anarchia.gg';
      else if (serwer.includes('donut')) serwerKey = 'donutsmp';
      else
        return interaction.reply({ content: '❌ Nieznany serwer. Dostępne: Anarchia.gg, DonutSMP', flags: 64 });

      const typKey = ['sell', 'sprzedaz', 'sprzedaż'].includes(typ) ? 'sprzedaż' : 'kupno';
      const kurs = KURSY[serwerKey]?.[typKey];

      if (!kurs)
        return interaction.reply({ content: '❌ Brak kursu dla tego typu transakcji.', flags: 64 });

      const wynik = kwota * kurs;

      const embed = new EmbedBuilder()
        .setTitle('📊 Wynik obliczenia')
        .setColor(0x2ecc71)
        .addFields(
          { name: '💳 Metoda', value: metoda.toUpperCase(), inline: true },
          { name: '🧾 Typ', value: typKey.toUpperCase(), inline: true },
          { name: '🖥️ Serwer', value: serwerKey, inline: true },
          { name: '💰 Kwota (zł)', value: `${kwota}`, inline: true },
          { name: '📈 Wynik', value: `**${wynik.toFixed(2)}$**`, inline: false }
        )
        .setFooter({ text: 'Lava Shop × Kalkulator', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  } catch (err) {
    console.error('❌ Błąd w kalkulatorze:', err);
  }
});
  // --- !ping (AUTOROLE) ---
  if (message.content === '!ping') {
    const embed = new EmbedBuilder()
      .setTitle('📢 Lava Shop × AUTOROLE')
      .setDescription(`
Kliknij poniższe przyciski, aby **otrzymać powiadomienia** o nowościach! ✨

🟣 **Konkursy** – powiadomienia o nowych konkursach!  
🟢 **Restock** – informacje o nowych dostawach!  
🔴 **Kupie Kasę** – oferty kupna i sprzedaży!
`)
      .setColor(0x5865f2)
      .setFooter({ text: 'Lava Shop - System Autoról | APL' })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('role_konkursy').setLabel('🟣 Konkursy').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('role_restock').setLabel('🟢 Restock').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('role_kupie_kase').setLabel('🔴 Kupie kase').setStyle(ButtonStyle.Danger)
    );

    await message.channel.send({ embeds: [embed], components: [buttons] });
  }

  // --- !legit ---
  if (message.content === '!legit') {
    const embed = new EmbedBuilder()
      .setTitle('🔥 Lava Shop × Jesteśmy legit?')
      .setDescription(
        `Potwierdź naszą wiarygodność! Kliknij przycisk poniżej, aby zagłosować.  
Każdy głos się liczy, ale możesz zagłosować tylko raz!`
      )
      .setColor(0x00ff73)
      .setFooter({ text: 'Lava Shop - Bot | APL' })
      .setTimestamp();

    const button = new ButtonBuilder().setCustomId('legit_vote').setLabel('✅ TAK (0)').setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder().addComponents(button);
    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ====== AUTOROLE ======
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const roleIds = {
    role_konkursy: '1431343816035664063',
    role_restock: '1431343873254232196',
    role_kupie_kase: '1431343922579378196',
  };

  const roleId = roleIds[interaction.customId];
  if (!roleId) return;

  const role = interaction.guild.roles.cache.get(roleId);
  const member = interaction.guild.members.cache.get(interaction.user.id);

  if (!role) return interaction.reply({ content: '❌ Nie mogę znaleźć tej roli!', ephemeral: true });

  if (member.roles.cache.has(role.id)) {
    await interaction.reply({ content: `⚠️ Masz już rolę **${role.name}**!`, ephemeral: true });
  } else {
    await member.roles.add(role);
    await interaction.reply({ content: `✅ Otrzymałeś rolę **${role.name}**!`, ephemeral: true });
  }
});

// ====== GŁOSOWANIE LEGIT ======
let votes = 0;
const votedUsers = new Set();

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton() && interaction.customId === 'legit_vote') {
    if (votedUsers.has(interaction.user.id))
      return interaction.reply({ content: '❌ Już oddałeś swój głos!', flags: 64 });

    votedUsers.add(interaction.user.id);
    votes++;

    const message = await interaction.message.fetch();
    const embed = EmbedBuilder.from(message.embeds[0]);
    const button = new ButtonBuilder()
      .setCustomId('legit_vote')
      .setLabel(`✅ TAK (${votes})`)
      .setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder().addComponents(button);

    await interaction.update({ embeds: [embed], components: [row] });
  }
});

// ====== POWITALNIA ======
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channelId = process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor('#ff6600')
      .setAuthor({ name: 'Lava Shop × WITAMY' })
      .setThumbnail(member.guild.iconURL({ dynamic: true }))
      .setDescription(
       
        `× Witaj **${member.user.username}** na Lava Shop!\n\n` +
         
        `× Jesteś już **${member.guild.memberCount}** osobą na naszym serwerze!\n\n` +
          
        `× Mamy nadzieję, że zostaniesz z nami na dłużej!`
      )
      .setTimestamp()
      .setFooter({ text: 'Lava Shop - Bot | APL' });

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('❌ Błąd w powitalni:', err);
  }
});

// ====== KOMENDA /lc ======
client.once(Events.ClientReady, async () => {
  const commands = [
    new SlashCommandBuilder()
      .setName('lc')
      .setDescription('✅ Stwórz wiadomość LegitCheck')
      .addStringOption((opt) =>
        opt.setName('kwota').setDescription('Ile użytkownik kupił (np. 70k)').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('serwer').setDescription('Na jakim serwerze (np. ana.1f)').setRequired(true)
      ),
  ].map((cmd) => cmd.toJSON());

  await client.application.commands.set(commands);
  console.log('✅ Komenda /lc została zarejestrowana!');
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'lc') return;

  const kwota = interaction.options.getString('kwota');
  const serwer = interaction.options.getString('serwer');

  const embed = new EmbedBuilder()
    .setColor('#00ff73')
    .setAuthor({ name: 'Lava Shop - BOT', iconURL: client.user.displayAvatarURL() })
    .setTitle('✅ Legitcheck × Lava Shop')
    .setDescription(
      `✅ **x Legit?** kupiłeś **${kwota}** na serwerze **${serwer}**\n` +
        `✅ **x Napisz Legit jeśli transakcja przeszła pomyślnie!**\n\n` +
        `Podziel się swoją opinią o **Lava Shop** na <#1431301620628455474>!`
    );

  await interaction.reply({ embeds: [embed] });
});

// ====== SYSTEM LEGITCHECK (z numeracją) ======
const LEGIT_DB_PATH = path.join(process.cwd(), 'legit_db.json');
function loadLegitDB() {
  try {
    if (!fs.existsSync(LEGIT_DB_PATH)) return { entries: {} };
    return JSON.parse(fs.readFileSync(LEGIT_DB_PATH, 'utf8'));
  } catch {
    return { entries: {} };
  }
}
function saveLegitDB(db) {
  fs.writeFileSync(LEGIT_DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}
const legitDB = loadLegitDB();
const LEGIT_CHANNEL_ID = process.env.LEGIT_CHANNEL_ID;

client.on('messageCreate', async (message) => {
  try {
    if (message.author?.bot) return;
    if (!LEGIT_CHANNEL_ID || message.channel.id !== LEGIT_CHANNEL_ID) return;
    if (!message.attachments.size) return;

    const attachment = message.attachments.find((a) =>
      a.contentType?.startsWith('image')
    );
    if (!attachment) return;

    if (legitDB.entries[message.id]) return;
    const used = new Set(Object.values(legitDB.entries).map((e) => e.num));
    const num = (() => { let n = 1; while (used.has(n)) n++; return n; })();

    const embed = new EmbedBuilder()
      .setColor('#1f8b4c')
      .setTitle(`✅ Legitcheck #${num}`)
      .setImage(attachment.url)
      .setFooter({ text: 'System legitcheck × LEG SHOP' })
      .setTimestamp();

    const botMsg = await message.channel.send({ embeds: [embed] });
    legitDB.entries[message.id] = { num, botMessageId: botMsg.id };
    saveLegitDB(legitDB);
  } catch (err) {
    console.error('❌ Błąd w handlerze legit image:', err);
  }
});

client.on('messageDelete', async (message) => {
  if (!LEGIT_CHANNEL_ID || message.channel?.id !== LEGIT_CHANNEL_ID) return;
  const entry = legitDB.entries[message.id];
  if (!entry) return;

  const botMsg = await message.channel.messages.fetch(entry.botMessageId).catch(() => null);
  if (botMsg) await botMsg.delete().catch(() => null);

  delete legitDB.entries[message.id];
  saveLegitDB(legitDB);
});

// ====== EXPRESS KEEPALIVE ======
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('✅ Lava Shop bot działa poprawnie!'));
app.listen(PORT, () => console.log(`🌐 Serwer HTTP działa na porcie ${PORT}`));

// ====== LOGOWANIE ======
client.login(process.env.TOKEN);



