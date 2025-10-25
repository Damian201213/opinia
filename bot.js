import {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  Events,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  SlashCommandBuilder
} from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// ====== EXPRESS KEEPALIVE ======
const app = express();
app.get('/', (req, res) => res.send('Bot działa 🚀'));
app.listen(3000, () => console.log('🌐 KeepAlive server running on port 3000'));

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

  // --- !donut ---
  if (message.content === '!donut') {
    const embed = new EmbedBuilder()
      .setColor('#ff66cc')
      .setTitle('🍩 CENNIK DONUTSMP')
      .setDescription(`
 **3m$** ➜ **1zł**  
**1 spawner** ➜  **1zł**  

**PO ZAKUPIE ZAPRASZAM**
<#1428469724005798008> 🎟️
`)
      .setFooter({ text: 'Lava Shop © 2025', iconURL: client.user.displayAvatarURL() });
    await message.channel.send({ embeds: [embed] });
  }

  // --- !ms ---
  if (message.content === '!ms') {
    const embed = new EmbedBuilder()
      .setColor('#00ffcc')
      .setTitle('💸 CENNIK MINESTAR.PL LF')
      .setDescription(`
~~3500$~~ **5000$**  ➜ **1zł**  
~~3500$~~ **5200$**  ➜ **1zł (PRZY ZAKUPIE 100ZŁ +)**  

**PO ZAKUPIE ZAPRASZAM**
<#1428469724005798008> 🎟️
`)
      .setFooter({ text: 'Lava Shop © 2025', iconURL: client.user.displayAvatarURL() });
    await message.channel.send({ embeds: [embed] });
  }
// --- !dropinfo ---
if (message.content === '!dropinfo') {
  const embed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setTitle('🎁 DROP INFO')
    .setDescription(`
'''Lava Shop x DROP INFO '''
**💎 Dostępne nagrody:**
• -5% zniżki  
• -10% zniżki  
• -15% zniżki  
• -25% zniżki  
• 5k ana.gg / 5k rapy.pl / 20k pykmc (do wyboru)  
• 10k ana.gg / 10k rapy.pl / 40k pykmc (do wyboru)  
• 25k ana.gg / 25k rapy.pl / 100k pykmc (do wyboru)  
• 1zł do wydania na sklepie  
• 2zł do wydania na sklepie  
• 3zł do wydania na sklepie  
• 4zł do wydania na sklepie  
• 5zł do wydania na sklepie  

---

**🧭 Jak to zrobić?**
Użyj komendy na kanale <#1431285618255724584>:

'''\`/drop\`'''

Aby móc używać tej komendy, musisz posiadać **status \`.gg/lavashop\`**  
Komendę możesz użyć co **2 godziny!**

---

⚠️ **UWAGA:**  
• Nagrodę można odebrać maksymalnie do **3 dni** od wylosowania!  
• Nagrody są przyznawane tylko osobom, które mają **status naszego serwera!**  
• Ustawianie statusu na chwilę dla komendy będzie **karane!**
`)
    .setFooter({
      text: 'Lava Shop © 2025',
      iconURL: message.client.user.displayAvatarURL(),
    })
    .setTimestamp();

  await message.channel.send({ embeds: [embed] });
}

  // --- !sell ---
  if (message.content === '!sell') {
    const embed = new EmbedBuilder()
      .setColor('#33ff77')
      .setTitle('💵 SPRZEDAJ SWOJE ITEMY 💵')
      .setDescription(`
**💬 CHCESZ SPRZEDAĆ SWOJE ITEMY ZA PRAWDZIWE PIENIĄDZE?**
Skupujemy itemy/waluty o wartości co najmniej **20zł** 💸

**💰 ILE DOSTANIESZ ZA SWOJE ITEMKI?**
Około **50-70%** wartości cennika (w zależności od typu itemów).

**💳 METODY PŁATNOŚCI:**
> 🔴 PaySafeCard  
> 🟢 BLIK  
> 🛠️ Kupno rang/usług  
> 💙 PayPal  

Po więcej informacji → <#1428469724005798008> 🎟️
`)
      .setFooter({ text: 'Lava Shop © 2025', iconURL: client.user.displayAvatarURL() });
    await message.channel.send({ embeds: [embed] });
  }

  // --- !analf ---
if (message.content === '!analf') {
  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('🔥 CENNIK ANARCHIA.GG LF 🔥')
    .setDescription(`
**~~3500$~~ 4300$ → 1zł**

**Anarchiczny miecz** → **2.5 PLN**  
**Anarchiczny kilof** → **2.5 PLN**  
**Anarchiczny set I** → **13 PLN**  
**Anarchiczny set II** → **30 PLN**  
**Elytra** → **55 PLN**  
**Sakiewka dropu** → **50 PLN**  
**Bombarda maxima** → **5 PLN**  
**Wędka nielota** → **255 PLN**  
**Siekiera Grincha** → **130 PLN**  
**Surferka** → **120 PLN**  
**Excalibur** → **250 PLN**  
**Hydroklatka** → **100 PLN**  
**Anarchiczny klucz** → **10 PLN**  
**Serca (x20)** → **5 PLN**  
**Koxy (x16)** → **4 PLN**  
**Perły (x16)** → **3 PLN**

## 🛒 PO ZAKUPIE ZAPRASZAMY
<#1428469724005798008> 🎟️
`)
    .setFooter({
      text: 'Lava Shop © 2025',
      iconURL: message.client.user.displayAvatarURL(),
    });

  await message.channel.send({ embeds: [embed] });
}

  // --- !krzys ---
  if (message.content === '!krzys') {
    const embed = new EmbedBuilder()
      .setColor('#ff8800')
      .setTitle('💎 CENNIK KRZYSMC')
      .setDescription(`
**40K ➜ 1zł**

💬 Cena jest zmienna i zależy od ekonomii w danym momencie.

**PO ZAKUPIE ZAPRASZAM**
<#1428469724005798008> 🎟️
`)
      .setFooter({ text: 'Lava Shop © 2025', iconURL: client.user.displayAvatarURL() });
    await message.channel.send({ embeds: [embed] });
  }
  if (message.author.bot) return;
  // --- !pyk ---
  if (message.content === '!pyk') {
    const embed = new EmbedBuilder()
      .setColor('#00ccff')
      .setTitle('💎 CENNIK PYKMC')
      .setDescription(`
~~12 000$~~ **25 000$ ➜ 1zł**

**PO ZAKUPIE ZAPRASZAM**
<#1428469724005798008> 🎟️
`)
      .setFooter({ text: 'Lava Shop © 2025', iconURL: message.client.user.displayAvatarURL() });

    await message.channel.send({ embeds: [embed] });
  }

  // --- !anabox ---
  if (message.content === '!anabox') {
    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle('📦 CENNIK ANARCHIA BOX')
      .setDescription(`
~~80 000$~~ **400 000$ ➜ 1zł**

**PO ZAKUPIE ZAPRASZAM**
<#1428469724005798008> 🎟️
`)
      .setFooter({
        text: 'Lava Shop © 2025',
        iconURL: message.client.user.displayAvatarURL(),
      });

    await message.channel.send({ embeds: [embed] });
  }
}); // ✅ zamyka event poprawnie

// ====== KONFIGURACJA KALKULATORA ======
const KURSY = {
  "anarchia.gg": {
    kupno: 4500,    // 1 zł → 4500
    sprzedaż: 6000, // 1 zł → 6000
  },
  "donutsmp": {
    kupno: 3_000_000,    // 1 zł → 3M
    sprzedaż: 5_000_000, // 1 zł → 5M
  },
};

// ====== KOMENDA !kalkulator / przycisk ======
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content === '!kalkulator' || message.content === '/lc') {
    const embed = new EmbedBuilder()
      .setTitle('💰 Kalkulator Lava Shop')
      .setDescription('Kliknij przycisk poniżej, aby obliczyć wartość 💸')
      .setColor(0x5865f2);

    const button = new ButtonBuilder()
      .setCustomId('open_kalkulator')
      .setLabel('🧮 Otwórz kalkulator')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);
    await message.channel.send({ embeds: [embed], components: [row] });
  }
});

// ====== OBSŁUGA INTERAKCJI ======
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

    // obsługa wyników z modala
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

      // obliczenia
      let wynik = kwota * kurs;

      // prowizja 10% przy PSC
      if (metoda === 'psc') wynik *= 0.9;

      const embed = new EmbedBuilder()
        .setTitle('📊 Wynik kalkulacji')
        .setColor(0x2ecc71)
        .addFields(
          { name: '💳 Metoda', value: metoda.toUpperCase(), inline: true },
          { name: '🧾 Typ', value: typKey.toUpperCase(), inline: true },
          { name: '🖥️ Serwer', value: serwerKey, inline: true },
          { name: '💰 Kwota (zł)', value: `${kwota}`, inline: true },
          { name: '📈 Wynik', value: typKey === 'kupno'
              ? `**Otrzymasz ${wynik.toLocaleString()}**`
              : `**Sprzedajesz za ${wynik.toLocaleString()}**`,
            inline: false
          },
          ...(metoda === 'psc'
            ? [{ name: '⚠️ Uwaga', value: 'Odjęto 10% prowizji za PSC', inline: false }]
            : [])
        )
        .setFooter({ text: 'Lava Shop × Kalkulator', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], flags: 64 });
    }
  } catch (err) {
    console.error('❌ Błąd w kalkulatorze:', err);
  }
});
    // ====== AUTOROLE ======
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton() && interaction.customId.startsWith('role_')) {
      const roleIds = {
        role_konkursy: '1431343816035664063',
        role_restock: '1431343873254232196',
        role_kupie_kase: '1431343922579378196',
      };

      const roleId = roleIds[interaction.customId];
      if (!roleId) return; // ✅ teraz jest wewnątrz funkcji

      const role = interaction.guild.roles.cache.get(roleId);
      const member = interaction.guild.members.cache.get(interaction.user.id);

      if (!role)
        return interaction.reply({ content: '❌ Nie mogę znaleźć tej roli!', ephemeral: true });

      if (member.roles.cache.has(role.id)) {
        await interaction.reply({ content: `⚠️ Masz już rolę **${role.name}**!`, ephemeral: true });
      } else {
        await member.roles.add(role);
        await interaction.reply({ content: `✅ Otrzymałeś rolę **${role.name}**!`, ephemeral: true });
      }
    }
  } catch (err) {
    console.error('❌ Błąd w InteractionCreate (role):', err);
  }
});
// ====== GŁOSOWANIE LEGIT + /lc ======
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // === GŁOSOWANIE LEGIT ===
    if (interaction.isButton() && interaction.customId === 'legit_vote') {
      if (!global.votedUsers) global.votedUsers = new Set();
      if (!global.votes) global.votes = 0;

      if (global.votedUsers.has(interaction.user.id)) {
        await interaction.reply({ content: '❌ Już oddałeś swój głos!', flags: 64 });
        return;
      }

      global.votedUsers.add(interaction.user.id);
      global.votes++;

      const message = await interaction.message.fetch();
      const embed = EmbedBuilder.from(message.embeds[0]);
      const button = new ButtonBuilder()
        .setCustomId('legit_vote')
        .setLabel(`✅ TAK (${global.votes})`)
        .setStyle(ButtonStyle.Success);
      const row = new ActionRowBuilder().addComponents(button);
      await interaction.update({ embeds: [embed], components: [row] });
      return;
    }

    // === SLASH KOMENDA /lc ===
    if (interaction.isChatInputCommand() && interaction.commandName === 'lc') {
      const kwota = interaction.options.getString('kwota');
      const serwer = interaction.options.getString('serwer');

      const embed = new EmbedBuilder()
        .setColor('#00ff73')
        .setAuthor({ name: 'Lava Shop - BOT', iconURL: interaction.client.user.displayAvatarURL() })
        .setTitle('✅ Legitcheck × Lava Shop')
        .setDescription(
          `✅ **x Legit?** kupiłeś **${kwota}** na serwerze **${serwer}**\n` +
          `✅ **x Napisz Legit jeśli transakcja przeszła pomyślnie!**\n\n` +
          `Podziel się swoją opinią o **Lava Shop** na <#1431301620628455474>!`
        );

      await interaction.reply({ embeds: [embed] });
      return;
    }

  } catch (err) {
    console.error('❌ Błąd w InteractionCreate:', err);
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
// ====== SYSTEM DROP 🎁 ======
const cooldowns = new Map(); // userId -> timestamp
const DROP_CHANNEL_ID = '1431285618255724584';
const STATUS_ROLE_ID = '1431634047192399982';

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'drop') return;

    // sprawdz kanał
    if (interaction.channel.id !== DROP_CHANNEL_ID) {
      return interaction.reply({
        content: '❌ Komendy /drop możesz użyć tylko na kanale <#1431285618255724584>!',
        ephemeral: true,
      });
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);

    // sprawdz czy ma role status
    if (!member.roles.cache.has(STATUS_ROLE_ID)) {
      return interaction.reply({
        content:
          '⚠️ Aby użyć `/drop`, musisz mieć status `.gg/lavashop` i posiadać rangę **Status**!\n' +
          'Użyj komendy `!status`, aby sprawdzić swój status.',
        ephemeral: true,
      });
    }

    // cooldown 2 godziny
    const now = Date.now();
    const lastUse = cooldowns.get(interaction.user.id) || 0;
    const cooldownTime = 2 * 60 * 60 * 1000; // 2 godziny

    if (now - lastUse < cooldownTime) {
      const remaining = Math.ceil((cooldownTime - (now - lastUse)) / 60000);
      return interaction.reply({
        content: `🕒 Możesz ponownie użyć /drop za **${remaining} minut**.`,
        ephemeral: true,
      });
    }

    cooldowns.set(interaction.user.id, now);

    // ====== LOSOWANIE NAGRÓD ======
    const rewards = [
      { name: '🎁 5% zniżki', chance: 1 },
      { name: '🎁 10% zniżki', chance: 1 },
      { name: '🎁 15% zniżki', chance: 1 },
      { name: '🎁 25% zniżki', chance: 1 },
      { name: '💰 5k ana.gg / 5k rapy.pl / 20k pykmc (do wyboru)', chance: 1 },
      { name: '💰 10k ana.gg / 10k rapy.pl / 40k pykmc (do wyboru)', chance: 1 },
      { name: '💰 25k ana.gg / 25k rapy.pl / 100k pykmc (do wyboru)', chance: 1 },
      { name: '💎 1zł do wydania na sklepie', chance: 1 },
      { name: '💎 2zł do wydania na sklepie', chance: 1 },
      { name: '💎 3zł do wydania na sklepie', chance: 1 },
      { name: '💎 4zł do wydania na sklepie', chance: 1 },
      { name: '💎 5zł do wydania na sklepie', chance: 1 },
      { name: '❌ Niestety, tym razem nic nie wygrałeś!', chance: 88 },
    ];

    function weightedRandom(list) {
      const total = list.reduce((sum, item) => sum + item.chance, 0);
      const rand = Math.random() * total;
      let cumulative = 0;
      for (const item of list) {
        cumulative += item.chance;
        if (rand <= cumulative) return item.name;
      }
      return list[list.length - 1].name;
    }

    const reward = weightedRandom(rewards);

    // obrazki
    const noDropImg = 'https://www.bing.com/images/search?view=detailV2&ccid=Q%2bGDgW6J&id=8F9B8188EF406BDB2C507813A5E15243ACAC401E&thid=OIP.Q-GDgW6JHiwIU0ATiNRHWgHaJH&mediaurl=https%3a%2f%2fthumbs.dreamstime.com%2fb%2fp%c5%82acz-ch%c5%82opiec-35461418.jpg&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.43e183816e891e2c0853401388d4475a%3frik%3dHkCsrENS4aUTeA%26pid%3dImgRaw%26r%3d0&exph=900&expw=731&q=p%c5%82acz&FORM=IRPRST&ck=F330FD3DB97729893B8A31E36592D1FC&selectedIndex=10&itb=0'
    const winDropImg = 'https://www.bing.com/images/search?view=detailV2&ccid=0%2fTC9bHK&id=D6D0358B93586A3AB054F84A4C8181FF8C46CDDA&thid=OIP.0_TC9bHKKP_Tz2AjDVkbbgHaE8&mediaurl=https%3a%2f%2fcdn.galleries.smcloud.net%2ft%2fgalleries%2fgf-zEoy-zQt1-fS7M_wygrana-pieniadze-1920x1080-nocrop.jpg&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.d3f4c2f5b1ca28ffd3cf60230d591b6e%3frik%3d2s1GjP%252bBgUxK%252bA%26pid%3dImgRaw%26r%3d0&exph=1280&expw=1920&q=wygrana&FORM=IRPRST&ck=7150F4EF4D7E863AD2D563FCDE0257C5&selectedIndex=0&itb=0';

    // embed z nagrodą
    const embed = new EmbedBuilder()
      .setColor(reward.includes('❌') ? '#ff0000' : '#00ff66')
      .setTitle('🎉 DROP × LAVA SHOP 🎉')
      .setDescription(reward.includes('❌') ? reward : `WYGRAŁEŚ:\n**${reward}**`)
      .setImage(reward.includes('❌') ? noDropImg : winDropImg)
      .setFooter({ text: 'Lava Shop × DROP SYSTEM', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (err) {
    console.error('❌ Błąd w /drop:', err);
  }
});

// ====== REJESTRACJA KOMENDY /drop ======
client.once(Events.ClientReady, async () => {
  try {
    const commands = [
      new SlashCommandBuilder()
        .setName('drop')
        .setDescription('🎁 Otwórz darmowy **DROP** Lava Shop (co 2h)')
    ].map(cmd => cmd.toJSON());

    await client.application.commands.set(commands);
    console.log('✅ Komenda /drop została zarejestrowana!');
  } catch (err) {
    console.error('❌ Błąd przy rejestracji /drop:', err);
  }
});
// ====== LOGOWANIE ======
client.login(process.env.TOKEN);



























