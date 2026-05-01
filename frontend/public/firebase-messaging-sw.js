self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const notification = data.notification || {};

  event.waitUntil(
    self.registration.showNotification(notification.title || 'Shvasa', {
      body: notification.body || 'Time to return to your next action.',
      icon: '/icon.png',
    })
  );
});

