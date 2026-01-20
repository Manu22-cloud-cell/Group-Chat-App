const cron = require("node-cron");
const archivePrivateMessages = require("../services/archivePrivateMessages");
const archiveGroupMessages = require("../services/archiveGroupMessages");

// Every day at 2 AM
cron.schedule("0 2 * * *", async () => {
  console.log("Running archive jobs...");

  await archivePrivateMessages();
  await archiveGroupMessages();
});
