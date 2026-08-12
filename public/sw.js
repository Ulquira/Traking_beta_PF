// Este es un Service Worker vacío necesario para poder mostrar notificaciones push en dispositivos móviles.
self.addEventListener('push', function(event) {
  console.log('Push message received');
});
