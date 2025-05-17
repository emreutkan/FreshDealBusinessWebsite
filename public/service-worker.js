self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        title: data.notification.title,
        body: data.notification.body,
        icon: data.notification.icon || '/logo192.png',
        badge: data.notification.badge,
        tag: data.notification.tag,
        data: data.notification.data,
        actions: data.notification.actions,
        requireInteraction: data.notification.requireInteraction
    };

    event.waitUntil(
        self.registration.showNotification(options.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.notification.data?.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});