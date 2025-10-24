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
      .setFooter({ text: 'WaterShop - Bot | APL' })
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
      .setColor(0x5865F2) // kolor Discorda
      .setFooter({ text: 'Lava Shop - Bot | APL' })
      .setTimestamp();

    await message.channel.send({ embeds: [embedSzybko] });
  }
});

client.login(process.env.DISCORD_TOKEN);
