# 🔒 Cloud SQL Auth Proxy - Guía de Implementación

## ✅ Cambios realizados:

1. ✓ **Dockerfile.capa** - Incluye Cloud SQL Auth Proxy
2. ✓ **Dockerfile.api** - Incluye Cloud SQL Auth Proxy  
3. ✓ **server/db.ts** - Cambiado a usar `localhost` (predeterminado)

---

## 📋 Pasos para desplegar en Cloud Run:

### **Paso 1: Construir y subir la imagen**

```bash
# Para Capa Intermedia
gcloud builds submit --tag gcr.io/dynamic-radar-470920-g9/capa-intermedia:latest -f Dockerfile.capa

# Para API Principal
gcloud builds submit --tag gcr.io/dynamic-radar-470920-g9/api-principal:latest -f Dockerfile.api
```

---

### **Paso 2: Desplegar en Cloud Run (Capa Intermedia)**

```bash
gcloud run deploy capa-intermedia \
  --image gcr.io/dynamic-radar-470920-g9/capa-intermedia:latest \
  --platform managed \
  --region us-east4 \
  --port 4001 \
  --memory 512Mi \
  --set-env-vars DB_USER=Quantum,DB_PASSWORD=Tonoso.33,DB_NAME=BBDD,DB_PORT=3306,PORT=4001,SECRET_API_KEY=LLAVE_SECRETA_DEL_TERCERO_123 \
  --no-allow-unauthenticated \
  --service-account=default@dynamic-radar-470920-g9.iam.gserviceaccount.com
```

**Nota:** Asegúrate de que tu `default` service account tenga estos permisos:
- `roles/cloudsql.client` (acceso a Cloud SQL)
- `roles/run.invoker` (si necesita ser invocada por otros servicios)

---

### **Paso 3: Desplegar en Cloud Run (API Principal) - Opcional**

```bash
gcloud run deploy api-principal \
  --image gcr.io/dynamic-radar-470920-g9/api-principal:latest \
  --platform managed \
  --region us-east4 \
  --port 3001 \
  --memory 512Mi \
  --set-env-vars DB_USER=Quantum,DB_PASSWORD=Tonoso.33,DB_NAME=BBDD,DB_PORT=3306,PORT=3001,SECRET_API_KEY=LLAVE_SECRETA_DEL_TERCERO_123,CAPA_INTERMEDIA_URL=https://capa-intermedia-xxxxx.run.app \
  --no-allow-unauthenticated \
  --service-account=default@dynamic-radar-470920-g9.iam.gserviceaccount.com
```

---

### **Paso 4: Verificar permisos en Cloud SQL**

En Google Cloud Console:
1. Ve a **Cloud SQL > Instancias > quantum-vn**
2. Abre **Conexiones**
3. Verifica que esté habilitada la conexión privada de Cloud Run
4. **Asegúrate de que NO haya conexión pública** (0.0.0.0/0 debe estar removida)

---

## 🔐 **Seguridad - Lo que ahora está protegido:**

✅ **Antes:** MySQL accesible por IP pública a todo el mundo (0.0.0.0/0)  
✅ **Ahora:** MySQL solo accesible desde servicios de Cloud Run autenticados

La conexión entre Cloud Run y Cloud SQL es:
- Privada (no pasa por internet público)
- Encriptada
- Solo servicios con el service account correcto pueden conectarse

---

## 📝 Variables de Entorno en Cloud Run

```env
# Base de datos
DB_USER=Quantum
DB_PASSWORD=Tonoso.33
DB_NAME=BBDD
DB_PORT=3306
DB_HOST=localhost  # El proxy escucha en localhost:3306

# Servidor
PORT=4001  # Para capa_intermedia; 3001 para API

# Seguridad
SECRET_API_KEY=LLAVE_SECRETA_DEL_TERCERO_123

# Solo para API principal:
CAPA_INTERMEDIA_URL=https://capa-intermedia-xxxxx.run.app

# Firebase (opcional, si lo necesitas en backend)
VITE_FIREBASE_PROJECT_ID=dynamic-radar-470920-g9
```

---

## ❓ **Preguntas frecuentes:**

**P: ¿Por qué 4001 y 3001 en Cloud Run?**  
R: Son los puertos internos. Cloud Run automáticamente mapea a puerto 443 externamente.

**P: ¿Qué pasa si se cae el proxy?**  
R: El container falla y Cloud Run automáticamente lo reinicia.

**P: ¿Necesito configurar Cloud SQL Proxy en local?**  
R: No. Localmente sigues usando la IP pública en DB_HOST (o localhost si tienes MySQL local).

**P: ¿Por qué no estoy viendo datos?**  
R: Revisa:
- Los logs en Cloud Run (`gcloud run logs`)
- Permisos IAM del service account
- Que la instancia Cloud SQL esté running

---

## 🚀 **Comandos útiles para debugging:**

```bash
# Ver logs
gcloud run logs read capa-intermedia --region us-east4

# Ver configuración de servicio
gcloud run services describe capa-intermedia --region us-east4

# Verificar service account
gcloud iam service-accounts list

# Dar permisos al service account
gcloud projects add-iam-policy-binding dynamic-radar-470920-g9 \
  --member=serviceAccount:default@dynamic-radar-470920-g9.iam.gserviceaccount.com \
  --role=roles/cloudsql.client
```

---

¡Implementa estos cambios y avísame cuando los servicios estén en Cloud Run! 🎉
