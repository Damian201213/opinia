import 'dotenv/config';
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

// Tworzymy klienta
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// ====== START ======
client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

// ====== KOMENDY ZAPROSZENIA ======
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // --- Komenda !nagrody ---
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

  // --- Komenda !szybko ---
  if (message.content.startsWith('!szybko')) {
    const embedSzybko = new EmbedBuilder()
      .setTitle('❓ Jak szybciej zapraszać?')
      .setDescription(`
**✳️ ➤ Dołącz do popularnych serwerów Discorda**
» 🔹 Na początek wejdź na jeden z serwerów poniżej lub inne serwery streamerów  
(np. e__s. Tromby, Raxenika itp.)

**🟡 ANARCHIA**
» 🔗 [Kliknij, aby dołączyć na discord ANARCHIA](https://discord.gg/anarchia)

**🪶 RAPY**
» 🔗 [Kliknij, aby dołączyć na discord RAPY](https://discord.gg/5QzyRq2D65)

**🎮 RAPYSMP**
» 🔗 [Kliknij, aby dołączyć na discord RAPYSMP](https://discord.gg/7UdGyxybGg)

**⚙️ PYKMC**
» 🔗 [Kliknij, aby dołączyć na discord PYKMC](https://discord.gg/YTJnXxh2Pc)

**🧠 ZIOMKI RAXENIKA**
» 🔗 [Kliknij, aby dołączyć na discord ZIOMKI RAXENIKA](https://discord.gg/dcraxenik)

**💬 TRYBUNA OSKARA**
» 🔗 [Kliknij, aby dołączyć na discord TRYBUNA OSKARA](https://discord.gg/g2rmXpvdjZ)

---

**💭 ➤ Wejdź na kanały ogólne (np. #chat, #ogólny)**
» Napisz coś w stylu: *„Kto chce 50k PV?”*  
» Dzięki temu zainteresowane osoby szybciej się odezwą.

---

**📩 ➤ Wysyłaj swoje zaproszenie w prywatnych wiadomościach**
» Gdy ktoś do Ciebie napisze, **skopiuj link do swojego zaproszenia**  
i wyślij mu go w wiadomości prywatnej.
`)
      .setColor(0x5865F2)
      .setFooter({ text: 'Lava Shop - Bot | APL' })
      .setTimestamp();

    await message.channel.send({ embeds: [embedSzybko] });
  }

  // --- Komenda !info ---
  if (message.content.startsWith('!info')) {
    const embedInfo = new EmbedBuilder()
      .setTitle('🎈 INFORMACJE ZAPROSZENIA')
      .setDescription(`
📜 **Zasady i nagrody** znajdziesz w komendzie \`!nagrody\`  
💬 Dowiedz się jak szybciej zapraszać — \`!szybko\`

Dbaj o uczciwość! Nagrody są tylko dla tych, którzy realnie rozwijają community ❤️
`)
      .setColor(0xff4757)
      .setFooter({ text: 'Lava Shop - Bot | APL' })
      .setTimestamp();

    await message.channel.send({ embeds: [embedInfo] });
  }

  // --- Komenda !kalkulator ---
  if (message.content === '!kalkulator') {
    const embed = new EmbedBuilder()
      .setTitle('💰 Kalkulator transakcji')
      .setDescription('Aby obliczyć transakcję, kliknij w przycisk **Kalkulator** poniżej 👇')
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

// ====== INTERAKCJE (przycisk + formularz) ======
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

  // ====== Po wysłaniu formularza ======
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
    else return interaction.reply({ content: '❌ Niepoprawny serwer! (Anarchia.gg / DonutSMP)', ephemeral: true });

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

// ====== EXPRESS DLA RENDER.COM ======
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Lava Shop Bot działa poprawnie.');
});

app.listen(PORT, () => {
  console.log(`🌐 Serwer HTTP działa na porcie ${PORT}`);
});
// ====== START BOTA ======
client.login(process.env.DISCORD_TOKEN);

