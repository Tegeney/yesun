const { Telegraf } = require('telegraf');
const axios = require('axios');
const express = require('express');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post(`/webhook/${process.env.BOT_TOKEN}`, async (req, res) => {
    try {
        const ctx = req.body;
        await bot.handleUpdate(ctx);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error in webhook handler:', error);
        res.sendStatus(500);
    }
});

bot.start((ctx) => {
    ctx.reply('Welcome! Send your registration number and first name in this format:\n0099617 Hanos');
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

        const response = await axios.get(resultUrl);
        const data = response.data;

        if (!data.student) {
            return ctx.reply('No results found. Please check your details and try again.');
        }

        const student = data.student;
        const courses = data.courses.map(course => course.name).join('\n');

        const resultMessage = `
Name: ${student.name}
Age: ${student.age}
School: ${student.school}
Woreda: ${student.woreda}
Zone: ${student.zone}
Language: ${student.language}
Gender: ${student.gender}
Nationality: ${student.nationality}

Courses:
${courses}
        `;

        // Send the student's photo
        await ctx.replyWithPhoto({ url: student.photo });

        // Send the result message
        ctx.reply(resultMessage);

    } catch (error) {
        console.error('Error fetching results:', error);
        ctx.reply('Failed to fetch results. Please check your details and try again.');
    }
});

const webhookUrl = `https://yesun.onrender.com/webhook/${process.env.BOT_TOKEN}`;
bot.telegram.setWebhook(webhookUrl)
    .then(() => {
        console.log('Webhook is set successfully');
    })
    .catch(error => {
        console.error('Error setting webhook:', error);
    });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
