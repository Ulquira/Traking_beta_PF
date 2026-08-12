import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Reemplaza estos valores con tu configuración de Firebase
// Obtén estos valores desde: Firebase Console > Proyecto > Configuración > Tu aplicación web
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Analytics
const analytics = getAnalytics(app);

// Función para rastrear eventos custom en Firebase y en nuestra BD MySQL local
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  // 1. Firebase Analytics (Existente)
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (e) {
    console.error("Error al registrar en Firebase:", e);
  }

  // 2. Base de Datos MySQL (Custom Logs_Traking)
  try {
    const token = eventParams?.token || "";
    if (token) {
      const detalles = { ...eventParams };
      delete detalles.token; // No repetir el token que irá en su propia columna

      fetch(`${import.meta.env.VITE_API_URL}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          evento: eventName,
          detalles: Object.keys(detalles).length > 0 ? detalles : null
        })
      }).catch(err => console.error("Error al guardar log custom en MySQL:", err));
    }
  } catch (e) {
    console.error("Error en log custom local:", e);
  }
};

export { analytics };
export default app;
