const { Telegraf } = require('telegraf');
const puppeteer = require('puppeteer-core'); // Use puppeteer-core to manually provide the Chromium executable path
const fs = require('fs');
require('dotenv').config(); // To load the bot token from the environment variable

const bot = new Telegraf(process.env.BOT_TOKEN); // Use the token from the environment variable

bot.start((ctx) => {
    ctx.reply('Welcome! Send your registration number and first name in this format:\n0099617 hanos');
});

bot.on('text', async (ctx) => {
    try {
        const message = ctx.message.text.trim();
        const parts = message.split(' ');

        if (parts.length !== 2) {
            return ctx.reply('Invalid format. Please send: RegistrationNumber FirstName');
        }

        const registrationNumber = parts[0];
        const firstName = parts[1];
        const resultUrl = `https://sw.ministry.et/student-result/${registrationNumber}?first_name=${firstName}&qr=`;

        ctx.reply('Fetching your result, please wait...');

        // Launch puppeteer with headless mode and specify the executable path to Chromium if needed
        const browser = await puppeteer.launch({
            headless: "new", // New headless mode for future compatibility
            executablePath: '/path/to/your/chromium' // Specify the path if using puppeteer-core (set your actual Chromium path here)
        });

        const page = await browser.newPage();
        await page.goto(resultUrl, { waitUntil: 'networkidle2', timeout: 30000 }); // Wait until the page is loaded completely

        const pageText = await page.evaluate(() => document.body.innerText); // Extract all text content from the page
        const screenshotPath = `result_${registrationNumber}.png`; // Path to store the screenshot

        await page.screenshot({ path: screenshotPath, fullPage: true }); // Capture the screenshot of the result page

        await browser.close();

        // Send text results to the user
        ctx.reply(`Exam Results:\n${pageText}`);

        // Send the screenshot to the user
        await ctx.replyWithPhoto({ source: screenshotPath });

        // Clean up by deleting the screenshot file after sending it
        fs.unlinkSync(screenshotPath);

    } catch (error) {
        console.error('Error fetching results:', error);
        ctx.reply('Failed to fetch results. Please check your details and try again.');
    }
});

bot.launch()
    .then(() => console.log('Bot is running...'))
    .catch(error => console.error('Error launching bot:', error));
