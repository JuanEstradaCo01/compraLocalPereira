
const COMERCIOS_STORAGE_KEY = "comercios";

function cargarComercios() {
    try {
        const datos = localStorage.getItem(COMERCIOS_STORAGE_KEY);

        if (datos === null) {
            localStorage.setItem(COMERCIOS_STORAGE_KEY, JSON.stringify([]));
            return [];
        }

        const comerciosGuardados = JSON.parse(datos);
        return Array.isArray(comerciosGuardados) ? comerciosGuardados : [];
    } catch (error) {
        console.error("Error al cargar los comercios:", error);
        return [];
    }
}

let comercios = cargarComercios();
let comercioEditando = null;

const formulario = document.getElementById("comercios-formulario");
const nombreInput = document.getElementById("comercios-nombre");
const nitInput = document.getElementById("comercios-nit");
const telefonoInput = document.getElementById("comercios-telefono");
const correoInput = document.getElementById("comercios-correo");
const direccionInput = document.getElementById("comercios-direccion");
const descripcionInput = document.getElementById("comercios-descripcion");
const busquedaInput = document.getElementById("comercios-busqueda");
const tablaCuerpo = document.getElementById("comercios-tabla-cuerpo");
const contador = document.getElementById("comercios-contador");
const tituloFormulario = document.getElementById("comercios-titulo-formulario");
const botonCancelar = document.getElementById("comercios-cancelar");

function guardarComercios() {
    try {
        localStorage.setItem(
            COMERCIOS_STORAGE_KEY,
            JSON.stringify(comercios)
        );
        return true;
    } catch (error) {
        console.error("Error al guardar los comercios:", error);
        alert("No se pudieron guardar los cambios en LocalStorage.");
        return false;
    }
}

function escaparHTML(valor) {
    const entidades = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(valor ?? "").replace(/[&<>"']/g, caracter => entidades[caracter]);
}

function listarComercios() {
    const texto = busquedaInput.value.trim().toLowerCase();

    const comerciosFiltrados = comercios.filter(comercio => {
        return [
            comercio.nombre,
            comercio.nit,
            comercio.correo,
            comercio.telefono,
            comercio.direccion
        ].some(valor =>
            String(valor ?? "").toLowerCase().includes(texto)
        );
    });

    contador.textContent =
        `Mostrando ${comerciosFiltrados.length} de ${comercios.length} comercios`;

    if (comerciosFiltrados.length === 0) {
        tablaCuerpo.innerHTML = `
            <tr>
                <td colspan="7" class="comercios-mensaje-vacio">
                    ${comercios.length === 0
                        ? "No hay comercios registrados."
                        : "No se encontraron comercios."}
                </td>
            </tr>
        `;
        return;
    }

    tablaCuerpo.innerHTML = comerciosFiltrados.map(comercio => `
        <tr>
            <td class="comercios-id">${escaparHTML(comercio.id)}</td>
            <td>${escaparHTML(comercio.nombre)}</td>
            <td>${escaparHTML(comercio.nit || "No registrado")}</td>
            <td>${escaparHTML(comercio.telefono || "No registrado")}</td>
            <td>${escaparHTML(comercio.correo || "No registrado")}</td>
            <td>${escaparHTML(comercio.direccion || "No registrada")}</td>
            <td>
                <div class="comercios-acciones">
                    <button type="button"
                        class="comercios-boton comercios-boton-productos"
                        data-accion="productos"
                        data-id="${escaparHTML(comercio.id)}">
                        Ver productos
                    </button>

                    <button type="button"
                        class="comercios-accion comercios-accion-editar"
                        data-accion="editar"
                        data-id="${escaparHTML(comercio.id)}">
                        Editar
                    </button>

                    <button type="button"
                        class="comercios-accion comercios-accion-eliminar"
                        data-accion="eliminar"
                        data-id="${escaparHTML(comercio.id)}">
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const datosComercio = {
        nombre: nombreInput.value.trim(),
        nit: nitInput.value.trim(),
        telefono: telefonoInput.value.trim(),
        correo: correoInput.value.trim(),
        direccion: direccionInput.value.trim(),
        descripcion: descripcionInput.value.trim()
    };

    if (!datosComercio.nombre) {
        alert("El nombre del comercio es obligatorio.");
        nombreInput.focus();
        return;
    }

    let comerciosActualizados;

    if (comercioEditando !== null) {
        comerciosActualizados = comercios.map(comercio =>
            comercio.id === comercioEditando
                ? { ...comercio, ...datosComercio }
                : comercio
        );
    } else {
        const nuevoId = comercios.reduce(
            (mayor, comercio) => Math.max(mayor, Number(comercio.id) || 0),
            0
        ) + 1;

        comerciosActualizados = [
            ...comercios,
            { id: nuevoId, ...datosComercio }
        ];
    }

    const comerciosAnteriores = comercios;
    const estabaEditando = comercioEditando !== null;

    comercios = comerciosActualizados;

    if (!guardarComercios()) {
        comercios = comerciosAnteriores;
        return;
    }

    alert(
        estabaEditando
            ? "Comercio actualizado correctamente."
            : "Comercio registrado correctamente."
    );

    cancelarEdicion();
    listarComercios();
});

function editarComercio(id) {
    const comercio = comercios.find(
        comercio => Number(comercio.id) === id
    );

    if (!comercio) {
        alert("No se encontró el comercio seleccionado.");
        return;
    }

    comercioEditando = comercio.id;

    nombreInput.value = comercio.nombre || "";
    nitInput.value = comercio.nit || "";
    telefonoInput.value = comercio.telefono || "";
    correoInput.value = comercio.correo || "";
    direccionInput.value = comercio.direccion || "";
    descripcionInput.value = comercio.descripcion || "";

    tituloFormulario.textContent = "Editar comercio";
    botonCancelar.hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelarEdicion() {
    comercioEditando = null;
    formulario.reset();

    tituloFormulario.textContent = "Registrar comercio";
    botonCancelar.hidden = true;
}

function eliminarComercio(id) {
    const comercio = comercios.find(
        comercio => Number(comercio.id) === id
    );

    if (!comercio) {
        alert("No se encontró el comercio seleccionado.");
        return;
    }

    const tieneProductos = obtenerProductos().some(
        producto => Number(producto.comercioId) === id
    );

    if (tieneProductos) {
        alert(
            "Este comercio tiene productos asociados. " +
            "Elimina o reasigna primero sus productos para poder eliminarlo."
        );
        return;
    }

    if (!confirm(`¿Deseas eliminar el comercio "${comercio.nombre}"?`)) {
        return;
    }

    const comerciosAnteriores = comercios;
    comercios = comercios.filter(
        comercio => Number(comercio.id) !== id
    );

    if (!guardarComercios()) {
        comercios = comerciosAnteriores;
        return;
    }

    if (Number(comercioEditando) === id) {
        cancelarEdicion();
    }

    listarComercios();
}

// Lee los productos guardados por el módulo Productos.
function obtenerProductos() {
    try {
        const datos = localStorage.getItem("productos");
        const productos = datos ? JSON.parse(datos) : [];
        return Array.isArray(productos) ? productos : [];
    } catch (error) {
        console.error("Error al consultar los productos:", error);
        return [];
    }
}

tablaCuerpo.addEventListener("click", function(evento) {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton) return;

    const id = Number(boton.dataset.id);
    const accion = boton.dataset.accion;

    if (accion === "editar") {
        editarComercio(id);
    }

    if (accion === "eliminar") {
        eliminarComercio(id);
    }

    if (accion === "productos") {
        window.location.href = `./productos.html?comercioId=${encodeURIComponent(id)}`;
    }
});

busquedaInput.addEventListener("input", listarComercios);
botonCancelar.addEventListener("click", cancelarEdicion);

listarComercios();
