const puppeteer = require('puppeteer');
const fs = require('fs');

const scrapeResultAndScreenshot = async (registrationNumber, firstName) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Go to the result page
  await page.goto(`https://sw.ministry.et/student-result/${registrationNumber}?first_name=${firstName}&qr=`, {
    waitUntil: 'domcontentloaded',
  });

  // Wait for the content to load (adjust the selector based on the actual page structure)
  await page.waitForSelector('.result-container'); // Adjust this to match the actual result container on the page

  // Extract the exam result (modify the selector accordingly)
  const result = await page.evaluate(() => {
    const resultElement = document.querySelector('.result-container'); // Modify this selector to the actual one
    return resultElement ? resultElement.textContent.trim() : 'Result not found';
  });

  // Save the result as a text file
  fs.writeFileSync('exam-result.txt', result);

  console.log('Exam Result:', result);

  // Take a screenshot of the page
  await page.screenshot({ path: 'result-screenshot.png' });

  console.log('Screenshot saved as result-screenshot.png');

  await browser.close();
};

// Call the function with registration number and first name
scrapeResultAndScreenshot('0099617', 'hanos');
