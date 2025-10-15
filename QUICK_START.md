# 🚀 Guía Rápida - Arquitectura Modular

## ✅ Verificación Post-Migración

### Paso 1: Verificar Instalación

```bash
# Verificar que node_modules existen
ls node_modules        # Frontend
ls backend/node_modules # Backend

# Si faltan dependencias
npm install            # Frontend
cd backend && npm install # Backend
```

### Paso 2: Iniciar el Backend

```bash
cd backend
npm start

# Deberías ver:
# ✅ Backend en http://localhost:3000
# ℹ️ Entorno: development
# ℹ️ Arquitectura: Modular (Vertical Slices)
```

### Paso 3: Iniciar el Frontend (En otra terminal)

```bash
# Desde la raíz del proyecto
npm run dev

# Deberías ver:
# VITE ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

### Paso 4: Probar la Aplicación

1. **Login**: http://localhost:5173
   - Usuario: `admin`
   - Contraseña: `admin123`

2. **Dashboard**: Debe mostrar la lista de empleados

3. **Crear Empleado**: Probar el formulario de creación

4. **Módulos**: Probar cada módulo:
   - Información Personal
   - Formación
   - Experiencia
   - Otros Documentos

---

## 🔍 Endpoints del Nuevo Backend

### Verificar que el backend responde:

```bash
# Salud del servidor
curl http://localhost:3000

# Respuesta esperada:
{
  "success": true,
  "message": "✅ Backend OK - Arquitectura Modular",
  "version": "2.0.0",
  "architecture": "Modular (Vertical Slices)"
}
```

### Probar Login:

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Respuesta esperada:
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin"
    }



```

### Probar Empleados (con token):

```bash
# Primero obtén el token del login
TOKEN="tu_token_aqui"

curl -X GET http://localhost:3000/empleados \
  -H "Authorization: Bearer $TOKEN"

# Respuesta esperada:
{
  "success": true,
  "message": "Empleados obtenidos exitosamente",
  "data": {
    "empleados": [...]
  }

```

---

## 📁 Estructura Verificada

### Backend

```bash
# Verificar que existe la nueva estructura
ls backend/src/modules/          # Debe mostrar: auth, empleados, etc.
ls backend/src/shared/           # Debe mostrar: config, middlewares, utils, constants
ls backend/src/app.js           # Debe existir
ls backend/src/server.js        # Debe existir
```

### Frontend

```bash
# Verificar que existe la nueva estructura
ls src/services/                # Debe mostrar: api.js, auth.service.js, etc.
ls src/shared/                  # Debe mostrar: components, hooks, utils, constants
```

---

## 🐛 Solución de Problemas Comunes

### Error: Cannot find module './src/server.js'

**Solución**: Asegúrate de estar ejecutando desde la carpeta backend
```bash
cd backend
npm start
```

### Error: Module not found (frontend)

**Causa**: Los imports pueden no estar actualizados

**Solución**: Verifica que los imports apunten a las nuevas ubicaciones:
```javascript
// ❌ Antiguo
import Alert from './components/Alert';

// ✅ Nuevo
import Alert from '../shared/components/Alert';
```

### Error: CORS

**Solución**: Verifica que:
1. El backend esté corriendo en puerto 3000
2. El frontend esté corriendo en puerto 5173
3. El archivo `.env` en la raíz tenga: `VITE_API_URL=http://localhost:3000`

### Error: Database connection

**Solución**: Verifica `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/recursos_humanos
JWT_SECRET=mi_secreto_super_seguro_para_jwt_2025
PORT=3000
NODE_ENV=development
```

---

## 📊 Checklist de Verificación

- [ ] Backend inicia sin errores
- [ ] Frontend inicia sin errores
- [ ] Login funciona correctamente
- [ ] Dashboard muestra empleados
- [ ] Puedo crear un nuevo empleado
- [ ] Información Personal funciona
- [ ] Formación funciona
- [ ] Experiencia funciona
- [ ] Otros Documentos funciona
- [ ] Subida de archivos funciona

---

## 🎯 Siguientes Pasos

### 1. Opcional: Limpiar Archivos Legacy

Una vez verificado que todo funciona:

```bash
# Eliminar archivos legacy (opcional)
rm -rf backend/routes/          # Ya no se usa (legacy)
rm backend/db.js               # Reemplazado por src/shared/config/database.js
```

### 2. Revisar la Documentación

- **ARCHITECTURE.md**: Arquitectura detallada
- **MIGRATION_SUMMARY.md**: Resumen de cambios
- **README.md**: Documentación completa

### 3. Agregar Tests (Opcional)

```bash
# Backend
mkdir -p backend/src/modules/empleados/__tests__
touch backend/src/modules/empleados/__tests__/empleados.service.test.js

# Frontend
mkdir -p src/services/__tests__
touch src/services/__tests__/auth.service.test.js
```

---

## 📞 Necesitas Ayuda?

Si algo no funciona:

1. Verifica los logs de consola (backend y frontend)
2. Revisa que todos los archivos estén en su lugar
3. Verifica las variables de entorno
4. Asegúrate de que PostgreSQL esté corriendo
5. Revisa que los puertos 3000 y 5173 estén libres

---

**¡Tu proyecto está listo con Arquitectura Modular! 🎉**

Para más información, consulta:
- `ARCHITECTURE.md` - Documentación completa
- `MIGRATION_SUMMARY.md` - Detalles de la migración
- `README.md` - Guía de instalación completa
