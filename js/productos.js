
const STORAGE_KEY = "comercios";

// Obtener el ID del comercio desde los parámetros de la URL
const parametros = new URLSearchParams(window.location.search);
const comercioId = parametros.get("comercioId");

// Elementos del HTML
const formulario = document.getElementById("productos-formulario");
const nombreInput = document.getElementById("productos-nombre");
const categoriaInput = document.getElementById("productos-categoria");
const precioInput = document.getElementById("productos-precio");
const stockInput = document.getElementById("productos-stock");
const descripcionInput = document.getElementById("productos-descripcion");

const busquedaInput = document.getElementById("productos-busqueda");
const filtroCategoriaInput = document.getElementById(
  "productos-filtro-categoria"
);

const tablaCuerpo = document.getElementById("productos-tabla-cuerpo");
const contador = document.getElementById("productos-contador");
const botonCancelar = document.getElementById("productos-cancelar");
const tituloFormulario = document.getElementById(
  "productos-titulo-formulario"
);

// Estado de edición
let productoEditandoId = null;

// Leer los comercios de localStorage
function obtenerComercios() {
  try {
    const datos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    console.error("Error al leer los comercios:", error);
    return [];
  }
}

// Guardar los comercios en localStorage
function guardarComercios(comercios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comercios));
}

// Buscar el comercio de esta página
function obtenerComercio() {
  const comercios = obtenerComercios();

  return comercios.find(
    comercio => String(comercio.id) === String(comercioId)
  );
}

// Escapar texto para evitar interpretar datos como HTML
function escaparHTML(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, caracter => {
    const entidades = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entidades[caracter];
  });
}

// Obtener un ID nuevo dentro del comercio
function obtenerNuevoId(productos) {
  return productos.reduce((mayor, producto) => {
    const id = Number(producto.id);
    return Number.isFinite(id) ? Math.max(mayor, id) : mayor;
  }, 0) + 1;
}

// Validar que exista el comercio
function validarComercio() {
  if (!comercioId) {
    alert("Falta el parámetro comercioId en la URL.");
    formulario.querySelectorAll("input, select, textarea, button")
      .forEach(elemento => elemento.disabled = true);
    return false;
  }

  if (!obtenerComercio()) {
    alert("No se encontró el comercio solicitado.");
    formulario.querySelectorAll("input, select, textarea, button")
      .forEach(elemento => elemento.disabled = true);
    return false;
  }

  return true;
}

// Guardar un producto dentro del comercio correspondiente
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const comercios = obtenerComercios();

  const indiceComercio = comercios.findIndex(
    comercio => String(comercio.id) === String(comercioId)
  );

  if (indiceComercio === -1) {
    alert("El comercio ya no existe en localStorage.");
    return;
  }

  const comercio = comercios[indiceComercio];

  // Asegurar que el comercio tenga su propio array de productos
  if (!Array.isArray(comercio.productos)) {
    comercio.productos = [];
  }

  const nombre = nombreInput.value.trim();
  const categoria = categoriaInput.value;
  const precio = Number(precioInput.value);
  const stock = Number(stockInput.value);
  const descripcion = descripcionInput.value.trim();

  if (!nombre || precioInput.value === "" || stockInput.value === "") {
    alert("Completa los campos obligatorios.");
    return;
  }

  if (
    !Number.isFinite(precio) ||
    !Number.isFinite(stock) ||
    precio < 0 ||
    stock < 0 ||
    !Number.isInteger(precio) ||
    !Number.isInteger(stock)
  ) {
    alert("El precio y el stock deben ser números enteros válidos.");
    return;
  }

  const datosProducto = {
    nombre,
    categoria,
    precio,
    stock,
    descripcion
  };

  if (productoEditandoId !== null) {
    // Actualizar el producto dentro del comercio
    const indiceProducto = comercio.productos.findIndex(
      producto => String(producto.id) === String(productoEditandoId)
    );

    if (indiceProducto === -1) {
      alert("No se encontró el producto que deseas editar.");
      cancelarEdicion();
      return;
    }

    comercio.productos[indiceProducto] = {
      ...comercio.productos[indiceProducto],
      ...datosProducto
    };

    alert("Producto actualizado correctamente.");
  } else {
    // Crear un producto nuevo dentro de este comercio
    const nuevoProducto = {
      id: obtenerNuevoId(comercio.productos),
      ...datosProducto
    };

    comercio.productos.push(nuevoProducto);

    alert("Producto agregado correctamente.");
  }

  // Guardar el array completo de comercios con sus productos
  guardarComercios(comercios);

  cancelarEdicion();
  listarProductos();
});

// Mostrar los productos del comercio actual
function listarProductos() {
  const comercio = obtenerComercio();

  if (!comercio) {
    tablaCuerpo.innerHTML = `
      <tr>
        <td colspan="8">No se encontró el comercio.</td>
      </tr>
    `;

    contador.textContent = "No hay un comercio seleccionado.";
    return;
  }

  const productos = Array.isArray(comercio.productos)
    ? comercio.productos
    : [];

  const busqueda = busquedaInput.value.trim().toLowerCase();
  const categoriaSeleccionada = filtroCategoriaInput.value;

  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda =
      String(producto.nombre ?? "").toLowerCase().includes(busqueda) ||
      String(producto.descripcion ?? "").toLowerCase().includes(busqueda);

    const coincideCategoria =
      !categoriaSeleccionada ||
      producto.categoria === categoriaSeleccionada;

    return coincideBusqueda && coincideCategoria;
  });

  contador.textContent =
    `Productos registrados: ${productos.length} | Mostrando: ${productosFiltrados.length}`;

  if (productosFiltrados.length === 0) {
    tablaCuerpo.innerHTML = `
      <tr>
        <td colspan="8">No hay productos para mostrar.</td>
      </tr>
    `;
    return;
  }

  tablaCuerpo.innerHTML = productosFiltrados.map(producto => `
    <tr>
      <td>${escaparHTML(producto.id)}</td>
      <td>${escaparHTML(producto.nombre)}</td>
      <td>${escaparHTML(producto.categoria)}</td>
      <td>$${Number(producto.precio || 0).toLocaleString("es-CO")}</td>
      <td>${escaparHTML(producto.stock)}</td>
      <td>${Number(producto.stock) > 0 ? "Disponible" : "Agotado"}</td>
      <td>${escaparHTML(producto.descripcion)}</td>
      <td id="buttonsProductos">
        <button
          type="button"
          data-accion="editar"
          data-id="${escaparHTML(producto.id)}"
        >
          Editar
        </button>

        <button
          type="button"
          data-accion="eliminar"
          data-id="${escaparHTML(producto.id)}"
        >
          Eliminar
        </button>
      </td>
    </tr>
  `).join("");
}

// Editar o eliminar productos mediante los botones de la tabla
tablaCuerpo.addEventListener("click", function (evento) {
  const boton = evento.target.closest("button[data-accion]");

  if (!boton) return;

  const accion = boton.dataset.accion;
  const productoId = boton.dataset.id;

  const comercio = obtenerComercio();

  if (!comercio || !Array.isArray(comercio.productos)) return;

  const producto = comercio.productos.find(
    elemento => String(elemento.id) === String(productoId)
  );

  if (!producto) {
    alert("No se encontró el producto.");
    return;
  }

  if (accion === "editar") {
    productoEditandoId = producto.id;

    nombreInput.value = producto.nombre ?? "";
    categoriaInput.value = producto.categoria ?? "Otros";
    precioInput.value = producto.precio ?? 0;
    stockInput.value = producto.stock ?? 0;
    descripcionInput.value = producto.descripcion ?? "";

    tituloFormulario.textContent = "Editar producto";
    botonCancelar.hidden = false;

    formulario.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  if (accion === "eliminar") {
    const confirmar = confirm(
      `¿Deseas eliminar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    const comercios = obtenerComercios();

    const comercioActual = comercios.find(
      elemento => String(elemento.id) === String(comercioId)
    );

    if (!comercioActual || !Array.isArray(comercioActual.productos)) {
      alert("No se encontró el comercio.");
      return;
    }

    comercioActual.productos = comercioActual.productos.filter(
      elemento => String(elemento.id) !== String(productoId)
    );

    guardarComercios(comercios);

    if (String(productoEditandoId) === String(productoId)) {
      cancelarEdicion();
    }

    listarProductos();
  }
});

// Cancelar la edición y limpiar el formulario
function cancelarEdicion() {
  formulario.reset();
  productoEditandoId = null;

  tituloFormulario.textContent = "Registrar producto";
  botonCancelar.hidden = true;
}

botonCancelar.addEventListener("click", cancelarEdicion);

// Buscar y filtrar productos
busquedaInput.addEventListener("input", listarProductos);
filtroCategoriaInput.addEventListener("change", listarProductos);

// Inicializar el módulo
if (validarComercio()) {
  listarProductos();
}