function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerAndSubscribePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Perangkat ini belum mendukung Push Notification. Jika Anda menggunakan iPhone/iPad (iOS), Anda WAJIB menambahkan aplikasi ini ke "Home Screen" (Add to Home Screen) melalui menu Share di Safari, lalu buka aplikasi dari Home Screen untuk mengaktifkan notifikasi.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Izin notifikasi ditolak oleh pengguna.');
  }

  const response = await fetch("/api/notifications/vapid-public-key");
  const keyData = await response.json();
  
  if (!keyData || !keyData.publicKey) {
    throw new Error('VAPID Public Key belum terkonfigurasi di server.');
  }

  const convertedVapidKey = urlBase64ToUint8Array(keyData.publicKey);

  let subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
  }

  subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });

  await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  });
  
  return true;
}
