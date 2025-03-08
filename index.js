const { Telegraf } = require('telegraf');
const axios = require('axios');

// Replace with your actual bot token
const TELEGRAM_BOT_TOKEN = '789584574:AAGpw0FjzSm2kPTb0wNFNnUY_WDPA7csRL0';

// Initialize the bot
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Start command
bot.command('start', (ctx) => {
  ctx.reply('Welcome! Please enter your registration number:');
});

// Handle registration number input
bot.on('text', async (ctx) => {
  const registrationNumber = ctx.message.text;

  try {
    // Construct the URL
    const url = `https://sw.ministry.et/student-result/${registrationNumber}?first_name=hanos&qr=`;

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
  }
});

// Launch the bot
bot.launch()
  .then(() => {
    console.log('Bot is running...');
  })
  .catch((error) => {
    console.error('Failed to start the bot:', error);
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
