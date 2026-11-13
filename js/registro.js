let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
function registrarUsuario() {
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const password = document.getElementById("password").value;
  const rol = document.getElementById("rol").value;
  if (
    nombre === "" ||
    apellido === "" ||
    correo === "" ||
    password === "" ||
    rol === ""
  ) {
    document.getElementById("mensaje").innerText =
      "Todos los campos son obligatorios.";
    return;
  }
  const correoExiste = usuarios.some((usuario) => usuario.correo === correo);
  if (correoExiste) {
    document.getElementById("mensaje").innerText =
      "El correo ya está registrado.";
    return;
  }
  const nuevoUsuario = {
    id: usuarios.length + 1,
    nombre: nombre,
    apellido: apellido,
    correo: correo,
    password: password,
    rol: rol,
    estado: "Activo",
  };
  usuarios.push(nuevoUsuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  document.getElementById("mensaje").innerText =
    "Usuario registrado correctamente.";
  setTimeout(function () {
    window.location.href = "login.html";
  }, 2000);
}
