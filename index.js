const { Telegraf } = require('telegraf');
const axios = require('axios');

// Replace with your actual bot token
const TELEGRAM_BOT_TOKEN = '789584574:AAGpw0FjzSm2kPTb0wNFNnUY_WDPA7csRL0';

// Initialize the bot
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Function to simulate login and capture CSRF and session cookies
const simulateLogin = async () => {
  const loginUrl = 'https://sw.ministry.et/login'; // Replace with the actual login URL
  const loginData = {
    email: 'your-email@example.com', // Replace with actual credentials
    password: 'your-password', // Replace with actual credentials
  };

  try {
    // Making login request to get the session cookies
    const response = await axios.post(loginUrl, loginData, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Referer': 'https://sw.ministry.et/',
        'Host': 'sw.ministry.et',
        'Sec-Ch-Ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Microsoft Edge";v="134"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
      },
    });

    // Log the headers and cookies to see if we get the expected ones
    console.log('Login Response:', response.headers);
    
    // Capture cookies for the session and CSRF token
    const cookies = response.headers['set-cookie'];
    const xsrfToken = cookies.find((cookie) => cookie.startsWith('XSRF-TOKEN')).split(';')[0];
    const sessionCookie = cookies.find((cookie) => cookie.startsWith('ministry_rostering_and_management_system_session')).split(';')[0];
    
    console.log('Cookies:', cookies);
    console.log('XSRF Token:', xsrfToken);
    console.log('Session Cookie:', sessionCookie);

    return { xsrfToken, sessionCookie };
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Start command for bot
bot.command('start', (ctx) => {
  ctx.reply('Welcome! Please enter your registration number:');
});

// Handle registration number input
bot.on('text', async (ctx) => {
  const registrationNumber = ctx.message.text;

  try {
    // Step 1: Simulate login and capture cookies and CSRF token
    const { xsrfToken, sessionCookie } = await simulateLogin();

    // Step 2: Make request to get student result
    const resultUrl = `https://sw.ministry.et/student-result/${registrationNumber}?first_name=hanos&qr=`;

    // Fetch the result using the captured cookies and token
    const response = await axios.get(resultUrl, {
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
        'X-XSRF-TOKEN': xsrfToken.split('=')[1],
      },
    });

    console.log('Result Response:', response.data);

    if (response.status === 200) {
      const result = response.data;

      // Handle result display, e.g., sending it back to the user
      await ctx.replyWithHTML(`
<b>🎓 Student Information:</b>
<b>Registration Number:</b> ${registrationNumber}
<b>Result:</b>
<pre>${JSON.stringify(result, null, 2)}</pre>
      `);
    } else {
      await ctx.reply('Failed to fetch the result. Please try again later.');
    }
  } catch (error) {
    // Log error details for debugging
    console.error('Error fetching result:', error);
    if (error.response && error.response.status === 403) {
      await ctx.reply('Access denied. Please check your input or try again later.');
    } else {
      await ctx.reply('An error occurred. Please try again later.');
    }
  }
});

// Start the bot
bot.launch()
  .then(() => console.log('Bot is running...'))
  .catch((error) => console.error('Error starting bot:', error));

