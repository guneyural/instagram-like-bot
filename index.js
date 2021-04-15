const ig = require("./instagram");

(async () => {
  await ig.initialize();
  await ig.login(YOUR_USERNAME, YOUR_PASSWORD);
  await ig.likeTagsProcess(["bmw", "m4"]);
  debugger;
})();
