/**
 * Satiba Solutions - Configuración Centralizada
 * Compatible con apertura local (file://) y despliegue en GitHub Pages.
 */
(() => {
  'use strict';

  const SITE_CONFIG = {
    EMPRESA: 'Satiba Solutions',
    UBICACION_BASE: 'Antiguo Cuscatlán, La Libertad, El Salvador',
    FUNDACION: '21 de julio de 2022',

    // Bandera de envío:
    // - false: formatea la solicitud, la copia al portapapeles y abre Facebook Messenger.
    // - true: envía directamente vía API gratuita Web3Forms usando WEB3FORMS_ACCESS_KEY.
    EMAIL_ACTIVO: true,

    // Configuración Web3Forms (access_key pública, sin credenciales secretas)
    WEB3FORMS_ENDPOINT: 'https://api.web3forms.com/submit',
    WEB3FORMS_ACCESS_KEY: '18127029-6a66-4c89-a56d-425d37bd6548',

    // Canales de contacto
    FACEBOOK_URL: 'https://www.facebook.com/profile.php?id=61583036411867',
    TELEFONO_CORPORATIVO: {
      activo: false,
      valor: '+503 0000-0000',
      textoEstado: 'Próximamente disponible — Contáctanos vía Facebook'
    },
    CORREO_CORPORATIVO: {
      activo: false,
      valor: 'contacto@satibasolutions.com',
      textoEstado: 'Próximamente disponible — Contáctanos vía Facebook'
    }
  };

  const DEPARTAMENTOS = [
    'La Libertad',
    'San Salvador',
    'Santa Ana',
    'Sonsonate',
    'Ahuachapán',
    'Otro'
  ];

  const MEDIOS_CONTACTO = [
    'WhatsApp o Llamada',
    'Correo electrónico',
    'Facebook',
  ];

  const CATEGORIAS_SERVICIO = {
    DIGITAL: 'Soluciones Digitales y Software',
    SOPORTE: 'Soporte Técnico y Equipos'
  };

  // Catálogo oficial sin precios numéricos (18 servicios en 2 categorías)
  const SERVICIOS_CATALOGO = [
    // Categoría A: Soluciones Digitales y Software
    {
      id: 'consultoria-tecnologica',
      categoria: CATEGORIAS_SERVICIO.DIGITAL,
      nombre: 'Consultoría Tecnológica',
      descripcion: 'Asesoría personalizada por paquetes de horas para digitalizar tus procesos, elegir las herramientas adecuadas y optimizar tu inversión.',
      icono: 'bi-compass',
      sugerenciaEspecificacion: 'Ej. Paquete de 4 horas para diagnóstico digital'
    },
    {
      id: 'sitio-web-corporativo',
      categoria: CATEGORIAS_SERVICIO.DIGITAL,
      nombre: 'Sitio Web Corporativo',
      descripcion: 'Página web profesional, rápida y adaptable a celulares, ideal para presentar tu empresa y captar nuevos clientes.',
      icono: 'bi-globe2',
      sugerenciaEspecificacion: 'Ej. Sitio informativo de 5 secciones'
    },
    {
      id: 'sitio-web-citas',
      categoria: CATEGORIAS_SERVICIO.DIGITAL,
      nombre: 'Sitio Web con Sistema de Citas',
      descripcion: 'Tu presencia en línea integrada con una agenda automática para que tus clientes reserven horarios fácilmente 24/7.',
      icono: 'bi-calendar2-check',
      sugerenciaEspecificacion: 'Ej. Clínica o consultorio con 2 agendas'
    },
    {
      id: 'hosting-ssl',
      categoria: CATEGORIAS_SERVICIO.DIGITAL,
      nombre: 'Hosting + Certificado SSL',
      descripcion: 'Alojamiento web estable y seguro con candado de protección SSL para resguardar la navegación de tus visitantes.',
      icono: 'bi-shield-lock',
      sugerenciaEspecificacion: 'Ej. Plan anual para sitio empresarial'
    },
    {
      id: 'sistema-tpv',
      categoria: CATEGORIAS_SERVICIO.DIGITAL,
      nombre: 'Sistema TPV (Punto de Venta)',
      descripcion: 'Agiliza los cobros en caja, controla turnos y mejora la atención al cliente en tiendas, farmacias o restaurantes.',
      icono: 'bi-shop',
      sugerenciaEspecificacion: 'Ej. Sucursal principal, 2 cajas de cobro'
    },
    {
      id: 'sistema-inventario',
      categoria: CATEGORIAS_SERVICIO.DIGITAL,
      nombre: 'Sistema de Control de Inventario',
      descripcion: 'Supervisa tus existencias en tiempo real, evita pérdidas y mantén el control exacto de entradas y salidas de mercadería.',
      icono: 'bi-boxes',
      sugerenciaEspecificacion: 'Ej. Bodega central y 1 tienda'
    },
    {
      id: 'sistema-facturacion',
      categoria: CATEGORIAS_SERVICIO.DIGITAL,
      nombre: 'Sistema de Facturación',
      descripcion: 'Emisión rápida y ordenada de comprobantes y registro claro de las ventas diarias de tu negocio.',
      icono: 'bi-receipt',
      sugerenciaEspecificacion: 'Ej. Facturación para comercio minorista'
    },
    {
      id: 'diseno-grafico-digital',
      categoria: CATEGORIAS_SERVICIO.DIGITAL,
      nombre: 'Paquetes de Diseño Gráfico Digital',
      descripcion: 'Creación de piezas visuales profesionales para redes sociales y promociones (disponible en packs de 2, 3 o 5 piezas con ronda de ajustes).',
      icono: 'bi-palette2',
      sugerenciaEspecificacion: 'Ej. Pack de 5 piezas para redes sociales'
    },

    // Categoría B: Soporte Técnico y Equipos
    {
      id: 'mantenimiento-preventivo',
      categoria: CATEGORIAS_SERVICIO.SOPORTE,
      nombre: 'Mantenimiento Preventivo de Computadoras',
      descripcion: 'Limpieza física interna, cambio de pasta térmica y optimización del sistema para evitar fallas. Disponible por equipo individual o por lotes para oficinas y centros de cómputo.',
      icono: 'bi-pc-display',
      sugerenciaEspecificacion: 'Ej. Centro de cómputo con 25 computadoras'
    },
    {
      id: 'soporte-presencial',
      categoria: CATEGORIAS_SERVICIO.SOPORTE,
      nombre: 'Soporte Técnico Presencial',
      descripcion: 'Visita técnica directa en tu oficina, negocio o domicilio para solucionar fallas de equipos o programas.',
      icono: 'bi-tools',
      sugerenciaEspecificacion: 'Ej. Visita en Antiguo Cuscatlán / oficina'
    },
    {
      id: 'soporte-remoto',
      categoria: CATEGORIAS_SERVICIO.SOPORTE,
      nombre: 'Soporte Técnico Remoto',
      descripcion: 'Asistencia inmediata a distancia para resolver problemas de software y configuración sin tiempos de espera por traslado.',
      icono: 'bi-headset',
      sugerenciaEspecificacion: 'Ej. Configuración de impresora o correo'
    },
    {
      id: 'redes-infraestructura',
      categoria: CATEGORIAS_SERVICIO.SOPORTE,
      nombre: 'Instalación y Configuración de Redes',
      descripcion: 'Diseño e instalación de redes cableadas o Wi-Fi estables y seguras para hogares, oficinas y salas de trabajo.',
      icono: 'bi-router',
      sugerenciaEspecificacion: 'Ej. Red Wi-Fi y puntos cableados para oficina'
    },
    {
      id: 'diagnostico-hardware',
      categoria: CATEGORIAS_SERVICIO.SOPORTE,
      nombre: 'Diagnóstico de Hardware',
      descripcion: 'Revisión técnica especializada para identificar con precisión el origen de una falla y recomendarte la mejor solución.',
      icono: 'bi-search',
      sugerenciaEspecificacion: 'Ej. Laptop que no enciende o presenta lentitud'
    },
    {
      id: 'prueba-componentes',
      categoria: CATEGORIAS_SERVICIO.SOPORTE,
      nombre: 'Prueba de Componentes',
      descripcion: 'Verificación de rendimiento y estado físico de piezas antes de realizar compras o reemplazos.',
      icono: 'bi-cpu',
      sugerenciaEspecificacion: 'Ej. Validación de fuente de poder y memoria RAM'
    },
    {
      id: 'ensamble-computadoras',
      categoria: CATEGORIAS_SERVICIO.SOPORTE,
      nombre: 'Ensamble de Computadoras',
      descripcion: 'Armado profesional de equipos a medida según tus necesidades (oficina, educación, diseño o alto rendimiento).',
      icono: 'bi-motherboard',
      sugerenciaEspecificacion: 'Ej. 3 equipos para estación de diseño'
    },
    {
      id: 'instalacion-sistema-operativo',
      categoria: CATEGORIAS_SERVICIO.SOPORTE,
      nombre: 'Instalación Limpia de Sistema Operativo',
      descripcion: 'Formateo seguro, instalación desde cero y configuración óptima para devolverle velocidad a tu computadora.',
      icono: 'bi-window-stack',
      sugerenciaEspecificacion: 'Ej. Respaldo previo e instalación limpia'
    },
    {
      id: 'instalacion-office',
      categoria: CATEGORIAS_SERVICIO.SOPORTE,
      nombre: 'Instalación y Activación de Office',
      descripcion: 'Configuración completa de herramientas de oficina (Word, Excel, PowerPoint) listas para trabajar.',
      icono: 'bi-file-earmark-text',
      sugerenciaEspecificacion: 'Ej. 5 equipos administrativos'
    },
    {
      id: 'robotica-automatizacion',
      categoria: CATEGORIAS_SERVICIO.SOPORTE,
      nombre: 'Proyectos de Robótica y Automatización',
      descripcion: 'Desarrollo de prototipos, asesoría por bloques de horas y soluciones prácticas para proyectos educativos o empresariales.',
      icono: 'bi-robot',
      sugerenciaEspecificacion: 'Ej. Prototipo escolar o automatización básica'
    }
  ];

  window.SatibaConfig = {
    SITE_CONFIG,
    DEPARTAMENTOS,
    MEDIOS_CONTACTO,
    CATEGORIAS_SERVICIO,
    SERVICIOS_CATALOGO
  };
})();
