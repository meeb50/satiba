/**
 * Satiba Solutions - Lógica Principal, Navegación, Servicios y Contacto
 * Compatible con apertura directa (file://) y GitHub Pages.
 */
(() => {
  'use strict';

  const STORAGE_KEY = 'satiba_cotizacion_items';

  const getCurrentPage = () => {
    const path = window.location.pathname || '';
    const file = path.split('/').pop() || 'index.html';
    return file === '' ? 'index.html' : file.toLowerCase();
  };

  const escapeHtml = (value) => {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const getCartItems = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveCartItems = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Silencioso si el almacenamiento local está restringido
    }
    updateCartBadges();
  };

  const getTotalCartUnits = () => {
    return getCartItems().reduce((sum, item) => sum + (Number(item.cantidad) || 1), 0);
  };

  const updateCartBadges = () => {
    const count = getCartItems().length;
    const badges = document.querySelectorAll('[data-satiba-cart-count]');
    badges.forEach((badge) => {
      badge.textContent = String(count);
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    });
  };

  const addServiceToCart = (servicioId, cantidad = 1, especificacion = '') => {
    const { SERVICIOS_CATALOGO } = window.SatibaConfig;
    const servicio = SERVICIOS_CATALOGO.find((s) => s.id === servicioId);
    if (!servicio) return null;

    const cleanQty = Math.max(1, parseInt(cantidad, 10) || 1);
    const cleanSpec = (especificacion || '').trim();
    const items = getCartItems();

    const existingIndex = items.findIndex(
      (item) => item.id === servicio.id && (item.especificacion || '').trim().toLowerCase() === cleanSpec.toLowerCase()
    );

    if (existingIndex >= 0) {
      items[existingIndex].cantidad += cleanQty;
    } else {
      items.push({
        uid: `${servicio.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        id: servicio.id,
        nombre: servicio.nombre,
        categoria: servicio.categoria,
        cantidad: cleanQty,
        especificacion: cleanSpec
      });
    }

    saveCartItems(items);
    return servicio;
  };

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Continúa al fallback clásico compatible con file://
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      return copied;
    } catch {
      return false;
    }
  };

  const enviarSolicitudCanal = async ({ subject, mensajeTexto, web3Payload, honeypotValor }) => {
    const { SITE_CONFIG } = window.SatibaConfig;

    if (honeypotValor && honeypotValor.trim() !== '') {
      return { ok: false, spam: true };
    }

    if (SITE_CONFIG.EMAIL_ACTIVO) {
      const response = await fetch(SITE_CONFIG.WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: SITE_CONFIG.WEB3FORMS_ACCESS_KEY,
          subject,
          from_name: SITE_CONFIG.EMPRESA,
          botcheck: '',
          ...web3Payload,
          message: mensajeTexto
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'No se pudo enviar la solicitud por correo.');
      }
      return { ok: true, mode: 'email' };
    }

    const copied = await copyToClipboard(mensajeTexto);
    return { ok: true, mode: 'facebook', copied, facebookUrl: SITE_CONFIG.FACEBOOK_URL };
  };

  const getLogoHorizontalSvg = (gradId = 'navLogoGrad') => `
    <svg class="satiba-logo-svg" viewBox="0 0 218 52" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Satiba Solutions">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00B050" />
          <stop offset="100%" stop-color="#005828" />
        </linearGradient>
      </defs>
      <path d="M10,6 C48,2 145,2 198,8 C210,9.5 215,17 212,28 C208,42 195,46 176,47 C124,50 46,49 14,45 C4,43.5 2,35 3,23 C4,12 5,7 10,6 Z" fill="url(#${gradId})" />
      <path d="M18,40 C65,45 142,45 198,37" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="2" stroke-linecap="round" />
      <circle cx="32" cy="26" r="11" fill="rgba(255,255,255,0.16)" />
      <text x="32" y="31" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="16" font-weight="800">S</text>
      <text x="54" y="24" fill="#FFFFFF" font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="17" font-weight="700" letter-spacing="-0.3">Satiba</text>
      <text x="54" y="39" fill="rgba(255,255,255,0.92)" font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="11.5" font-weight="400" letter-spacing="0.6">Solutions</text>
    </svg>
  `;

  const renderNavbar = () => {
    const container = document.getElementById('site-navbar');
    if (!container) return;

    const current = getCurrentPage();
    const links = [
      { href: 'index.html', label: 'Inicio' },
      { href: 'nosotros.html', label: 'Nosotros' },
      { href: 'servicios.html', label: 'Servicios' },
      // { href: 'cotizador.html', label: 'Cotizador' },
      { href: 'contacto.html', label: 'Contacto' }
    ];

    const navLinksHtml = links
      .map((link) => {
        const activeClass = current === link.href ? 'active' : '';
        return `
          <li class="nav-item">
            <a class="nav-link ${activeClass}" href="${link.href}">${link.label}</a>
          </li>
        `;
      })
      .join('');
    // ${getLogoHorizontalSvg('navLogoGrad')}
    container.innerHTML = `
      <nav class="navbar navbar-expand-lg fixed-top satiba-navbar" aria-label="Navegación principal">
        <div class="container">
          <a class="navbar-brand satiba-brand fw-bold fs-4" href="index.html">
            <img src="./assets/icono.svg" alt="Satiba Solutions" width="30" height="24">Satiba Solutions
          </a>
          <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#satibaNavCollapse" aria-controls="satibaNavCollapse" aria-expanded="false" aria-label="Abrir menú">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="satibaNavCollapse">
            <ul class="navbar-nav ms-auto me-lg-3 align-items-lg-center gap-lg-1">
              ${navLinksHtml}
            </ul>
            <a href="cotizador.html" class="btn btn-satiba">
              <i class="bi bi-calculator"></i>
              <span>Cotizar ahora</span>
              <span class="satiba-quote-badge" data-satiba-cart-count style="display:none;">0</span>
            </a>
          </div>
        </div>
      </nav>
    `;

    updateCartBadges();
  };

  const renderFooter = () => {
    const container = document.getElementById('site-footer');
    if (!container) return;

    const { SITE_CONFIG } = window.SatibaConfig;
    const year = new Date().getFullYear();

    // ${getLogoHorizontalSvg('footerLogoGrad')}
    container.innerHTML = `
      <footer class="satiba-footer">
        <div class="container">
          <div class="row g-4">
            <div class="col-lg-4">
              <a href="index.html" class="d-inline-block mb-3 fw-bold fs-5">
                Satiba Solutions
              </a>
              <p class="mb-2">
                Soluciones tecnológicas confiables en desarrollo de software, sitios web, redes y soporte técnico especializado en El Salvador.
              </p>
              <p class="mb-0 small">
                <i class="bi bi-geo-alt-fill text-satiba-primary me-1"></i>
                ${escapeHtml(SITE_CONFIG.UBICACION_BASE)}
              </p>
            </div>
            <div class="col-6 col-lg-2 offset-lg-1">
              <h6>Navegación</h6>
              <ul class="list-unstyled d-grid gap-2 mb-0">
                <li><a href="index.html">Inicio</a></li>
                <li><a href="nosotros.html">Nosotros</a></li>
                <li><a href="servicios.html">Servicios</a></li>
                <li><a href="cotizador.html">Cotizador</a></li>
                <li><a href="contacto.html">Contacto</a></li>
              </ul>
            </div>
            <div class="col-6 col-lg-2">
              <h6>Cobertura</h6>
              <ul class="list-unstyled d-grid gap-2 mb-0">
                <li>La Libertad</li>
                <li>San Salvador</li>
                <li>Santa Ana</li>
                <li>Sonsonate</li>
                <li>Ahuachapán</li>
              </ul>
            </div>
            <div class="col-lg-3">
              <h6>Atención Directa</h6>
              <p class="mb-3">
                Escríbenos directamente por Messenger o arma tu solicitud en nuestro cotizador en línea.
              </p>
              <div class="d-grid gap-2">
                <a href="${SITE_CONFIG.FACEBOOK_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-satiba btn-sm">
                  <i class="bi bi-facebook"></i>
                  Facebook Oficial
                </a>
                <a href="cotizador.html" class="btn btn-outline-light btn-sm">
                  <i class="bi bi-file-earmark-text"></i>
                  Ir al Cotizador
                </a>
              </div>
            </div>
          </div>
          <hr class="footer-divider" />
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small">
            <span>&copy; ${year} ${escapeHtml(SITE_CONFIG.EMPRESA)}. Todos los derechos reservados.</span>
            <span>Antiguo Cuscatlán, La Libertad, El Salvador &middot; Desde 2022</span>
          </div>
        </div>
      </footer>
    `;
  };

  const initServiciosPage = () => {
    const grid = document.getElementById('servicios-grid');
    const tabsContainer = document.getElementById('servicios-tabs');
    if (!grid || !tabsContainer) return;

    const { SERVICIOS_CATALOGO, CATEGORIAS_SERVICIO } = window.SatibaConfig;
    let activeFilter = 'Todos';

    const renderCards = () => {
      const filtered =
        activeFilter === 'Todos'
          ? SERVICIOS_CATALOGO
          : SERVICIOS_CATALOGO.filter((s) => s.categoria === activeFilter);

      grid.innerHTML = filtered
        .map((servicio, idx) => {
          const isDigital = servicio.categoria === CATEGORIAS_SERVICIO.DIGITAL;
          return `
            <div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="${(idx % 3) * 70}">
              <article class="satiba-card d-flex flex-column">
                <div class="d-flex align-items-start justify-content-between gap-2 mb-3">
                  <div class="icon-box mb-0">
                    <i class="bi ${escapeHtml(servicio.icono)}"></i>
                  </div>
                  <span class="service-category-tag">
                    ${isDigital ? 'Digital y Software' : 'Soporte y Equipos'}
                  </span>
                </div>
                <h3 class="h5 mb-2">${escapeHtml(servicio.nombre)}</h3>
                <p class="small mb-4 flex-grow-1">${escapeHtml(servicio.descripcion)}</p>
                <div class="pt-3 border-top d-flex flex-column gap-2">
                  <div>
                    <span class="quote-label-pill">
                      <i class="bi bi-tag"></i>
                      Precio mediante cotización
                    </span>
                  </div>
                  <button
                    type="button"
                    class="btn btn-satiba w-100 mt-1"
                    data-add-service="${escapeHtml(servicio.id)}"
                  >
                    <i class="bi bi-plus-circle"></i>
                    + Agregar a cotización
                  </button>
                </div>
              </article>
            </div>
          `;
        })
        .join('');

      if (window.AOS) {
        window.AOS.refreshHard();
      }
    };

    tabsContainer.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-filter]');
      if (!btn) return;
      activeFilter = btn.getAttribute('data-filter');
      tabsContainer.querySelectorAll('.filter-tab-btn').forEach((el) => el.classList.remove('active'));
      btn.classList.add('active');
      renderCards();
    });

    grid.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-add-service]');
      if (!btn) return;
      const serviceId = btn.getAttribute('data-add-service');
      const added = addServiceToCart(serviceId, 1, '');
      if (!added) return;

      if (window.Swal) {
        window.Swal.fire({
          icon: 'success',
          title: 'Agregado a tu cotización',
          html: `<strong>${escapeHtml(added.nombre)}</strong> se añadió correctamente.`,
          showCancelButton: true,
          confirmButtonText: 'Ir al cotizador',
          cancelButtonText: 'Seguir explorando',
          confirmButtonColor: '#00B050',
          cancelButtonColor: '#005828'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = 'cotizador.html';
          }
        });
      }
    });

    renderCards();
  };

  const initContactoPage = () => {
    const form = document.getElementById('contacto-form');
    const phoneText = document.getElementById('contacto-telefono-estado');
    const emailText = document.getElementById('contacto-correo-estado');
    const { SITE_CONFIG } = window.SatibaConfig;

    if (phoneText) {
      phoneText.innerHTML = SITE_CONFIG.TELEFONO_CORPORATIVO.activo
        ? `<a href="tel:${escapeHtml(SITE_CONFIG.TELEFONO_CORPORATIVO.valor)}" class="fw-semibold text-decoration-none">${escapeHtml(SITE_CONFIG.TELEFONO_CORPORATIVO.valor)}</a>`
        : `<span class="text-muted">${escapeHtml(SITE_CONFIG.TELEFONO_CORPORATIVO.textoEstado)}</span>`;
    }

    if (emailText) {
      emailText.innerHTML = SITE_CONFIG.CORREO_CORPORATIVO.activo
        ? `<a href="mailto:${escapeHtml(SITE_CONFIG.CORREO_CORPORATIVO.valor)}" class="fw-semibold text-decoration-none">${escapeHtml(SITE_CONFIG.CORREO_CORPORATIVO.valor)}</a>`
        : `<span class="text-muted">${escapeHtml(SITE_CONFIG.CORREO_CORPORATIVO.textoEstado)}</span>`;
    }

    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const nombre = document.getElementById('contacto-nombre')?.value.trim() || '';
      const contacto = document.getElementById('contacto-medio')?.value.trim() || '';
      const mensaje = document.getElementById('contacto-mensaje')?.value.trim() || '';
      const botcheck = document.getElementById('contacto-botcheck')?.value || '';

      if (!nombre || !contacto || !mensaje) {
        if (window.Swal) {
          window.Swal.fire({
            icon: 'warning',
            title: 'Campos requeridos',
            text: 'Por favor completa tu nombre, medio de contacto y mensaje.',
            confirmButtonColor: '#00B050'
          });
        }
        return;
      }

      const resumen = [
        'CONSULTA RÁPIDA - SATIBA SOLUTIONS',
        '----------------------------------------',
        `Nombre / Empresa: ${nombre}`,
        `Contacto: ${contacto}`,
        `Mensaje: ${mensaje}`,
        `Fecha: ${new Date().toLocaleString('es-SV')}`
      ].join('\n');

      try {
        const res = await enviarSolicitudCanal({
          subject: `Consulta web de ${nombre}`,
          mensajeTexto: resumen,
          honeypotValor: botcheck,
          web3Payload: {
            nombre,
            contacto
          }
        });

        if (res.spam) return;

        if (res.mode === 'email') {
          if (window.Swal) {
            window.Swal.fire({
              icon: 'success',
              title: '¡Mensaje enviado!',
              text: 'Gracias por escribirnos. Te responderemos a la brevedad.',
              confirmButtonColor: '#00B050'
            });
          }
          form.reset();
        } else {
          if (window.Swal) {
            await window.Swal.fire({
              icon: 'success',
              title: res.copied ? 'Consulta copiada al portapapeles' : 'Consulta lista para enviar',
              html: res.copied
                ? 'Tu mensaje se copió automáticamente. Se abrirá nuestra página oficial de <strong>Facebook</strong> para que solo pegues y envíes tu consulta.'
                : 'Se abrirá nuestra página oficial de <strong>Facebook</strong> para atenderte de inmediato.',
              confirmButtonText: 'Abrir Facebook de Satiba Solutions',
              confirmButtonColor: '#00B050'
            });
          }
          window.open(res.facebookUrl, '_blank', 'noopener,noreferrer');
          form.reset();
        }
      } catch (err) {
        if (window.Swal) {
          window.Swal.fire({
            icon: 'error',
            title: 'No se pudo completar el envío',
            text: err.message || 'Inténtalo nuevamente o contáctanos vía Facebook.',
            confirmButtonColor: '#005828'
          });
        }
      }
    });
  };

  const initAOS = () => {
    if (window.AOS) {
      window.AOS.init({
        duration: 650,
        once: true,
        offset: 40
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    renderFooter();
    initServiciosPage();
    initContactoPage();
    initAOS();
  });

  window.SatibaUI = {
    STORAGE_KEY,
    escapeHtml,
    getCartItems,
    saveCartItems,
    getTotalCartUnits,
    updateCartBadges,
    addServiceToCart,
    copyToClipboard,
    enviarSolicitudCanal
  };
})();
