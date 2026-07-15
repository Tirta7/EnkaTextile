import webpush from "web-push";
import { db } from "@workspace/db";
import { pushSubscriptionsTable, usersTable, settingsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { logger } from "./logger";

// Inisialisasi VAPID
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || "";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@vocpos.com";

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
} else {
  logger.warn("VAPID Keys belum dikonfigurasi di .env");
}

export const pushService = {
  async saveSubscription(userId: number, subscriptionDto: any) {
    try {
      // Cek apakah endpoint sudah ada
      const existing = await db
        .select()
        .from(pushSubscriptionsTable)
        .where(eq(pushSubscriptionsTable.endpoint, subscriptionDto.endpoint))
        .limit(1);

      if (existing.length > 0) {
        // Update user ID
        await db
          .update(pushSubscriptionsTable)
          .set({ userId })
          .where(eq(pushSubscriptionsTable.endpoint, subscriptionDto.endpoint));
      } else {
        // Create new
        await db.insert(pushSubscriptionsTable).values({
          userId,
          endpoint: subscriptionDto.endpoint,
          p256dh: subscriptionDto.keys.p256dh,
          auth: subscriptionDto.keys.auth,
        });
      }
      return true;
    } catch (error) {
      logger.error(error, "Gagal menyimpan subscription");
      throw error;
    }
  },

  async sendNotificationToAdmins(title: string, body: string, url: string = "/") {
    try {
      // Dapatkan semua admin
      const admins = await db.select().from(usersTable).where(eq(usersTable.role, "admin"));
      const adminIds = admins.map((a) => a.id);

      if (adminIds.length === 0) return;

      // Cari subscription mereka
      const subs = await db
        .select()
        .from(pushSubscriptionsTable)
        .where(inArray(pushSubscriptionsTable.userId, adminIds));

      if (subs.length === 0) return;

      // Get dynamic app name
      let appName = "EnkaTextile";
      try {
        const appNameSetting = await db.select().from(settingsTable).where(eq(settingsTable.key, "app_name")).limit(1);
        if (appNameSetting.length > 0) {
          appName = appNameSetting[0].value;
        }
      } catch (e) {
        logger.error("Failed to get app name setting for push notification");
      }
      
      const dynamicTitle = `${appName} - ${title}`;

      const payload = JSON.stringify({
        notification: {
          title: dynamicTitle,
          body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          data: { url }
        }
      });

      const promises = subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
        } catch (error: any) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            // Subscription expired, hapus dari db
            await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.id, sub.id));
          } else {
            logger.error(`Gagal kirim push ke ${sub.id}:`, error);
          }
        }
      });

      await Promise.all(promises);
    } catch (error) {
      logger.error(error, "Error broadcast push notification");
    }
  },
};
