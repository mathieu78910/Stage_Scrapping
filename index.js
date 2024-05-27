import puppeteer from "puppeteer";

async function fetchBlogTitles(url) {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to the URL
  await page.goto(url);

  // Wait for the articles to load
  const t = await page.waitForSelector(".gridlove-posts");

  // // Extract the titles of the articles
  // const titles = await page.evaluate(() => {
  //   // Select all elements with the class 'post-title' and map their text content
  //   return Array.from(document.querySelectorAll(".article")).map((element) =>
  //     element.textContent.trim()
  //   );
  // });

  console.log(t, "ijgkhg")

  

  // Close the browser
  await browser.close();

  // // Return the extracted titles
  // return titles;
}

(async () => {
  const url =
    "https://www.codeur.com/blog/developpement/intelligence-artificielle/";
  const titles = await fetchBlogTitles(url);

  // console.log("titreBlog");
  // titles.forEach((title, index) => {
  //   console.log(`${index + 1}. ${title}`);
  // });
})();
