const puppeteer = require('puppeteer');
const fs = require('fs');

const scrapeResultAndScreenshot = async (registrationNumber, firstName) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new", // Use the new headless mode
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required for Render
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, // Use the environment variable for the executable path
    });
    const page = await browser.newPage();

    // Go to the result page
    await page.goto(`https://sw.ministry.et/student-result/${registrationNumber}?first_name=${firstName}&qr=`, {
      waitUntil: 'domcontentloaded',
    });

    // Wait for the content to load
    await page.waitForSelector('.result-container', { timeout: 30000 });

    // Extract the exam result
    const result = await page.evaluate(() => {
      const resultElement = document.querySelector('.result-container');
      return resultElement ? resultElement.textContent.trim() : 'Result not found';
    });

    // Save the result as a text file
    fs.writeFileSync('exam-result.txt', result);
    console.log('Exam Result:', result);

    // Take a screenshot of the page
    await page.screenshot({ path: 'result-screenshot.png' });
    console.log('Screenshot saved as result-screenshot.png');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Call the function with registration number and first name
scrapeResultAndScreenshot('0099617', 'hanos');
