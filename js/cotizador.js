/**
 * Satiba Solutions - Módulo del Cotizador Interactivo y Exportación PDF
 * Compatible con apertura local (file://) y GitHub Pages.
 */
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const quoteApp = document.getElementById('cotizador-app');
    if (!quoteApp) return;

    const {
      SITE_CONFIG,
      DEPARTAMENTOS,
      MEDIOS_CONTACTO,
      CATEGORIAS_SERVICIO,
      SERVICIOS_CATALOGO
    } = window.SatibaConfig;

    const {
      escapeHtml,
      getCartItems,
      saveCartItems,
      addServiceToCart,
      enviarSolicitudCanal
    } = window.SatibaUI;

    const serviceSelect = document.getElementById('cotizador-servicio-select');
    const qtyInput = document.getElementById('cotizador-cantidad-input');
    const specInput = document.getElementById('cotizador-especificacion-input');
    const addBtn = document.getElementById('cotizador-agregar-btn');
    const itemsContainer = document.getElementById('cotizador-lista-items');
    const itemsCounter = document.getElementById('cotizador-total-items');
    const clearBtn = document.getElementById('cotizador-vaciar-btn');

    const deptSelect = document.getElementById('cliente-departamento');
    const mediumSelect = document.getElementById('cliente-medio');
    const contactDetailLabel = document.getElementById('cliente-contacto-label');
    const contactDetailInput = document.getElementById('cliente-contacto-dato');
    const clientNameInput = document.getElementById('cliente-nombre');
    const clientNotesInput = document.getElementById('cliente-notas');
    const botcheckInput = document.getElementById('cotizador-botcheck');

    const sendBtn = document.getElementById('cotizador-enviar-btn');
    const pdfBtn = document.getElementById('cotizador-pdf-btn');
    const quoteForm = document.getElementById('cotizador-form');

    const populateServiceSelect = () => {
      const digitalServices = SERVICIOS_CATALOGO.filter(
        (s) => s.categoria === CATEGORIAS_SERVICIO.DIGITAL
      );
      const supportServices = SERVICIOS_CATALOGO.filter(
        (s) => s.categoria === CATEGORIAS_SERVICIO.SOPORTE
      );

      const buildOptions = (list) =>
        list
          .map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.nombre)}</option>`)
          .join('');

      serviceSelect.innerHTML = `
        <option value="" selected disabled>Selecciona un servicio...</option>
        <optgroup label="${escapeHtml(CATEGORIAS_SERVICIO.DIGITAL)}">
          ${buildOptions(digitalServices)}
        </optgroup>
        <optgroup label="${escapeHtml(CATEGORIAS_SERVICIO.SOPORTE)}">
          ${buildOptions(supportServices)}
        </optgroup>
      `;
    };

    const populateClientSelects = () => {
      deptSelect.innerHTML = DEPARTAMENTOS.map(
        (dep) => `<option value="${escapeHtml(dep)}">${escapeHtml(dep)}</option>`
      ).join('');

      mediumSelect.innerHTML = MEDIOS_CONTACTO.map(
        (med) => `<option value="${escapeHtml(med)}">${escapeHtml(med)}</option>`
      ).join('');
    };

    const updateSpecPlaceholder = () => {
      const selected = SERVICIOS_CATALOGO.find((s) => s.id === serviceSelect.value);
      specInput.placeholder = selected
        ? selected.sugerenciaEspecificacion
        : 'Ej. Centro de cómputo con 25 computadoras';
    };

    const updateContactFieldHint = () => {
      const medium = mediumSelect.value;
      if (medium === 'Facebook') {
        contactDetailLabel.textContent = 'Usuario o nombre en Facebook *';
        contactDetailInput.placeholder = 'Ej. Juan Pérez (o enlace a tu perfil)';
      } else if (medium === 'WhatsApp o Llamada') {
        contactDetailLabel.textContent = 'Número de teléfono / WhatsApp *';
        contactDetailInput.placeholder = 'Ej. 7000-0000';
      } else {
        contactDetailLabel.textContent = 'Correo electrónico *';
        contactDetailInput.placeholder = 'Ej. empresa@correo.com';
      }
    };

    const renderCartList = () => {
      const items = getCartItems();
      itemsCounter.textContent = String(items.length);
      clearBtn.style.display = items.length > 0 ? 'inline-flex' : 'none';

      if (items.length === 0) {
        itemsContainer.innerHTML = `
          <div class="text-center py-4 px-3 border rounded-3 bg-light">
            <i class="bi bi-clipboard2-plus fs-2 text-satiba-primary d-block mb-2"></i>
            <p class="mb-1 fw-semibold text-satiba-main">Aún no has agregado servicios</p>
            <p class="small mb-0">Usa el selector superior o explora nuestro <a href="servicios.html" class="fw-semibold">catálogo de servicios</a>.</p>
          </div>
        `;
        return;
      }

      itemsContainer.innerHTML = items
        .map((item, idx) => {
          const specText = item.especificacion
            ? `<div class="small text-muted mt-1"><i class="bi bi-info-circle me-1"></i>${escapeHtml(item.especificacion)}</div>`
            : '';

          return `
            <div class="quote-item-row d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3" data-item-uid="${escapeHtml(item.uid)}">
              <div class="flex-grow-1">
                <span class="service-category-tag mb-1">${escapeHtml(item.categoria)}</span>
                <div class="fw-bold text-satiba-main">${idx + 1}. ${escapeHtml(item.nombre)}</div>
                ${specText}
              </div>
              <div class="d-flex align-items-center gap-2 flex-shrink-0">
                <div class="qty-control-group" aria-label="Cantidad de ${escapeHtml(item.nombre)}">
                  <button type="button" data-qty-action="dec" data-uid="${escapeHtml(item.uid)}" aria-label="Disminuir cantidad">−</button>
                  <input type="number" min="1" value="${escapeHtml(item.cantidad)}" data-qty-input="${escapeHtml(item.uid)}" aria-label="Cantidad" />
                  <button type="button" data-qty-action="inc" data-uid="${escapeHtml(item.uid)}" aria-label="Aumentar cantidad">+</button>
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm" data-remove-uid="${escapeHtml(item.uid)}" title="Eliminar ítem" aria-label="Eliminar servicio">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          `;
        })
        .join('');
    };

    const getClientData = () => ({
      nombre: clientNameInput.value.trim(),
      departamento: deptSelect.value,
      medio: mediumSelect.value,
      contactoDato: contactDetailInput.value.trim(),
      notas: clientNotesInput.value.trim(),
      botcheck: botcheckInput ? botcheckInput.value : ''
    });

    const buildPlainSummary = (items, client) => {
      const lineasServicios = items
        .map((item, index) => {
          const spec = item.especificacion ? ` (${item.especificacion})` : '';
          return `${index + 1}. ${item.nombre} — Cantidad: ${item.cantidad}${spec}`;
        })
        .join('\n');

      return [
        `SOLICITUD DE COTIZACIÓN - ${SITE_CONFIG.EMPRESA.toUpperCase()}`,
        '==================================================',
        `Fecha: ${new Date().toLocaleDateString('es-SV')}`,
        `Cliente / Empresa: ${client.nombre}`,
        `Departamento: ${client.departamento}`,
        `Medio preferido: ${client.medio} (${client.contactoDato})`,
        '',
        'SERVICIOS SOLICITADOS:',
        lineasServicios,
        '',
        `Notas adicionales: ${client.notas || 'Ninguna'}`,
        '=================================================='
      ].join('\n');
    };

    const validateQuoteBeforeAction = () => {
      const items = getCartItems();
      const client = getClientData();

      if (items.length === 0) {
        window.Swal?.fire({
          icon: 'info',
          title: 'Agrega al menos un servicio',
          text: 'Selecciona un servicio en el panel izquierdo y presiona "+ Agregar a la lista" antes de continuar.',
          confirmButtonColor: '#00B050'
        });
        return null;
      }

      if (!client.nombre || !client.contactoDato) {
        window.Swal?.fire({
          icon: 'warning',
          title: 'Datos incompletos',
          text: 'Por favor ingresa tu nombre o empresa y tu dato de contacto preferido.',
          confirmButtonColor: '#00B050'
        });
        return null;
      }

      return { items, client };
    };

    const generateQuotePdf = (items, client) => {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        window.Swal?.fire({
          icon: 'error',
          title: 'Librería PDF no disponible',
          text: 'Verifica tu conexión a internet para generar el borrador PDF.',
          confirmButtonColor: '#005828'
        });
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;

      // Membrete Satiba Solutions
      doc.setFillColor(0, 176, 80);
      doc.rect(0, 0, pageWidth, 32, 'F');
      doc.setFillColor(0, 88, 40);
      doc.rect(0, 27, pageWidth, 5, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Satiba Solutions', margin, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Soluciones Tecnológicas y Soporte Técnico | Antiguo Cuscatlán, La Libertad', margin, 22);

      // Título del borrador
      let y = 44;
      doc.setTextColor(38, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('BORRADOR DE SOLICITUD DE COTIZACIÓN', margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(89, 99, 110);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-SV')}`, pageWidth - margin, y, { align: 'right' });

      // Datos del cliente
      y += 8;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'FD');

      doc.setTextColor(38, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Datos del Solicitante', margin + 4, y + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(`Nombre / Empresa: ${client.nombre}`, margin + 4, y + 14);
      doc.text(`Departamento: ${client.departamento}`, margin + 4, y + 20);
      doc.text(`Contacto (${client.medio}): ${client.contactoDato}`, pageWidth / 2, y + 14);

      // Tabla de servicios (sin precios)
      y += 37;
      doc.setFillColor(0, 88, 40);
      doc.rect(margin, y, pageWidth - margin * 2, 9, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('#', margin + 3, y + 6);
      doc.text('Servicio Solicitado', margin + 12, y + 6);
      doc.text('Especificación', margin + 96, y + 6);
      doc.text('Cant.', pageWidth - margin - 4, y + 6, { align: 'right' });

      y += 9;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(38, 38, 38);

      items.forEach((item, index) => {
        const specText = item.especificacion || 'Estándar según evaluación';
        const nameLines = doc.splitTextToSize(item.nombre, 78);
        const specLines = doc.splitTextToSize(specText, 64);
        const rowLines = Math.max(nameLines.length, specLines.length);
        const rowHeight = Math.max(9, rowLines * 5 + 4);

        if (y + rowHeight > 265) {
          doc.addPage();
          y = 20;
        }

        if (index % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'F');
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

        doc.text(String(index + 1), margin + 3, y + 6);
        doc.text(nameLines, margin + 12, y + 6);
        doc.text(specLines, margin + 96, y + 6);
        doc.text(String(item.cantidad), pageWidth - margin - 4, y + 6, { align: 'right' });

        y += rowHeight;
      });

      if (client.notas) {
        y += 10;
        if (y > 255) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Notas adicionales:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        const noteLines = doc.splitTextToSize(client.notas, pageWidth - margin * 2);
        doc.text(noteLines, margin, y + 6);
        y += noteLines.length * 5 + 6;
      }

      // Nota al pie sin precios
      const footerY = 280;
      doc.setDrawColor(0, 176, 80);
      doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
      doc.setFontSize(8.5);
      doc.setTextColor(89, 99, 110);
      doc.text(
        'Borrador informativo generado en el sitio web de Satiba Solutions. Precio sujeto a cotización formal personalizada.',
        margin,
        footerY
      );

      const safeFileName = client.nombre.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'cliente';
      doc.save(`cotizacion-satiba-${safeFileName}.pdf`);
    };

    // Eventos del constructor de ítems
    serviceSelect.addEventListener('change', updateSpecPlaceholder);
    mediumSelect.addEventListener('change', updateContactFieldHint);

    addBtn.addEventListener('click', () => {
      const selectedId = serviceSelect.value;
      if (!selectedId) {
        window.Swal?.fire({
          icon: 'info',
          title: 'Selecciona un servicio',
          text: 'Elige primero una opción de la lista desplegable.',
          confirmButtonColor: '#00B050'
        });
        return;
      }

      const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      const spec = specInput.value.trim();

      addServiceToCart(selectedId, qty, spec);
      qtyInput.value = '1';
      specInput.value = '';
      renderCartList();
    });

    itemsContainer.addEventListener('click', (event) => {
      const removeBtn = event.target.closest('[data-remove-uid]');
      if (removeBtn) {
        const uid = removeBtn.getAttribute('data-remove-uid');
        const next = getCartItems().filter((item) => item.uid !== uid);
        saveCartItems(next);
        renderCartList();
        return;
      }

      const qtyBtn = event.target.closest('[data-qty-action]');
      if (qtyBtn) {
        const action = qtyBtn.getAttribute('data-qty-action');
        const uid = qtyBtn.getAttribute('data-uid');
        const items = getCartItems();
        const target = items.find((item) => item.uid === uid);
        if (!target) return;

        if (action === 'inc') {
          target.cantidad += 1;
        } else if (action === 'dec' && target.cantidad > 1) {
          target.cantidad -= 1;
        }
        saveCartItems(items);
        renderCartList();
      }
    });

    itemsContainer.addEventListener('change', (event) => {
      const qtyField = event.target.closest('[data-qty-input]');
      if (!qtyField) return;
      const uid = qtyField.getAttribute('data-qty-input');
      const items = getCartItems();
      const target = items.find((item) => item.uid === uid);
      if (!target) return;

      target.cantidad = Math.max(1, parseInt(qtyField.value, 10) || 1);
      saveCartItems(items);
      renderCartList();
    });

    clearBtn.addEventListener('click', () => {
      window.Swal?.fire({
        icon: 'question',
        title: '¿Limpiar lista de servicios?',
        text: 'Se eliminarán todos los servicios agregados al cotizador.',
        showCancelButton: true,
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#005828'
      }).then((res) => {
        if (res.isConfirmed) {
          saveCartItems([]);
          renderCartList();
        }
      });
    });

    // Descargar borrador PDF
    pdfBtn.addEventListener('click', () => {
      const validated = validateQuoteBeforeAction();
      if (!validated) return;
      generateQuotePdf(validated.items, validated.client);
    });

    // Enviar solicitud (Web3Forms o Copiado + Facebook según EMAIL_ACTIVO)
    quoteForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const validated = validateQuoteBeforeAction();
      if (!validated) return;

      const { items, client } = validated;
      const summary = buildPlainSummary(items, client);

      sendBtn.disabled = true;
      try {
        const result = await enviarSolicitudCanal({
          subject: `Nueva solicitud de cotización - ${client.nombre}`,
          mensajeTexto: summary,
          honeypotValor: client.botcheck,
          web3Payload: {
            cliente: client.nombre,
            departamento: client.departamento,
            medio_contacto: client.medio,
            dato_contacto: client.contactoDato
          }
        });

        if (result.spam) return;

        if (result.mode === 'email') {
          await window.Swal?.fire({
            icon: 'success',
            title: '¡Cotización enviada!',
            text: 'Recibimos tu solicitud. Nuestro equipo te contactará muy pronto con una propuesta clara.',
            confirmButtonColor: '#00B050'
          });
          saveCartItems([]);
          renderCartList();
          quoteForm.reset();
          updateContactFieldHint();
        } else {
          await window.Swal?.fire({
            icon: 'success',
            title: result.copied ? '¡Pedido copiado al portapapeles!' : 'Pedido preparado',
            html: result.copied
              ? 'Copiamos el detalle completo de tu cotización. Al continuar se abrirá la página oficial de <strong>Facebook de Satiba Solutions</strong> para que solo pegues y envíes tu mensaje.'
              : 'Se abrirá nuestra página oficial de <strong>Facebook</strong>. Puedes descargar también el resumen en PDF para adjuntarlo.',
            confirmButtonText: 'Ir a Facebook y Enviar',
            confirmButtonColor: '#00B050'
          });
          window.open(result.facebookUrl, '_blank', 'noopener,noreferrer');
        }
      } catch (err) {
        window.Swal?.fire({
          icon: 'error',
          title: 'Error al procesar solicitud',
          text: err.message || 'Ocurrió un inconveniente. Puedes descargar el PDF y enviárnoslo por Facebook.',
          confirmButtonColor: '#005828'
        });
      } finally {
        sendBtn.disabled = false;
      }
    });

    populateServiceSelect();
    populateClientSelects();
    updateSpecPlaceholder();
    updateContactFieldHint();
    renderCartList();
  });
})();
