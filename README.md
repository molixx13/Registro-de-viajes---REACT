# Registro de Viajes - Aplicación Web Interactiva

Una aplicación moderna y elegante para registrar, visualizar y gestionar tus viajes en un mapa interactivo. Captura cada aventura en un solo lugar.

<div align="center">

![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.1-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Licencia](https://img.shields.io/badge/Licencia-ISC-yellow)
![Estado](https://img.shields.io/badge/Estado-Activo-success)

</div>

---

## Características

- **Mapa Interactivo** - Visualiza tus viajes con MapLibre GL en tiempo real
- **Registro de Viajes** - Registra fácilmente cada uno de tus destinos
- **Geolocalización** - Marca ubicaciones precisas en el mapa
- **Interfaz Intuitiva** - Diseño limpio y fácil de usar
- **Responsive** - Funciona perfectamente en cualquier dispositivo
- **Rendimiento Optimizado** - Construcción con Next.js para máxima velocidad
- **Bien Testeado** - Suite de pruebas con Vitest
- **TypeScript** - Código tipado y seguro

---

## Inicio Rápido

### Requisitos Previos

- Node.js 16 o superior
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/molixx13/Registro-de-viajes---REACT.git
cd Registro-de-viajes---REACT

# Instalar dependencias
npm install
```

### Desarrollo

```bash
# Inicia el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Producción

```bash
# Compilar la aplicación
npm run build

# Iniciar el servidor de producción
npm start
```

---

## Stack Tecnológico

### Frontend
- **React 19** - Librería de interfaz de usuario
- **Next.js 15.1** - Framework de React con SSR
- **TypeScript** - Lenguaje tipado para mayor seguridad

### Mapas
- **MapLibre GL 5.0** - Librería de mapas interactivos

### UI e Iconos
- **Lucide React** - Conjunto de iconos SVG modernos

### Testing
- **Vitest** - Framework de pruebas rápido
- **Testing Library** - Utilidades para testing de componentes
- **JSDOM** - Simulación del DOM

### Herramientas
- **ESLint** - Linting de código
- **Prettier** - Formateador de código (recomendado)

---

## Estructura del Proyecto

```
Registro-de-viajes---REACT/
├── src/
│   ├── components/      # Componentes React reutilizables
│   ├── pages/           # Páginas de la aplicación
│   ├── styles/          # Estilos CSS
│   └── utils/           # Funciones y utilidades
├── public/              # Archivos estáticos
├── package.json         # Dependencias del proyecto
├── tsconfig.json        # Configuración de TypeScript
├── next.config.js       # Configuración de Next.js
└── README.md            # Este archivo
```

---

## Scripts Disponibles

| Script | Descripción |
|--------|------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm start` | Inicia el servidor de producción |
| `npm run lint` | Valida el código con ESLint |
| `npm test` | Ejecuta las pruebas unitarias |

---

## Cómo Usar

### Registrar un Nuevo Viaje

1. Navega a la aplicación
2. Haz clic en el botón "Nuevo Viaje"
3. Selecciona la ubicación en el mapa
4. Completa los detalles del viaje:
   - Nombre o Destino
   - Fechas (inicio y fin)
   - Descripción
   - Valoración (opcional)
5. Guarda el registro

### Ver Tus Viajes

- Visualiza todos tus viajes en el mapa interactivo
- Haz clic en cualquier marcador para ver detalles
- Filtra por fechas o destinos

---

## Testing

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test -- --watch
```

---

## Roadmap

- Autenticación de usuarios
- Base de datos para persistencia
- Exportar viajes en PDF
- Compartir itinerarios
- Galería de fotos por viaje
- Estadísticas de viajes
- Modo oscuro/claro
- Múltiples idiomas

---

## Contribuir

Las contribuciones son bienvenidas.

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## Licencia

Este proyecto está bajo la licencia ISC. Consulta el archivo LICENSE para más detalles.

---

## Autor

**Molixx13**
- GitHub: [@molixx13](https://github.com/molixx13)
- Repositorio: [Registro-de-viajes---REACT](https://github.com/molixx13/Registro-de-viajes---REACT)

---

## Soporte

Si tienes preguntas o encuentras problemas, por favor abre un [Issue](https://github.com/molixx13/Registro-de-viajes---REACT/issues) en GitHub.

---

## Agradecimientos

- [React](https://react.dev/) - Librería de interfaz de usuario
- [Next.js](https://nextjs.org/) - Framework full-stack
- [MapLibre GL](https://maplibre.org/) - Mapas interactivos
- [Lucide Icons](https://lucide.dev/) - Iconos SVG

---

<div align="center">

Hecho con dedicación para aventureros digitales.

</div>
