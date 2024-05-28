import puppeteer from "puppeteer";

// Fonction pour récupérer les titres et les liens des articles
async function fetchBlogTitles(url) {
  // Lancer le navigateur et ouvrir une nouvelle page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Naviguer vers l'URL spécifiée et attendre que le réseau soit inactif
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Attendre que les articles soient chargés
  await page.waitForSelector(".gridlove-posts");

  // Extraire les titres et les liens des articles
  const articles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".gridlove-posts .entry-title a")).map(element => ({
      title: element.textContent.trim(),
      link: element.href
    }));
  });

  // Fermer le navigateur
  await browser.close();

  // Retourner les titres et les liens extraits
  return articles;
}

// Fonction pour récupérer le contenu de chaque article
async function fetchBlogContent(articlesArray) {
  const browser = await puppeteer.launch();
  let result = [];

  // Boucler dans le tableau des articles
  for (let article of articlesArray) {
    const page = await browser.newPage();
    
    // Accéder à l'URL de l'article
    await page.goto(article.link, { waitUntil: 'networkidle2' });

    // Extraire le texte du deuxième élément .entry-content
    const content = await page.evaluate(() => {
      const contentElements = document.querySelectorAll(".entry-content");
      return contentElements.length > 1 ? contentElements[1].textContent.trim() : "";
    });

    // Ajouter l'objet avec le titre et le contenu dans le résultat
    result.push({
      title: article.title,
      link: article.link,
      content: content
    });

    await page.close(); // Fermer la page après extraction
  }

  await browser.close();

  // Retourner le résultat
  return result;
}

// Fonction principale pour exécuter le script
(async () => {
  const url = "https://www.codeur.com/blog/developpement/intelligence-artificielle/";
  const articles = await fetchBlogTitles(url);

  // Récupérer le contenu de chaque article
  const articlesContent = await fetchBlogContent(articles);

  // Afficher les titres et les contenus dans la console
  console.log(articlesContent);
})();
