import { pushService } from "./src/lib/push";

async function run() {
  try {
    await pushService.sendNotificationToAdmins("Test", "Test", "/");
    console.log("Success");
  } catch (err) {
    console.error("FAIL", err);
  }
  process.exit(0);
}
run();
