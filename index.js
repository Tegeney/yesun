const { Telegraf } = require('telegraf');
const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config(); // To load the bot token from an environment variable

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

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(resultUrl, { waitUntil: 'networkidle2', timeout: 30000 }); // Add timeout for slow loading pages

        // Extract all text from the page
        const pageText = await page.evaluate(() => document.body.innerTex
