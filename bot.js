import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

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
**1. Jak tworzyć zaproszenia**
» ✳️ Kliknij PPM na ikonę serwera → „Zaproś osoby”.
» 📅 Ustaw **ważność 7 dni i wiele użyć!**
🟥 Nie twórz linków bez limitu ani z telefonu – często nie działają.
🟥 Nie zapraszaj przez listę znajomych ani linki 1-użyciowe.
✳️ Jeśli coś nie działa – opuść i dołącz ponownie do serwera, potem spróbuj ponownie.

**2. Kogo można zapraszać**
» 🎯 Tylko **prawdziwych graczy z community Minecraft**:  
Anarchia, KrzysMc, Rapy, RapySMP, PykMC, MineStar, DonutSMP (tylko osoby z Polski)
🟥 Konto zaproszone musi mieć min. **2 miesiące** i być **zweryfikowane**.
🟥 Zakaz multikont, fejków i zaproszeń z własnych serwerów.
✳️ Osoba musi się **zweryfikować** na kanale weryfikacja.

**3. Nagrody**
» 💬 Sprawdzenie zaproszeń: /invites na kanale <#1431269462287323137>  
» Liczy się tylko, gdy zaproszony **pozostanie na serwerze**.  
» Gdy ktoś odejdzie – tracisz zaproszenie.

**3.1 Odbiór nagrody**
» Po osiągnięciu progu (np. 5 / 10 / 20 zaproszeń) – otwórz ticket w kategorii „Brak dostępu”.  
» Zaproszeni muszą być na serwerze **min. 8h**.  
» Po weryfikacji moderator przyzna nagrodę i licznik się resetuje.  
» Brak nagród za mniejsze progi (np. 3 zaproszenia).

⏳ **Czas realizacji:** do **7 dni roboczych.**  
🔇 Spam/pingowanie w tickecie = 24h mute.

**4. Zasady i kary**
🟥 Multikonta, fejki, zaproszenia spoza community = usunięcie zaproszeń, perm ban.  
🟥 Zaproszenia z własnych serwerów = brak nagrody.  
🟥 Minimalny próg: **5 zaproszeń.**  
🟥 Oszustwa = utrata zaproszeń, perm ban.  
✳️ Jeśli nie spełniasz wymagań – ticket zostanie zamknięty.

**5. W skrócie**
» 🔗 Stwórz link (7 dni, kilka użyć).  
» ✅ Zapraszaj zweryfikowanych graczy z community.  
» 🚫 Nie używaj multikont ani telefonu.  
» 🔍 Sprawdź postęp: /invites.  
» 🏆 Po 5+ zaproszeniach otwórz ticket po nagrodę.  
» 👥 Osoby muszą być zweryfikowane i spędzić min. 8h na serwerze.  
» ⏱️ Po nagrodzie licznik się resetuje.

💬 Dbaj o uczciwość! Nagrody są tylko dla tych, którzy realnie rozwijają community ❤️
`)
      .setColor(0xff4757)
      .setFooter({ text: 'Lava Shop - Bot | APL' })
      .setTimestamp();

    await message.channel.send({ embeds: [embedInfo] });
  }
});

Import("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
} = import("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ====== KURSY ======
const KURSY = {
  "anarchia.gg": { kupno: 4500, sprzedaż: 6000 },
  donutsmp: { kupno: 3000000, sprzedaż: 5000000 },
};

// ====== !kalkulator ======
client.on("messageCreate", async (message) => {
  if (message.content === "!kalkulator") {
    const embed = new EmbedBuilder()
      .setTitle("💰 Kalkulator transakcji")
      .setDescription("Aby obliczyć transakcję, kliknij w przycisk **Kalkulator** poniżej 👇")
      .setColor(0x5865f2);

    const button = new ButtonBuilder()
      .setCustomId("open_kalkulator")
      .setLabel("🧮 Kalkulator")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ====== OBSŁUGA INTERAKCJI ======
client.on(Events.InteractionCreate, async (interaction) => {
  // Kliknięcie przycisku
  if (interaction.isButton() && interaction.customId === "open_kalkulator") {
    const modal = new ModalBuilder()
      .setCustomId("kalkulator_modal")
      .setTitle("💰 Kalkulator transakcji");

    const metoda = new TextInputBuilder()
      .setCustomId("metoda")
      .setLabel("Metoda płatności (PSC / BLIK / PayPal)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const typ = new TextInputBuilder()
      .setCustomId("typ")
      .setLabel("Kupno / Sprzedaż")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const serwer = new TextInputBuilder()
      .setCustomId("serwer")
      .setLabel("Serwer (Anarchia.gg / DonutSMP)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const kwota = new TextInputBuilder()
      .setCustomId("kwota")
      .setLabel("Kwota (zł)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(metoda);
    const row2 = new ActionRowBuilder().addComponents(typ);
    const row3 = new ActionRowBuilder().addComponents(serwer);
    const row4 = new ActionRowBuilder().addComponents(kwota);

    modal.addComponents(row1, row2, row3, row4);
    await interaction.showModal(modal);
  }

  // Formularz
  if (interaction.isModalSubmit() && interaction.customId === "kalkulator_modal") {
    const metoda = interaction.fields.getTextInputValue("metoda").toLowerCase();
    const typ = interaction.fields.getTextInputValue("typ").toLowerCase();
    const serwer = interaction.fields.getTextInputValue("serwer").toLowerCase();
    const kwotaInput = interaction.fields.getTextInputValue("kwota");

    const dozwoloneMetody = ["psc", "blik", "paypal"];
    const dozwoloneTypy = ["kupno", "sprzedaz", "sprzedaż", "buy", "sell"];
    let serwerKey = null;

    // Walidacje
    if (!dozwoloneMetody.includes(metoda))
      return interaction.reply({ content: "❌ Niepoprawna metoda płatności!", ephemeral: true });

    if (!dozwoloneTypy.includes(typ))
      return interaction.reply({ content: "❌ Niepoprawny typ transakcji! (Kupno/Sprzedaż)", ephemeral: true });

    if (serwer.includes("anarchia")) serwerKey = "anarchia.gg";
    else if (serwer.includes("donut")) serwerKey = "donutsmp";
    else
      return interaction.reply({ content: "❌ Niepoprawny serwer! (Anarchia.gg / DonutSMP)", ephemeral: true });

    const kwota = parseFloat(kwotaInput);
    if (isNaN(kwota) || kwota <= 0)
      return interaction.reply({ content: "❌ Kwota musi być liczbą dodatnią!", ephemeral: true });

    // Ujednolicenie typu
    const typKey = ["sell", "sprzedaz", "sprzedaż"].includes(typ) ? "sprzedaż" : "kupno";

    // Obliczenia
    const kurs = KURSY[serwerKey][typKey];
    const wynik = kwota * kurs;

    const embed = new EmbedBuilder()
      .setTitle("📊 Wynik transakcji")
      .setColor(0x2ecc71)
      .addFields(
        { name: "Serwer", value: serwerKey, inline: true },
        { name: "Typ", value: typKey, inline: true },
        { name: "Metoda", value: metoda.toUpperCase(), inline: true },
        { name: "Kwota (zł)", value: kwota.toString(), inline: true },
        { name: "Wynik", value: `**${wynik.toLocaleString()}$**`, inline: false }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

// ====== START ======
client.once("ready", () => {
  console.log(`✅ Zalogowano jako ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);



