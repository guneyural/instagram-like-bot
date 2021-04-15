const puppeteer = require("puppeteer");

const BASE_URL = "https://www.instagram.com/accounts/emailsignup/";
const TAG_URL = (tag) => `https://www.instagram.com/explore/tags/${tag}/`;

const instagram = {
  browser: null,
  page: null,
  initialize: async () => {
    instagram.browser = await puppeteer.launch({ headless: false });
    instagram.page = await instagram.browser.newPage();
    await instagram.page.setViewport({ width: 1000, height: 768 });
  },
  login: async (username, password) => {
    await instagram.page.goto(BASE_URL, { waitUntil: "networkidle2" });

    const loginPageSelector = "p.izU2O a";
    await instagram.page.waitForSelector(loginPageSelector);
    await instagram.page.click(loginPageSelector);

    // Wait for input fields to be loaded
    await instagram.page.waitForSelector('input[name="username"]');
    await instagram.page.waitForSelector('input[name="password"]');

    // Type the parameters. Delay is for puppeteer to copy paste type like a real human
    await instagram.page.type('input[name="username"]', username, {
      delay: 40,
    });
    await instagram.page.type('input[name="password"]', password, {
      delay: 40,
    });

    await Promise.all([
      instagram.page.click('button[type="submit"]'),
      instagram.page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    const notNowButton = await instagram.page.evaluateHandle(() => {
      const buttons = document.querySelectorAll("button");
      return buttons[1];
    });

    const notNowForNotificationsButton = "._1XyCr button:nth-of-type(2)";
    try {
      await notNowButton.click();
      await instagram.page.waitForNavigation({ waitUntil: "networkidle2" });
    } catch (err) {
      console.log("Error while clicking not now button. Trying again...");
    }

    try {
      await instagram.page.waitForSelector(notNowForNotificationsButton);
      await instagram.page.click(notNowForNotificationsButton);
    } catch (err) {
      console.log(
        "error while clicking not now button for NOTIFICATION. Trying again..."
      );
    }
  },
  likeTagsProcess: async (tags = []) => {
    for (let tag of tags) {
      await instagram.page.goto(TAG_URL(tag), { waitUntil: "networkidle2" });
      await instagram.page.waitForSelector("article img");

      const posts = await instagram.page.$$("article img");
      for (let i = 0; i < 3; i++) {
        const post = posts[i];
        await post.click();
        await instagram.page.waitForSelector("article[role='presentation']");
        await instagram.page.waitForSelector(
          "article[role='presentation'] section button"
        );
        await instagram.page.click(
          "article[role='presentation'] section button"
        );
        await instagram.page.click(
          "div[role='dialog']:nth-of-type(2)+div button"
        );
        await instagram.page.waitFor(800);
      }
    }
    await instagram.browser.close();
  },
};

module.exports = instagram;
