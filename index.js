const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// Replace with your actual bot token
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';

// Initialize the bot
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Conversation states
const REGISTRATION = 'REGISTRATION';
const FIRST_NAME = 'FIRST_NAME';

// Store user data temporarily
const userData = {};

// Start command
bot.command('start', (ctx) => {
  ctx.reply('Welcome! Please enter your registration number:');
  userData[ctx.from.id] = {}; // Initialize user data
  return ctx.scene.enter(REGISTRATION);
});

// Handle registration number input
bot.on('text', (ctx) => {
  const userId = ctx.from.id;
  if (!userData[userId]) {
    return ctx.reply('Please start the conversation with /start.');
  }

  if (!userData[userId].registrationNumber) {
    userData[userId].registrationNumber = ctx.message.text;
    ctx.reply('Thank you! Now, please enter your first name:');
    return ctx.scene.enter(FIRST_NAME);
  }

  if (!userData[userId].firstName) {
    userData[userId].firstName = ctx.message.text;
    fetchAndDisplayResult(ctx);
  }
});

// Fetch and display the result
async function fetchAndDisplayResult(ctx) {
  const userId = ctx.from.id;
  const { registrationNumber, firstName } = userData[userId];

  try {
    // Construct the URL
    const url = `https://sw.ministry.et/student-result/${registrationNumber}?first_name=${firstName}&qr=`;

    // Fetch the result
    const response = await axios.get(url);

    if (response.status === 200) {
      const result = response.data;

      // Fetch the student's photo (replace with actual logic)
      const photoUrl = `https://assets.sw.ministry.et/2017/student-photo/1739542829-44705-29217/6002047-${registrationNumber}.jpeg`;

      // Send the photo
      await ctx.replyWithPhoto(photoUrl);

      // Format the result with HTML
      const formattedResult = `
<b>🎓 Student Information:</b>
<b>Name:</b> ${firstName}
<b>Registration Number:</b> ${registrationNumber}
<b>Result:</b>
<i>${JSON.stringify(result, null, 2)}</i>
      `;

      // Send the formatted result
      await ctx.replyWithHTML(formattedResult);
    } else {
      await ctx.reply('Failed to fetch the result. Please check the registration number and first name.');
    }
  } catch (error) {
    await ctx.reply(`An error occurred: ${error.message}`);
  } finally {
    // Clear user data
    delete userData[userId];
  }
}

// Launch the bot
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
