const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
function iniciarSesion() {
  const correo = document.getElementById("correo").value.trim();
  const password = document.getElementById("password").value;
  if (correo === "" || password === "") {
    document.getElementById("mensaje").innerText =
      "Debe ingresar correo y contraseña.";
    return;
  }
  const usuarioEncontrado = usuarios.find(
    (usuario) => usuario.correo === correo && usuario.password === password,
  );
  if (!usuarioEncontrado) {
    document.getElementById("mensaje").innerText =
      "Correo o contraseña incorrectos.";
    return;
  }
  if (usuarioEncontrado.estado !== "Activo") {
    document.getElementById("mensaje").innerText = "El usuario está inactivo.";
    return;
  }
  localStorage.setItem("usuarioSesion", JSON.stringify(usuarioEncontrado));
  window.location.href = "dashboard.html";
}
