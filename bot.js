import 'dotenv/config';
import express from 'express';
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} from 'discord.js';

// Tworzymy klienta Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// ====== START ======
client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

// ====== KOMENDY ======
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // --- !regulamin ---
  if (message.content.startsWith('!regulamin')) {
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🔥 Lava Shop × REGULAMIN 🧾')
      .setDescription(`
**NIE ZAPOZNAJĄC SIĘ Z REGULAMINEM NIE ZWALNIA CIĘ Z PRZESTRZEGANIA JEGO!**

> 1️⃣ Używanie wulgaryzmów wobec sprzedawców lub jakichkolwiek przekleństw, wyzwisk grozi **Przerwą lub Banem** w zależności od sprzedawcy.  
> 2️⃣ Nadmierne pingowanie na chacie lub tickecie **Przerwa 1d**.  
> 3️⃣ Reklamowanie się na naszym serwerze Discord **PERM ban**.  
> 4️⃣ Nakazuje się bycie wyrozumiałym na tickecie — każdy ma swoje życie prywatne i gorsze chwile.  
> 5️⃣ Próby oszustwa lub płacenie kradzionymi pieniędzmi **ban**.  
> 6️⃣ Administrator (sprzedawca) ma prawo do ukarania Cię, jeśli byłeś wielokrotnie ostrzegany.

🧨 *Regulamin w każdej chwili może ulec zmianie.*
`)
      .setFooter({ text: 'Lava Shop © 2025', iconURL: client.user.displayAvatarURL() });

    await message.channel.send({ embeds: [embed] });
  }

  // --- !nagrody ---
  if (message.content.startsWith('!nagrody')) {
    const embedNagrody = new EmbedBuilder()
      .setTitle('🎁 NAGRODY ZA ZAPROSZENIA')
      .setDescription(`
**🟡 ANARCHIA LIFESTEAL**
» x5 zaproszeń → 💸 40,000$
» x10 zaproszeń → 💸 100,000$
» x20 zaproszeń → 💸 220,000$
» x40 zaproszeń → 💸 450,000$

**🟡 ANARCHIA BOXPVP**
» x5 zaproszeń → 💸 800,000$
» x10 zaproszeń → 💸 1,8 MLN$
» x20 zaproszeń → 💸 4,5 MLN$
» x40 zaproszeń → 💸 11 MLN$

**🟦 KRZYSMC BOXPVP**
» x5 zaproszeń → 💸 100,000$
» x10 zaproszeń → 💸 250,000$
» x20 zaproszeń → 💸 550,000$
» x40 zaproszeń → 💸 1,2 MLN$

**🍩 DONUT SMP**
» x5 zaproszeń → 💸 5 MLN$
» x10 zaproszeń → 💸 15 MLN$
» x20 zaproszeń → 💸 35 MLN$
» x40 zaproszeń → 💸 75 MLN$

**💳 PAYSAFECARD**
» x15 zaproszeń → 🟥 20 zł PSC
» x30 zaproszeń → 🟥 50 zł PSC
» x55 zaproszeń → 🟥 100 zł PSC

**📋 PRZED ZAPRASZANIEM OBOWIĄZKOWO SPRAWDŹ KANAŁ:**
<#1393703054318239796>
⚠️ ZAPRASZAJ TYLKO Z COMMUNITY MINECRAFT!  
(ANARCHIA, KRZYSMC, RAYP, PYKMC, RAPYSMP, MINESTAR, DONUTSMP — TYLKO OSOBY Z POLSKI)

> ✉️ Zaproszenia możesz sprawdzić na <#1406056084715733055> lub komendą \`/invites\`
`)
      .setColor(0x00ADEF)
      .setFooter({ text: 'Lava Shop - Bot | APL' })
      .setTimestamp();

    await message.channel.send({ embeds: [embedNagrody] });
  }

  // --- !szybko ---
  if (message.content.startsWith('!szybko')) {
    const embedSzybko = new EmbedBuilder()
      .setTitle('❓ Jak szybciej zapraszać?')
      .setDescription(`
**✳️ ➤ Dołącz do popularnych serwerów Discorda**
» 🔹 Na początek wejdź na jeden z serwerów streamerów lub dużych społeczności

**🟡 ANARCHIA**
» 🔗 [Discord ANARCHIA](https://discord.gg/anarchia)
**🪶 RAPY**
» 🔗 [Discord RAPY](https://discord.gg/5QzyRq2D65)
**🎮 RAPYSMP**
» 🔗 [Discord RAPYSMP](https://discord.gg/7UdGyxybGg)
**⚙️ PYKMC**
» 🔗 [Discord PYKMC](https://discord.gg/YTJnXxh2Pc)

---

**💭 ➤ Wejdź na kanały ogólne (np. #chat, #ogólny)**
» Napisz coś w stylu: *„Kto chce 50k PV?”*  
» Dzięki temu zainteresowane osoby szybciej się odezwą.

---

**📩 ➤ Wysyłaj swoje zaproszenie w prywatnych wiadomościach**
» Skopiuj link i wyślij osobie, która się zainteresowała.
`)
      .setColor(0x5865F2)
      .setFooter({ text: 'Lava Shop - Bot | APL' })
      .setTimestamp();

    await message.channel.send({ embeds: [embedSzybko] });
  }

  // --- !info ---
  if (message.content.startsWith('!info')) {
    const embedInfo = new EmbedBuilder()
      .setTitle('🎈 INFORMACJE ZAPROSZENIA')
      .setDescription(`
📜 Zasady i nagrody: \`!nagrody\`  
💬 Jak szybciej zapraszać: \`!szybko\`

Dbaj o uczciwość! ❤️ Nagrody są tylko dla tych, którzy realnie rozwijają community.
`)
      .setColor(0xff4757)
      .setFooter({ text: 'Lava Shop - Bot | APL' })
      .setTimestamp();

    await message.channel.send({ embeds: [embedInfo] });
  }

  // --- !kalkulator ---
  if (message.content === '!kalkulator') {
    const embed = new EmbedBuilder()
      .setTitle('💰 Kalkulator transakcji')
      .setDescription('Kliknij w przycisk poniżej, aby otworzyć kalkulator 👇')
      .setColor(0x5865f2);

    const button = new ButtonBuilder()
      .setCustomId('open_kalkulator')
      .setLabel('🧮 Kalkulator')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);
    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ====== KURSY ======
const KURSY = {
  'anarchia.gg': { kupno: 4500, sprzedaż: 6000 },
  donutsmp: { kupno: 3000000, sprzedaż: 5000000 },
};

// ====== INTERAKCJE ======
client.on(Events.InteractionCreate, async (interaction) => {
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
  }

  if (interaction.isModalSubmit() && interaction.customId === 'kalkulator_modal') {
    const metoda = interaction.fields.getTextInputValue('metoda').toLowerCase();
    const typ = interaction.fields.getTextInputValue('typ').toLowerCase();
    const serwer = interaction.fields.getTextInputValue('serwer').toLowerCase();
    const kwotaInput = interaction.fields.getTextInputValue('kwota');

    const dozwoloneMetody = ['psc', 'blik', 'paypal'];
    const dozwoloneTypy = ['kupno', 'sprzedaz', 'sprzedaż', 'buy', 'sell'];
    let serwerKey = null;

    if (!dozwoloneMetody.includes(metoda))
      return interaction.reply({ content: '❌ Niepoprawna metoda płatności!', ephemeral: true });

    if (!dozwoloneTypy.includes(typ))
      return interaction.reply({ content: '❌ Niepoprawny typ transakcji! (Kupno/Sprzedaż)', ephemeral: true });

    if (serwer.includes('anarchia')) serwerKey = 'anarchia.gg';
    else if (serwer.includes('donut')) serwerKey = 'donutsmp';
    else return interaction.reply({ content: '❌ Niepoprawny serwer!', ephemeral: true });

    const kwota = parseFloat(kwotaInput);
    if (isNaN(kwota) || kwota <= 0)
      return interaction.reply({ content: '❌ Kwota musi być liczbą dodatnią!', ephemeral: true });

    const typKey = ['sell', 'sprzedaz', 'sprzedaż'].includes(typ) ? 'sprzedaż' : 'kupno';
    const kurs = KURSY[serwerKey][typKey];
    const wynik = kwota * kurs;

    const embed = new EmbedBuilder()
      .setTitle('📊 Wynik transakcji')
      .setColor(0x2ecc71)
      .addFields(
        { name: 'Serwer', value: serwerKey, inline: true },
        { name: 'Typ', value: typKey, inline: true },
        { name: 'Metoda', value: metoda.toUpperCase(), inline: true },
        { name: 'Kwota (zł)', value: kwota.toString(), inline: true },
        { name: 'Wynik', value: `**${wynik.toLocaleString()}$**`, inline: false }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

// ====== POWITALNIA ======
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channelId = process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return console.error("❌ Nie znaleziono kanału powitalnego!");

    const memberCount = member.guild.memberCount;
    let inviterTag = "Nieznany";

    try {
      const invites = await member.guild.invites.fetch();
      const oldInvites = client.invites?.get(member.guild.id);
      const invite = invites.find((i) => oldInvites && oldInvites.get(i.code) < i.uses);
      if (invite) inviterTag = `${invite.inviter.tag} (<@${invite.inviter.id}>)`;
      client.invites.set(member.guild.id, new Map(invites.map((i) => [i.code, i.uses])));
    } catch {
      inviterTag = "Brak danych o zaproszeniu";
    }

    const embedWelcome = new EmbedBuilder()
      .setColor("#ff6600")
      .setAuthor({ name: "LAVA SHOP × WITAMY 🧡" })
      .setThumbnail(member.guild.iconURL({ dynamic: true }))
      .setDescription(
        `× Witaj **${member.user.username}** na **Lava Shop**!!\n\n` +
        `× Jesteś już **${memberCount}** osobą na naszym serwerze!\n\n` +
        `× Zaproszony przez: ${inviterTag}\n\n` +
        `× Mamy nadzieję, że zostaniesz z nami na dłużej!`
      )
      .setTimestamp()
      .setFooter({ text: "Lava Shop - Bot | APL" });

    await channel.send({ embeds: [embedWelcome] });
  } catch (err) {
    console.error("❌ Błąd w powitalni:", err);
  }
});

// ====== ZAPAMIĘTYWANIE STARYCH ZAPROSZEŃ ======
client.on(Events.ClientReady, async () => {
  client.invites = new Map();
  for (const [guildId, guild] of client.guilds.cache) {
    const invites = await guild.invites.fetch().catch(() => null);
    if (invites) client.invites.set(guildId, new Map(invites.map((i) => [i.code, i.uses])));
  }
});

// ====== EXPRESS DLA UPTIMEPINGER ======
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("✅ Lava Shop Bot działa poprawnie."));
app.listen(PORT, () => console.log(`🌐 Serwer HTTP działa na porcie ${PORT}`));

// ====== AUTOROLE PANEL (komenda !ping) ======

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    const embed = new EmbedBuilder()
      .setTitle('📢 Lava Shop × AUTOROLE')
      .setDescription(`
Kliknij poniższe przyciski, aby **otrzymać powiadomienia** o nowościach! ✨

🟣 **Konkursy** – Powiadomienia o nowych konkursach!  
🟢 **Restock** – Informacje o nowych dostawach!  
🔴 **Kupie Kasę** – Oferty kupna i sprzedaży!
`)
      .setColor(0x5865f2)
      .setFooter({ text: 'Lava Shop - System Autoról | APL' })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('role_konkursy')
        .setLabel('🟣 Konkursy')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('role_restock')
        .setLabel('🟢 Restock')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('role_kupie_kase')
        .setLabel('🔴 Kupie kase')
        .setStyle(ButtonStyle.Danger)
    );

    await message.channel.send({ embeds: [embed], components: [buttons] });
  }
});

// ====== OBSŁUGA PRZYCISKÓW ======

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
  if (!role) {
    return interaction.reply({ content: '❌ Nie mogę znaleźć tej roli!', ephemeral: true });
  }

  const member = interaction.guild.members.cache.get(interaction.user.id);
  if (!member.roles.cache.has(role.id)) {
    await member.roles.add(role);
    await interaction.reply({ content: `✅ Otrzymałeś rolę **${role.name}**!`, ephemeral: true });
  } else {
    await interaction.reply({ content: `⚠️ Masz już rolę **${role.name}**!`, ephemeral: true });
  }
});

// ====== EXPRESS DLA UPTIMEPINGER ======
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('✅ Lava Shop Bot działa poprawnie.'));
app.listen(PORT, () => console.log(`🌐 Serwer HTTP działa na porcie ${PORT}`));

// ====== START BOTA ======
client.login(process.env.DISCORD_TOKEN);
