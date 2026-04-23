# DECISIONS.md

## 📋 Enfoque General de la Solución

La solución fue diseñada como una **aplicación fullstack** con separación clara entre backend y frontend, siguiendo el patrón **API REST** para la comunicación entre ambas capas.

### Arquitectura
- **Backend (NestJS)**: Procesa los datos del mock JSON, calcula el "Nivel de Hype" según las reglas de negocio, y expone un endpoint REST.
- **Frontend (React + TypeScript)**: Consume la API, renderiza la interfaz de usuario con estados de carga/error, y destaca visualmente "La Joya de la Corona".

### Flujo de Datos
1. El backend lee el archivo `videos.mock.json` (simulando la respuesta de YouTube)
2. Transforma cada video aplicando las reglas de negocio (Hype, fechas relativas)
3. Identifica la "Joya de la Corona" (mayor Hype del dataset completo)
4. Expone los datos a través de `/api/videos` con soporte para búsqueda, ordenamiento y paginación
5. El frontend consume este endpoint y renderiza la cartelera

---

## ⚙️ Decisiones Técnicas Principales

### Backend (NestJS)

#### 1. Cálculo del Nivel de Hype
**Implementación:** `hype-calculator.util.ts`

```typescript
// Fórmula base: (likes + comentarios) / vistas
let hype = (likes + comments) / views;

// Modificador x2 si el título contiene "tutorial" (case-insensitive)
if (snippet.title.toLowerCase().includes('tutorial')) {
  hype *= 2;
}
```

**Decisiones clave:**
- ✅ **Regla de comentarios desactivados como prioridad máxima**: Si `commentCount` es `undefined` o `null`, retorna `0` inmediatamente, sin importar otras condiciones (incluso si tiene "Tutorial" en el título)
- ✅ **Validación de views**: Si `views <= 0`, retorna `0` para evitar divisiones por cero o resultados infinitos
- ✅ **Case-insensitive matching**: Uso de `.toLowerCase()` para detectar "Tutorial", "TUTORIAL", "tUtOriAl", etc.
- ✅ **Valores numéricos normalizados**: Conversión explícita a `Number()` para asegurar operaciones aritméticas correctas

#### 2. Transformación de Fechas (Sin Librerías)
**Implementación:** `relative-date.util.ts`

**Enfoque:**
- Cálculo manual de diferencias en segundos entre `now` y `publishedAt`
- Selección de la **unidad más grande** que se ajuste al rango (años > meses > días > horas > minutos > segundos)
- Pluralización manual en español ("1 día" vs "5 días")

```typescript
const UNITS = [
  { seconds: 31536000, singular: 'año', plural: 'años' },   // 365 * 24 * 60 * 60
  { seconds: 2592000,  singular: 'mes', plural: 'meses' },  // 30 * 24 * 60 * 60
  { seconds: 86400,    singular: 'día', plural: 'días' },   // 24 * 60 * 60
  // ...
];
```

**Decisiones clave:**
- ✅ **Sin dependencias externas**: Cumple estrictamente con la restricción "no uses librerías de fechas"
- ✅ **Manejo de edge cases**:
    - Diferencias < 5 segundos → "Hace un momento"
    - Fechas inválidas → "Fecha desconocida"
- ✅ **Precisión adaptativa**: Muestra "Hace 1 hora" en lugar de "Hace 90 minutos" (elige la unidad más significativa)
- ✅ **Testeable**: Acepta un parámetro opcional `now` para facilitar testing con fechas controladas

#### 3. Identificación de "La Joya de la Corona"
**Lógica:** `videos.service.ts` → método `pickCrownJewelId()`

**Decisión importante:**
- La Joya se elige sobre el **dataset completo** (antes de filtrar/paginar)
- Esto asegura que siempre se muestre el video con mayor Hype global, independientemente de los filtros aplicados
- Videos con `hypeLevel <= 0` son automáticamente descalificados

#### 4. Arquitectura del Backend
**Patrón:** Controller-Service

```
VideosController → VideosService → Utilidades
     ↓                  ↓              ↓
  Validación      Lógica de       Cálculos
  de params       negocio         puros
```

**Decisiones:**
- ✅ **Validación robusta de query params**: Parseo manual con valores por defecto y límites (ej: `limit` máximo de 50)
- ✅ **Separación de responsabilidades**:
    - Controller: validación HTTP, parseo de parámetros
    - Service: lógica de negocio, transformación de datos
    - Utils: funciones puras y reutilizables
- ✅ **Documentación con Swagger**: Endpoint `/api/docs` para explorar la API interactivamente
- ✅ **CORS configurado**: Permite requests desde `localhost:*` para desarrollo local

---

### Frontend (React + TypeScript)

#### 1. Gestión de Estado y Data Fetching
**Herramienta:** TanStack Query (React Query)

**Decisiones:**
- ✅ **Caché inteligente**: `staleTime: 30_000` (30 segundos) para evitar re-fetches innecesarios
- ✅ **Estados granulares**: Manejo separado de `isLoading`, `isError`, `isFetching` para UX precisa
- ✅ **Refetch manual**: Botón de "Reintentar" en vista de error

```typescript
const query = useVideos({
  search, sortBy, order, page, limit: PAGE_SIZE
});
```

#### 2. Diseño de "La Joya de la Corona" 👑
**Componente:** `joya-card.tsx`

**Diferenciación visual implementada:**
- ✅ **Layout destacado**: Grid 2 columnas en desktop (imagen + info), ocupa más espacio que cards normales
- ✅ **Efectos visuales únicos**:
    - Border dorado de 2px (`border-amber-400`)
    - Shadow personalizado con glow amber (`shadow-[0_0_0_4px_rgba(245,158,11,0.15)]`)
    - Gradiente radial de fondo con opacidad 15%
    - Ring dorado con `ring-amber-400/40`
- ✅ **Badge distintivo**: "La Joya de la Corona" con icono de corona (`<Crown />`)
- ✅ **Animación de progreso**: El nivel de Hype se anima de 0 a su valor real al renderizar
- ✅ **Tipografía destacada**: Título en 3xl/4xl (vs 1xl en cards normales)

#### 3. Manejo de Estados de Carga y Error

**Estados implementados:**

| Estado | Condición | Vista |
|--------|-----------|-------|
| `isInitialLoading` | Primera carga | Skeleton loaders |
| `isError` | Fallo en fetch | Alert con mensaje + botón retry |
| `isEmpty` | Sin resultados | Card con mensaje amigable |
| `isSuccess` | Datos cargados | Joya + Grid de videos |
| `isFetching` | Refetch en background | Opacity reducido (70%) |

**Decisión clave:** UX no bloqueante durante refetch (se mantiene contenido visible con opacity bajado)

#### 4. Funcionalidades Implementadas

**Búsqueda:**
- Input con debounce implícito (re-render controlado por React)
- Busca en `title` y `author` (case-insensitive en backend)
- Resetea paginación a página 1 al buscar

**Ordenamiento:**
- 4 criterios: Hype, Publicación, Título, Autor
- Toggle ASC/DESC con indicador visual
- Disabled cuando no hay criterio seleccionado

**Paginación:**
- 9 videos por página
- Controles Prev/Next con disable en límites
- Indicador visual de página actual

#### 5. Persistencia en URL
**Hook custom:** `useSearchParams`

**Decisión:** Todos los filtros se reflejan en la URL query string:
```
?search=tutorial&sortBy=hypeLevel&order=desc&page=2
```

**Beneficios:**
- ✅ URLs compartibles con estado completo
- ✅ Navegación browser (back/forward) funciona correctamente
- ✅ Refresh mantiene los filtros aplicados

---


**Decisiones de organización:**
- ✅ Monorepo-style con carpetas independientes (no Nx/Turborepo por simplicidad)
- ✅ Cada capa tiene su propio `package.json` y puede ejecutarse independientemente
- ✅ Tests junto al código (co-location para mejor mantenibilidad)
- ✅ Utilidades puras en carpetas `/utils` (fácilmente testeables y reutilizables)

---

## 🧩 Supuestos y Simplificaciones

### Supuestos
1. **Datos válidos**: Se asume que el JSON mock tiene estructura correcta (no se valida con Zod/class-validator)
2. **Ambiente de desarrollo**: CORS solo permite `localhost:*` (producción requeriría configuración adicional)
3. **Sin autenticación**: Endpoint público sin JWT/API keys
4. **Datos estáticos**: El mock se lee del disco en cada request (en producción iría a base de datos)

### Simplificaciones
1. **Sin persistencia**: No hay base de datos; los datos viven en memoria/archivo
2. **Sin rate limiting**: Endpoint sin throttling ni protección DDoS
3. **Error handling básico**: Errores HTTP genéricos (no códigos de error custom por tipo de fallo)
4. **Sin internacionalización**: Todo hardcodeado en español
5. **Sin tests E2E**: Solo tests unitarios (no Cypress/Playwright)

---

## ⚠️ Problemas Encontrados y Soluciones

### 1. ❌ División por cero en cálculo de Hype
**Problema:** Videos con 0 vistas causaban `Infinity` o `NaN`

**Solución:**
```typescript
if (!Number.isFinite(views) || views <= 0) {
  return 0;
}
```

### 2. ❌ "Tutorial" no detectado en mayúsculas
**Problema:** La prueba inicial usaba `title.includes('tutorial')` (case-sensitive)

**Solución:**
```typescript
snippet.title.toLowerCase().includes('tutorial')
```

### 3. ❌ Joya cambiaba al paginar/filtrar
**Problema:** La Joya se elegía DESPUÉS de filtrar, causando que cambiara según la página

**Solución:** Mover `pickCrownJewelId()` antes de `applyFilter()` en el service:
```typescript
const crownJewelId = this.pickCrownJewelId(enriched);  // ANTES de filtrar
const filtered = this.applyFilter(enriched, query.search);
```

### 4. ❌ Fechas futuras mostraban valores negativos
**Problema:** Videos con `publishedAt` en el futuro generaban textos como "Hace -5 días"

**Solución:** Validación en `toRelativeSpanish()`:
```typescript
if (diffSeconds < 5) {
  return 'Hace un momento';  // Maneja casos < 0 también
}
```

### 5. ❌ Query params duplicados en URL
**Problema:** Al cambiar filtros, se acumulaban parámetros en la URL

**Solución:** Función `patchParams()` que limpia valores nulos/vacíos:
```typescript
if (v === null || v === '') next.delete(k)
else next.set(k, v)
```

### 6. ❌ Re-renders excesivos en búsqueda
**Problema:** Cada tecla en el input causaba un fetch nuevo

**Solución:** React Query ya hace debouncing implícito con `staleTime`, pero además agregué:
```typescript
const query = useVideos({ search, ... });  // Re-fetch solo cuando search cambia
```

---

## 🤖 Uso de Herramientas de IA

### Documentación y Comprensión de Conceptos
- _"Explícame las mejores prácticas para estructurar un servicio NestJS con transformación de datos"_
- _"¿Cómo calcular diferencias de tiempo en JavaScript nativo sin usar moment.js o date-fns?"_
- _"Diferencias entre React Query y SWR para data fetching"_
- _"¿Qué es mejor para validación de query params en NestJS: Pipes o validación manual?"_

### Diseño de UI y Componentes
- _"Ideas para destacar visualmente un elemento 'hero' en una grilla de cards con Tailwind CSS"_
- _"Cómo hacer un skeleton loader realista en React con Tailwind"_
- _"Mejores prácticas para animaciones de progreso con CSS/Tailwind"_
- _"Paleta de colores para tema dark/light que funcione bien para destacar un elemento dorado"_

### Debugging y Optimización
- _"Por qué mi cálculo de Hype devuelve NaN en algunos videos"_ → Llevó a descubrir el problema de división por cero
- _"React Query refetchea en cada render, ¿cómo optimizar?"_ → Configuración de `staleTime`
- _"CORS error en NestJS al hacer fetch desde React"_ → Configuración correcta de `enableCors()`

### Testing
- _"Cómo testear utilidades que dependen de Date.now() en Jest"_ → Llevó a inyectar `now` como parámetro
- _"Estrategias para testear transformaciones de datos sin mockear todo"_ → Tests con builders (`buildItem()`)

**Enfoque:** IA como **asistente de documentación y debugging**

---

## 🎯 Notas Finales

### Aspectos Destacados de la Solución
1. **Cumplimiento estricto de requisitos**: Todas las reglas de negocio implementadas exactamente como se especificaron
2. **Testing robusto**: Tests unitarios para lógica crítica (Hype, fechas, controller)
3. **UX cuidada**: Estados de carga/error, animaciones, feedback visual
4. **Código limpio**: Separación de responsabilidades, funciones puras, naming descriptivo
5. **Documentación inline**: Comentarios donde la lógica no es obvia

### Mejoras Futuras (Out of Scope)
- Implementar caché con Redis para mejorar performance
- Agregar validación de DTOs con `class-validator`
- Tests E2E con Cypress
- Deployment en Vercel (frontend) + Railway (backend)
- Implementar infinite scroll en lugar de paginación tradicional
- Agregar filtros por rango de fechas o autor

---

**Desarrollado con:** NestJS, React, TypeScript, TanStack Query, Tailwind CSS, shadcn/ui  
**Fecha de entrega:** 23 de Abril 2026
