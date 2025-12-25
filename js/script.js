/************************************************
 * 🔐 LOGIN – index.html
 ************************************************/

$("#loginForm").submit(function (e) {
  e.preventDefault();

  const email = $("#email").val();
  const password = $("#password").val();
  const alerta = $("#alerta");

  if (email === "usuario@mail.com" && password === "1234") {
    sessionStorage.setItem("login", "true");

    if (!sessionStorage.getItem("saldo")) {
      sessionStorage.setItem("saldo", "150000");
    }

    alerta
      .removeClass("d-none alert-danger")
      .addClass("alert-success")
      .text("✅ Inicio de sesión exitoso");

    setTimeout(() => {
      window.location.href = "menu.html";
    }, 1500);
  } else {
    alerta
      .removeClass("d-none alert-success")
      .addClass("alert-danger")
      .text("❌ Email o contraseña incorrectos");
  }
});

/************************************************
 * 🚪 CERRAR SESIÓN
 ************************************************/

function cerrarSesion() {
  sessionStorage.clear();
  alert("Sesión cerrada");
  window.location.href = "index.html";
}

/************************************************
 * 🧭 NAVEGACIÓN ENTRE PANTALLAS (HEADER)
 ************************************************/

$(document).ready(function () {
  function mostrarMensaje(texto) {
    if ($("#mensaje").length) {
      $("#mensaje").text(texto);
    } else if ($("#alert-container").length) {
      $("#alert-container").html(
        `<div class="alert alert-info">${texto}</div>`
      );
    }
  }

  $("#btnMenu").click(function () {
    mostrarMensaje("Redirigiendo a Menú Principal...");
    setTimeout(() => (window.location.href = "menu.html"), 1000);
  });

  $("#btnEnviar").click(function () {
    mostrarMensaje("Redirigiendo a Enviar Dinero...");
    setTimeout(() => (window.location.href = "sendmoney.html"), 1000);
  });

  $("#btnDepositar").click(function () {
    mostrarMensaje("Redirigiendo a Depositar Dinero...");
    setTimeout(() => (window.location.href = "deposit.html"), 1000);
  });

  $("#btnMovimientos").click(function () {
    mostrarMensaje("Redirigiendo a Últimos Movimientos...");
    setTimeout(() => (window.location.href = "transactions.html"), 1000);
  });
});

/************************************************
 * 💰 SALDO (menu.html y deposit.html)
 ************************************************/

function mostrarSaldo() {
  const saldo = sessionStorage.getItem("saldo");
  const saldoElemento = document.getElementById("saldo");

  if (saldoElemento && saldo) {
    saldoElemento.textContent = "$" + Number(saldo).toLocaleString();
  }
}
function mostrarSaldoDeposito() {
  const saldo = sessionStorage.getItem("saldo");

  if (saldo && $("#saldoActual").length) {
    $("#saldoActual").text("$" + Number(saldo).toLocaleString());
  }
}
/************************************************
 * 📜 ÚLTIMOS MOVIMIENTOS – transactions.html
 ************************************************/

/* Traduce el tipo de transacción a texto legible */
function getTipoTransaccion(tipo) {
  switch (tipo) {
    case "deposito":
      return "Depósito";
    case "envio":
      return "Transferencia enviada";
    default:
      return "Movimiento";
  }
}

/* Muestra los movimientos según filtro */
function mostrarUltimosMovimientos(filtro = "todos") {
  const lista = $("#listaMovimientos");
  lista.empty();

  const movimientos = JSON.parse(sessionStorage.getItem("movimientos")) || [];

  if (movimientos.length === 0) {
    lista.append(
      '<li class="list-group-item">No hay movimientos registrados</li>'
    );
    return;
  }

  movimientos.forEach((mov) => {
    // Si hay filtro y no coincide, no lo mostramos
    if (filtro !== "todos" && mov.tipo !== filtro) {
      return;
    }

    const tipoLegible = getTipoTransaccion(mov.tipo);

    const montoFormato =
      (mov.monto > 0 ? "+" : "") + "$" + Math.abs(mov.monto).toLocaleString();

    lista.append(`
      <li class="list-group-item d-flex justify-content-between">
        <div>
          <strong>${tipoLegible}</strong><br>
          <small>${mov.fecha}</small><br>
          <span>${mov.descripcion}</span>
        </div>
        <span class="${mov.monto > 0 ? "text-success" : "text-danger"}">
          ${montoFormato}
        </span>
      </li>
    `);
  });
}

/************************************************
 * 🚀 jQuery READY – transactions.html
 ************************************************/

$(document).ready(function () {
  // Mostrar todos los movimientos al cargar
  if ($("#listaMovimientos").length) {
    mostrarUltimosMovimientos("todos");
  }

  // Filtrar cuando cambia el select
  $("#filtroMovimientos").change(function () {
    const filtro = $(this).val();
    mostrarUltimosMovimientos(filtro);
  });
});

/************************************************
 * ➕ DEPÓSITO – deposit.html
 ************************************************/

function confirmarDeposito() {
  const monto = Number($("#monto").val());
  let saldo = Number(sessionStorage.getItem("saldo")) || 0;

  if (monto <= 0) {
    alert("Ingrese un monto válido");
    return false;
  }

  if (confirm("¿Está seguro de realizar el depósito?")) {
    saldo += monto;
    sessionStorage.setItem("saldo", saldo);

    guardarMovimiento("deposito", "Depósito recibido", monto);

    $("#alert-container").html(`
      <div class="alert alert-success">
        ✅ Depósito realizado con éxito
      </div>
    `);

    $("#leyendaDeposito").text("Has depositado $" + monto.toLocaleString());

    setTimeout(() => (window.location.href = "menu.html"), 2000);
  }

  return false;
}

/************************************************
 * 👤 CONTACTOS – sendmoney.html
 ************************************************/

/* Cargar contactos en el select */
function cargarContactos() {
  const select = document.getElementById("destinatario");
  if (!select) return;

  select.innerHTML = '<option value="">Seleccione un contacto</option>';

  const contactos = JSON.parse(sessionStorage.getItem("contactos")) || [];

  contactos.forEach((contacto) => {
    const option = document.createElement("option");
    option.value = contacto.nombre;
    option.textContent = `${contacto.nombre} (${contacto.alias}) - ${contacto.banco}`;
    select.appendChild(option);
  });
}

/* Mostrar lista de contactos */
$("#btnIrAgenda").click(function () {
  window.location.href = "contacts.html";
});
/* Volver a sendmoney */
$("#btnVolverEnviar").click(function () {
  window.location.href = "sendmoney.html";
});

/* Mostrar lista de contactos con botón borrar */

function mostrarListaContactos() {
  const lista = $("#listaContactos");
  if (!lista.length) return;

  lista.empty();

  const contactos = JSON.parse(sessionStorage.getItem("contactos")) || [];

  if (contactos.length === 0) {
    lista.append('<li class="list-group-item">No hay contactos guardados</li>');
    return;
  }

  contactos.forEach((contacto, index) => {
    lista.append(`
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>
          <strong>${contacto.nombre}</strong> (${contacto.alias}) - ${contacto.banco}
        </span>
        <button class="btn btn-sm btn-danger" onclick="eliminarContacto(${index})">
          🗑️ Eliminar
        </button>
      </li>
    `);
  });
}

/* Eliminar contacto */
function eliminarContacto(indice) {
  const contactos = JSON.parse(sessionStorage.getItem("contactos")) || [];
  const contacto = contactos[indice];

  if (!contacto) return;

  if (confirm(`¿Eliminar a ${contacto.nombre}?`)) {
    contactos.splice(indice, 1);
    sessionStorage.setItem("contactos", JSON.stringify(contactos));
    cargarContactos();
    mostrarListaContactos();
  }
}

/* Guardar contacto */
function guardarContacto() {
  const nombre = $("#nombreContacto").val().trim();
  const cbu = $("#cbuContacto").val().trim();
  const alias = $("#aliasContacto").val().trim();
  const banco = $("#bancoContacto").val().trim();

  if (!nombre || !cbu || !alias || !banco) {
    alert("Todos los campos son obligatorios");
    return;
  }

  if (!/^\d{6,}$/.test(cbu)) {
    alert("El CBU debe tener al menos 6 números");
    return;
  }

  const contacto = { nombre, cbu, alias, banco };
  const contactos = JSON.parse(sessionStorage.getItem("contactos")) || [];
  contactos.push(contacto);
  sessionStorage.setItem("contactos", JSON.stringify(contactos));

  $("#modalContacto").hide();
  $("#nombreContacto, #cbuContacto, #aliasContacto, #bancoContacto").val("");

  cargarContactos();
  mostrarListaContactos();
}

/************************************************
 * 💸 ENVÍO DE DINERO – sendmoney.html
 ************************************************/

function confirmarEnvio() {
  const destinatario = $("#destinatario").val();
  const monto = Number($("#montoEnvio").val());
  let saldo = Number(sessionStorage.getItem("saldo")) || 0;

  if (!destinatario) {
    alert("Seleccione un contacto");
    return false;
  }

  if (monto <= 0) {
    alert("Ingrese un monto válido");
    return false;
  }

  if (monto > saldo) {
    alert("Saldo insuficiente");
    return false;
  }

  if (confirm(`¿Enviar $${monto} a ${destinatario}?`)) {
    saldo -= monto;
    sessionStorage.setItem("saldo", saldo);

    guardarMovimiento("envio", `Envío a ${destinatario}`, -monto);

    $("#mensajeEnvio").html(`
      <div class="alert alert-success">
        ✅ Envío realizado con éxito
      </div>
    `);

    setTimeout(() => (window.location.href = "menu.html"), 2000);
  }

  return false;
}

/************************************************
 * 📜 HISTORIAL DE MOVIMIENTOS
 ************************************************/

function guardarMovimiento(tipo, descripcion, monto) {
  const movimiento = {
    tipo,
    descripcion,
    monto,
    fecha: new Date().toLocaleString(),
  };

  const movimientos = JSON.parse(sessionStorage.getItem("movimientos")) || [];
  movimientos.unshift(movimiento);
  sessionStorage.setItem("movimientos", JSON.stringify(movimientos));
}

/************************************************
 * 🚀 CARGA INICIAL (todas las páginas)
 ************************************************/

window.onload = function () {
  mostrarSaldo();
  mostrarSaldoDeposito();
  cargarContactos();
  mostrarListaContactos();
};

/* Eventos jQuery específicos de sendmoney */
$(document).ready(function () {
  $("#btnNuevoContacto").click(() => $("#modalContacto").show());
  $("#btnCancelarContacto").click(() => $("#modalContacto").hide());

  $("#buscadorContactos").on("keyup", function () {
    const texto = $(this).val().toLowerCase();

    $("#destinatario option").each(function () {
      if ($(this).val() === "") {
        $(this).show();
      } else {
        $(this).toggle($(this).text().toLowerCase().includes(texto));
      }
    });
  });

  $("#btnEnviarDinero").addClass("d-none");

  $("#destinatario").change(function () {
    $(this).val()
      ? $("#btnEnviarDinero").removeClass("d-none")
      : $("#btnEnviarDinero").addClass("d-none");
  });
});

/************************************************
 * 🧭 NAVEGACIÓN HEADER – TODAS LAS PÁGINAS
 ************************************************/

$(document).ready(function () {
  $(document).on("click", "#btnMenu", function () {
    window.location.href = "menu.html";
  });

  $(document).on("click", "#btnDepositar", function () {
    window.location.href = "deposit.html";
  });

  $(document).on("click", "#btnEnviar", function () {
    window.location.href = "sendmoney.html";
  });

  $(document).on("click", "#btnMovimientos", function () {
    window.location.href = "transactions.html";
  });

  $(document).on("click", "#btnIrAgenda", function () {
    window.location.href = "contacts.html";
  });

  $(document).on("click", "#btnVolverEnviar", function () {
    window.location.href = "sendmoney.html";
  });
});
/************************************************
 * 🔒 PROTECCIÓN GLOBAL DE PÁGINAS PRIVADAS
 ************************************************/

$(document).ready(function () {
  const paginasProtegidas = [
    "menu.html",
    "deposit.html",
    "sendmoney.html",
    "transactions.html",
    "contacts.html",
  ];

  const paginaActual = window.location.pathname.split("/").pop();

  if (paginasProtegidas.includes(paginaActual)) {
    verificarSesion();
  }
});
