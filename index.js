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

    // Fetch the result with authentication headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Cookie': 'XSRF-TOKEN=eyJpdiI6InZBcmlTbjBMbnJSa3o4eE1PQlZHZFE9PSIsInZhbHVlIjoiWEtFdUg2VGdscWJJci8yK3lwNWFTTVFvOEZvUUFOMzFmbEpoblBWY1hxWTNPK1g2M2FIem9leURoMkFsRUFtQTYzNkV4MWlpM3pnQkRBaE1sdWdFRUtMMnRpcUFBT1gzT2JwZ3Z0Z0RGZmFyY2VxVXZCc3ZKY1V1NFJBYzBsNGMiLCJtYWMiOiJjM2E5YjU1Y2I5OTE0MTRmOTVmNmJiMzk3ZTliOWJkOGJhZWNkMmQ2YzdlMTZmNTkzNjllMzE0ZTMyZTljNTg1IiwidGFnIjoiIn0%3D; ministry_rostering_and_management_system_session=eyJpdiI6Im5MRExuckRNb1QyWHVtbnhkOXhRUGc9PSIsInZhbHVlIjoidk1qa3ZCTUlEWElacmFXa29RU0ZpdUdGTGc5a09CdjcvdG1HZU9XYXNpMHRBeVc2Q0ZZb1I4c0w0NzFGR2ZMbHNxd2w4ZW1DSzlPNGp2Y21aNHR6N3NCYUtBdVBibGlCblZrNjZFRVpJbllMSnFLNVpZMHFLV2tTcjBGeXJPSkciLCJtYWMiOiIzZmJkNjMzNzM3MGY0NTFhNWUwMGNjM2Y4OTllYjlkMjM1Y2JjODBmMDM4NjJmODM2ZDMxNTcxNzE1MTExNTAxIiwidGFnIjoiIn0%3D',
        'Host': 'sw.ministry.et',
        'Referer': 'https://sw.ministry.et/',
        'Sec-Ch-Ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'X-XSRF-TOKEN': 'eyJpdiI6InZBcmlTbjBMbnJSa3o4eE1PQlZHZFE9PSIsInZhbHVlIjoiWEtFdUg2VGdscWJJci8yK3lwNWFTTVFvOEZvUUFOMzFmbEpoblBWY1hxWTNPK1g2M2FIem9leURoMkFsRUFtQTYzNkV4MWlpM3pnQkRBaE1sdWdFRUtMMnRpcUFBT1gzT2JwZ3Z0Z0RGZmFyY2VxVXZCc3ZKY1V1NFJBYzBsNGMiLCJtYWMiOiJjM2E5YjU1Y2I5OTE0MTRmOTVmNmJiMzk3ZTliOWJkOGJhZWNkMmQ2YzdlMTZmNTkzNjllMzE0ZTMyZTljNTg1IiwidGFnIjoiIn0=',
      },
    });

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
    } else if (response.status === 403) {
      await ctx.reply('Access denied. Please check your input or try again later.');
    } else {
      await ctx.reply('Failed to fetch the result. Please check the registration number and first name.');
    }
  } catch (error) {
    if (error.response && error.response.status === 403) {
      await ctx.reply('Access denied. Please check your input or try again later.');
    } else {
      await ctx.reply(`An error occurred: ${error.message}`);
    }
  }
});

// Webhook setup
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = 'https://yesun.onrender.com'; // Your Render webhook URL

// Start the bot using webhooks
bot.launch({
  webhook: {
    domain: WEBHOOK_URL,
    port: PORT,
  },
})
  .then(() => {
    console.log(`Bot is running on port ${PORT}...`);
  })
  .catch((error) => {
    console.error('Failed to start the bot:', error);
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
