const { Telegraf } = require('telegraf');
const axios = require('axios');

// Replace with your actual bot token
const TELEGRAM_BOT_TOKEN = '789584574:AAGpw0FjzSm2kPTb0wNFNnUY_WDPA7csRL0';

// Initialize the bot
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Function to simulate login and fetch cookies and CSRF token
const simulateLogin = async () => {
  const loginUrl = 'https://sw.ministry.et/login'; // Replace with the actual login URL
  const loginData = {
    email: 'your-email@example.com', // Replace with your login credentials
    password: 'your-password', // Replace with your login credentials
  };

  try {
    const response = await axios.post(loginUrl, loginData, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Host': 'sw.ministry.et',
        'Referer': 'https://sw.ministry.et/',
        'Sec-Ch-Ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
      },
    });

    // Log the response to see cookies and headers
    console.log('Login Response:', response.headers);

    const cookies = response.headers['set-cookie'];
    const xsrfToken = cookies.find((cookie) => cookie.startsWith('XSRF-TOKEN')).split(';')[0];
    const sessionCookie = cookies.find((cookie) => cookie.startsWith('ministry_rostering_and_management_system_session')).split(';')[0];

    console.log('Cookies:', cookies);
    console.log('XSRF Token:', xsrfToken);
    console.log('Session Cookie:', sessionCookie);

    return { xsrfToken, sessionCookie };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Start command
bot.command('start', (ctx) => {
  ctx.reply('Welcome! Please enter your registration number:');
});

// Handle registration number input
bot.on('text', async (ctx) => {
  const registrationNumber = ctx.message.text;

  try {
    // Simulate login and fetch fresh cookies and CSRF token
    const { xsrfToken, sessionCookie } = await simulateLogin();

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
        'Cookie': `${xsrfToken}; ${sessionCookie}`,
        'Host': 'sw.ministry.et',
        'Referer': 'https://sw.ministry.et/',
        'Sec-Ch-Ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'X-XSRF-TOKEN': xsrfToken.split('=')[1],
      },
    });

    // Log the entire response for debugging
    console.log('Result Response Data:', response.data);

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
<pre>${JSON.stringify(result, null, 2)}</pre>
      `;

      // Send the formatted result
      await ctx.replyWithHTML(formattedResult);
    } else if (response.status === 403) {
      await ctx.reply('Access denied. Please check your input or try again later.');
    } else {
      await ctx.reply('Failed to fetch the result. Please check the registration number and first name.');
    }
  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching result:', error);

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
