const STORAGE_KEY = "usuarios";

function cargarUsuarios() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY);

    if (datos === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    const usuariosGuardados = JSON.parse(datos);

    return Array.isArray(usuariosGuardados) ? usuariosGuardados : [];
  } catch (error) {
    console.error("Error al cargar los usuarios:", error);
    return [];
  }
}

let usuarios = cargarUsuarios();
let usuarioEditando = null;

document.body.innerHTML = `
    <main class="container">
        <header class="header">
            <div>
                <h1>Gestión de Usuarios</h1>
                <p>Administra los usuarios del sistema.</p>
            </div>
        </header>

        <section class="card">
            <a class="comercios-boton comercios-boton-volver"
               href="./dashboard.html">
                Volver al inicio
            </a>

            <h2 id="tituloFormulario">Registrar usuario</h2>

            <form id="formUsuario">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="nombre">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            required
                            maxlength="60"
                            placeholder="Nombre del usuario"
                        >
                    </div>

                    <div class="form-group">
                        <label for="apellido">Apellido</label>
                        <input
                            type="text"
                            id="apellido"
                            required
                            maxlength="60"
                            placeholder="Apellido del usuario"
                        >
                    </div>

                    <div class="form-group">
                        <label for="correo">Correo electrónico</label>
                        <input
                            type="email"
                            id="correo"
                            required
                            maxlength="120"
                            placeholder="usuario@gmail.com"
                        >
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            required
                            minlength="4"
                            maxlength="100"
                            placeholder="Contraseña"
                        >
                    </div>

                    <div class="form-group">
                        <label for="rol">Rol</label>
                        <select id="rol" required>
                            <option value="Administrador">
                                Administrador
                            </option>
                            <option value="usuario">
                                Usuario
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="estado">Estado</label>
                        <select id="estado" required>
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary">
                        Guardar usuario
                    </button>

                    <button
                        type="button"
                        class="btn-secondary"
                        id="btnCancelar"
                        hidden
                    >
                        Cancelar edición
                    </button>
                </div>
            </form>
        </section>

        <section class="card">
            <h2>Usuarios registrados</h2>

            <div class="filters">
                <input
                    type="search"
                    id="buscar"
                    placeholder="Buscar por nombre, apellido o correo..."
                    aria-label="Buscar usuarios"
                >

                <select id="filtroRol" aria-label="Filtrar por rol">
                    <option value="">Todos los roles</option>
                    <option value="Administrador">Administrador</option>
                    <option value="usuario">Usuario</option>
                </select>
            </div>

            <p class="counter" id="contador"></p>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody id="tablaUsuarios"></tbody>
                </table>
            </div>
        </section>
    </main>
`;

const formUsuario = document.getElementById("formUsuario");
const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");
const correoInput = document.getElementById("correo");
const passwordInput = document.getElementById("password");
const rolInput = document.getElementById("rol");
const estadoInput = document.getElementById("estado");
const tablaUsuarios = document.getElementById("tablaUsuarios");
const buscarInput = document.getElementById("buscar");
const filtroRol = document.getElementById("filtroRol");
const contador = document.getElementById("contador");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnCancelar = document.getElementById("btnCancelar");

function guardarUsuarios() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));

    return true;
  } catch (error) {
    console.error("Error al guardar los usuarios:", error);
    alert("No se pudieron guardar los cambios en LocalStorage.");
    return false;
  }
}

// Escapar caracteres para evitar que los datos se interpreten como HTML.
function escaparHTML(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => {
    const entidades = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entidades[caracter];
  });
}

// Listar, buscar y filtrar usuarios.
function listarUsuarios() {
  const texto = buscarInput.value.trim().toLowerCase();
  const rolSeleccionado = filtroRol.value;

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const coincideBusqueda = [
      usuario.nombre,
      usuario.apellido,
      usuario.correo,
    ].some((valor) =>
      String(valor ?? "")
        .toLowerCase()
        .includes(texto),
    );

    const coincideRol =
      rolSeleccionado === "" || usuario.rol === rolSeleccionado;

    return coincideBusqueda && coincideRol;
  });

  contador.textContent = `Mostrando ${usuariosFiltrados.length} de ${usuarios.length} usuarios`;

  if (usuariosFiltrados.length === 0) {
    tablaUsuarios.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    ${
                      usuarios.length === 0
                        ? "No hay usuarios registrados."
                        : "No se encontraron usuarios."
                    }
                </td>
            </tr>
        `;
    return;
  }

  tablaUsuarios.innerHTML = usuariosFiltrados
    .map(
      (usuario) => `
        <tr>
            <td>${escaparHTML(usuario.id)}</td>
            <td>${escaparHTML(usuario.nombre)}</td>
            <td>${escaparHTML(usuario.apellido)}</td>
            <td>${escaparHTML(usuario.correo)}</td>
            <td>${escaparHTML(usuario.rol)}</td>

            <td>
                <span class="badge ${
                  usuario.estado === "Activo"
                    ? "badge-active"
                    : "badge-inactive"
                }">
                    ${escaparHTML(usuario.estado)}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="btn-edit"
                    data-accion="editar"
                    data-id="${escaparHTML(usuario.id)}"
                >
                    Editar
                </button>

                <button
                    type="button"
                    class="btn-status"
                    data-accion="estado"
                    data-id="${escaparHTML(usuario.id)}"
                >
                    ${usuario.estado === "Activo" ? "Desactivar" : "Activar"}
                </button>

                <button
                    type="button"
                    class="btn-delete"
                    data-accion="eliminar"
                    data-id="${escaparHTML(usuario.id)}"
                >
                    Eliminar
                </button>
            </td>
        </tr>
    `,
    )
    .join("");
}

// Registrar o actualizar usuarios.
formUsuario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const nombre = nombreInput.value.trim();
  const apellido = apellidoInput.value.trim();
  const correo = correoInput.value.trim();
  const password = passwordInput.value;
  const rol = rolInput.value;
  const estado = estadoInput.value;

  if (
    !nombre ||
    !apellido ||
    !correo ||
    (usuarioEditando === null && !password)
  ) {
    alert("Completa todos los campos obligatorios.");
    return;
  }

  // Validar que el correo no esté registrado en otro usuario.
  const correoExiste = usuarios.some(
    (usuario) =>
      usuario.correo.toLowerCase() === correo.toLowerCase() &&
      usuario.id !== usuarioEditando,
  );

  if (correoExiste) {
    alert("Ya existe un usuario registrado con ese correo.");
    return;
  }

  let usuariosActualizados;

  if (usuarioEditando !== null) {
    // Actualizar usuario.
    usuariosActualizados = usuarios.map((usuario) => {
      if (usuario.id !== usuarioEditando) {
        return usuario;
      }

      return {
        ...usuario,
        nombre,
        apellido,
        correo,
        password: password || usuario.password,
        rol,
        estado,
      };
    });
  } else {
    // Generar un ID numérico único.
    const nuevoId =
      usuarios.reduce(
        (mayor, usuario) => Math.max(mayor, Number(usuario.id) || 0),
        0,
      ) + 1;

    const nuevoUsuario = {
      id: nuevoId,
      nombre,
      apellido,
      correo,
      password,
      rol,
      estado,
    };

    usuariosActualizados = [...usuarios, nuevoUsuario];
  }

  const usuariosAnteriores = usuarios;
  usuarios = usuariosActualizados;

  if (!guardarUsuarios()) {
    usuarios = usuariosAnteriores;
    return;
  }

  alert(
    usuarioEditando !== null
      ? "Usuario actualizado correctamente."
      : "Usuario registrado correctamente.",
  );

  cancelarEdicion();
  listarUsuarios();
});

// Editar usuario.
function editarUsuario(id) {
  const usuario = usuarios.find((usuario) => usuario.id === id);

  if (!usuario) return;

  usuarioEditando = usuario.id;

  nombreInput.value = usuario.nombre;
  apellidoInput.value = usuario.apellido;
  correoInput.value = usuario.correo;
  passwordInput.value = "";
  rolInput.value = usuario.rol;
  estadoInput.value = usuario.estado;

  tituloFormulario.textContent = "Editar usuario";
  btnCancelar.hidden = false;

  passwordInput.required = false;
  passwordInput.placeholder = "Vacío para conservar la contraseña";

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Cancelar edición.
function cancelarEdicion() {
  usuarioEditando = null;

  formUsuario.reset();

  tituloFormulario.textContent = "Registrar usuario";
  btnCancelar.hidden = true;

  passwordInput.required = true;
  passwordInput.placeholder = "Contraseña";
}

// Cambiar estado del usuario.
function cambiarEstado(id) {
  const usuario = usuarios.find((usuario) => usuario.id === id);

  if (!usuario) return;

  const nuevoEstado = usuario.estado === "Activo" ? "Inactivo" : "Activo";

  if (
    !confirm(`¿Deseas cambiar el estado de ${usuario.nombre} a ${nuevoEstado}?`)
  ) {
    return;
  }

  const usuariosAnteriores = usuarios;

  usuarios = usuarios.map((usuarioActual) =>
    usuarioActual.id === id
      ? { ...usuarioActual, estado: nuevoEstado }
      : usuarioActual,
  );

  if (!guardarUsuarios()) {
    usuarios = usuariosAnteriores;
    return;
  }

  listarUsuarios();
}

// Eliminar usuario.
function eliminarUsuario(id) {
  const usuario = usuarios.find((usuario) => usuario.id === id);

  if (!usuario) return;

  if (
    !confirm(
      `¿Estás seguro de eliminar a ${usuario.nombre} ${usuario.apellido}?`,
    )
  ) {
    return;
  }

  const usuariosAnteriores = usuarios;

  usuarios = usuarios.filter((usuario) => usuario.id !== id);

  if (!guardarUsuarios()) {
    usuarios = usuariosAnteriores;
    return;
  }

  if (usuarioEditando === id) {
    cancelarEdicion();
  }

  listarUsuarios();
}

// Delegación de eventos para los botones de la tabla.
tablaUsuarios.addEventListener("click", function (evento) {
  const boton = evento.target.closest("button[data-accion]");

  if (!boton) return;

  const id = Number(boton.dataset.id);
  const accion = boton.dataset.accion;

  if (accion === "editar") {
    editarUsuario(id);
  } else if (accion === "estado") {
    cambiarEstado(id);
  } else if (accion === "eliminar") {
    eliminarUsuario(id);
  }
});

// Eventos de búsqueda, filtro y cancelación.
buscarInput.addEventListener("input", listarUsuarios);
filtroRol.addEventListener("change", listarUsuarios);
btnCancelar.addEventListener("click", cancelarEdicion);

// Mostrar los usuarios almacenados al iniciar.
listarUsuarios();
