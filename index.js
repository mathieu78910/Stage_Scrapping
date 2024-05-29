import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction pour récupérer les titres et les liens des articles
async function fetchBlogTitles(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('.gridlove-posts');

  const articles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.gridlove-posts .entry-title a')).map(element => ({
      title: element.textContent.trim(),
      link: element.href
    }));
  });

  await browser.close();
  return articles;
}

// Fonction pour récupérer le contenu de chaque article
async function fetchBlogContent(articlesArray) {
  const browser = await puppeteer.launch();
  let result = [];

  for (let article of articlesArray) {
    const page = await browser.newPage();
    await page.goto(article.link, { waitUntil: 'networkidle2' });

    const content = await page.evaluate(() => {
      const contentElements = document.querySelectorAll('.entry-content');
      return contentElements.length > 1 ? contentElements[1].textContent.trim() : '';
    });

    result.push({
      title: article.title,
      link: article.link,
      content: content
    });

    await page.close();
  }

  await browser.close();
  return result;
}

// Fonction pour insérer les données dans la base de données
async function insertIntoDatabase(articlesContent) {
  for (const article of articlesContent) {
    await prisma.sources.create({
      data: {
        title: article.title,
        link: article.link,
        content: article.content
      }
    });
  }
}

// Fonction principale pour exécuter le script
(async () => {
  const url = 'https://www.codeur.com/blog/developpement/intelligence-artificielle/';
  const articles = await fetchBlogTitles(url);
  const articlesContent = await fetchBlogContent(articles);

  // Insérer les articles récupérés dans la base de données
  await insertIntoDatabase(articlesContent);
  
  // Fermer Prisma Client
  await prisma.$disconnect();
})();
