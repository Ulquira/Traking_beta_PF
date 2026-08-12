# 📊 Firebase Analytics - Guía de Configuración

## ✅ Lo que he hecho:

1. ✓ Creado archivo de configuración: `src/lib/firebaseConfig.ts`
2. ✓ Actualizado `src/main.tsx` para inicializar Analytics
3. ✓ Creado plantilla de variables de entorno: `.env.example`

---

## 📋 Pasos que DEBES hacer ahora:

### **Paso 1: Instalar Firebase**
Abre una terminal en VS Code y ejecuta:
```bash
npm install firebase
```

---

### **Paso 2: Obtener tus credenciales de Firebase**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Configuración** (⚙️ arriba a la derecha)
4. Abre la pestaña **Tu aplicación**
5. Selecciona tu aplicación web (o crea una si no existe)
6. Copia la configuración (verás algo así):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "myproject.firebaseapp.com",
  projectId: "myproject",
  storageBucket: "myproject.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXX"
};
```

---

### **Paso 3: Crear archivo `.env` en la raíz del proyecto**

Copia el contenido de `.env.example` y reemplaza con tus valores:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=myproject.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=myproject
VITE_FIREBASE_STORAGE_BUCKET=myproject.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX
```

⚠️ **IMPORTANTE**: No commits el `.env` a git (está en `.gitignore`)

---

### **Paso 4: Habilitar Analytics en Firebase Console**

1. En Firebase Console, ve a **Analytics** (lado izquierdo)
2. Haz clic en **Comenzar**
3. Acepta los términos y ¡listo!

---

### **Paso 5: Reinicia tu app**

```bash
npm run dev
```

---

## 📊 ¿Qué se está registrando automáticamente?

Firebase Analytics captura automáticamente:
- ✅ **Visitas de página** - Cada vez que alguien accede a `/` o `/seguimiento/:token`
- ✅ **Duración de sesión** - Cuánto tiempo pasa el usuario en la web
- ✅ **Dispositivo** - Desktop, mobile, tablet
- ✅ **Navegador** - Chrome, Firefox, Safari, etc.
- ✅ **Ubicación** - País, ciudad (aproximada)
- ✅ **Sistema operativo** - Windows, iOS, Android, etc.
- ✅ **Referrer** - De dónde viene (qué link clickeó)

---

## 👁️ Ver los datos

1. Ve a Firebase Console
2. Abre **Analytics > Dashboard**
3. Verás gráficos de usuarios, duración, dispositivos, etc.

---

## 📝 Próximo paso (Opción B)

Cuando quieras rastrear eventos específicos (quién entra, qué hace), solo tienes que usar:

```typescript
import { trackEvent } from '@/lib/firebaseConfig';

// Cuando alguien completa encuesta:
trackEvent('encuesta_completada', {
  token: 'abc123',
  timestamp: new Date().toISOString()
});
```

¡Avísame cuando tengas los datos en Firebase y hacemos la Opción B! 🚀
