const puppeteer = require('puppeteer');
const fs = require('fs');

const scrapeResultAndScreenshot = async (registrationNumber, firstName) => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set user-agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

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

    // Save the result as a text file with dynamic naming
    const resultFileName = `exam-result-${registrationNumber}.txt`;
    fs.writeFileSync(resultFileName, result);
    console.log('Exam Result:', result);

    // Take a screenshot of the page with dynamic naming
    const screenshotFileName = `result-screenshot-${registrationNumber}.png`;
    await page.screenshot({ path: screenshotFileName });
    console.log(`Screenshot saved as ${screenshotFileName}`);

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
