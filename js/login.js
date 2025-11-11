// =============================
// CONFIG
// =============================
const API_BASE = "https://ondasbackend-production.up.railway.app";

// =============================
// UTIL: decodificar JWT (para ver expiración)
// =============================
function decodeJwt(token) {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}
function isTokenExpired(token) {
    const p = decodeJwt(token);
    if (!p || !p.exp) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return p.exp <= nowSec;
}

// =============================
// UI helpers
// =============================
function openLoginModal() {
    document.getElementById("loginModal")?.classList.remove("hidden");
}
function closeLoginModal() {
    document.getElementById("loginModal")?.classList.add("hidden");
}

function renderAuthUI() {
    const hasToken = !!sessionStorage.getItem("token");
    document.getElementById("btnLogin")?.classList.toggle("hidden", hasToken);
    document.getElementById("btnLogout")?.classList.toggle("hidden", !hasToken);
    document.getElementById("whoami")?.classList.toggle("hidden", !hasToken);
    const name = sessionStorage.getItem("username") || "";
    const who = document.getElementById("whoamiName");
    if (who) who.textContent = name;
}

function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    renderAuthUI();
    alert("Sesión cerrada");
}

// =============================
// EXTRA: envoltorio fetch con token (añade Authorization automáticamente)
// =============================
async function apiFetch(path, options = {}) {
    const token = sessionStorage.getItem("token");
    const headers = new Headers(options.headers || {});
    if (token && !isTokenExpired(token)) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    const resp = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (resp.status === 401) {
        // token inválido/expirado o falta
        logout();
        throw new Error("No autorizado (401)");
    }
    return resp;
}

// =============================
// PASO 1: LOGIN (guía)  -> guarda token en sessionStorage
// =============================
async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
        const resp = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!resp.ok) throw new Error("Credenciales inválidas o error en el servidor");

        const data = await resp.json();
        if (!data.token) throw new Error("Respuesta sin token");

        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("username", data.username || username);

        alert("Inicio de sesión exitoso");
        closeLoginModal();
        renderAuthUI();

    } catch (e) {
        console.error("Error al iniciar sesión:", e);
        alert("No fue posible iniciar sesión");
    }
}

// =============================
// PASO 2: CONSUMIR RUTA PROTEGIDA (guía)
// =============================
async function cargarUsuarios() {
    try {
        const list = document.getElementById("userList");
        if (list) list.innerHTML = "";

        // Usa tu endpoint protegido real. Aquí un ejemplo de prueba:
        const resp = await apiFetch("/api/admin/prueba", { method: "GET" });
        const data = await resp.json();

        console.log("Respuesta protegida:", data);
        if (list) {
            const li = document.createElement("li");
            li.textContent = typeof data === "string" ? data : JSON.stringify(data);
            list.appendChild(li);
        }
        alert("Petición protegida exitosa (revisa consola).");
    } catch (e) {
        console.error("Error al cargar datos protegidos:", e);
        alert("Error al conectar con el servidor o no autorizado.");
    }
}

// =============================
// INICIALIZACIÓN
// =============================
document.addEventListener("DOMContentLoaded", () => {
    // Botones principales
    document.getElementById("btnLogin")?.addEventListener("click", openLoginModal);
    document.getElementById("btnLogout")?.addEventListener("click", logout);
    document.getElementById("btnProbar")?.addEventListener("click", cargarUsuarios);

    // Modal
    document.getElementById("btnClose")?.addEventListener("click", closeLoginModal);
    const form = document.getElementById("loginForm");
    form?.addEventListener("submit", (e) => { e.preventDefault(); login(); });

    // Estado inicial (si ya hay token)
    renderAuthUI();
});
