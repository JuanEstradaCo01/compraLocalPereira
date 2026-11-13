const usuarioSesion = JSON.parse(localStorage.getItem("usuarioSesion"));
if (!usuarioSesion) {
  window.location.href = "login.html";
}
document.getElementById("bienvenida").innerText =
  "Bienvenido " + usuarioSesion.nombre + " " + usuarioSesion.apellido;
document.getElementById("rolUsuario").innerText = "Rol: " + usuarioSesion.rol;
function cerrarSesion() {
  localStorage.removeItem("usuarioSesion");
  window.location.href = "login.html";
}
