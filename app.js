const SUPABASE_URL = "https://jivhgkrajycynjekpnaf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5";
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

let monPseudo = localStorage.getItem("juicy_pseudo") || null;

async function chargerFile() {
const { data, error } = await db
.from("file_attente")
.select("*")
.order("created_at", { ascending: true });

const liste = document.getElementById("liste-file");

if (error) {
console.error("Erreur chargement:", error);
return;
}

liste.innerHTML = "";

if (!data || data.length === 0) {
liste.innerHTML = '<li id="liste-vide">Personne pour l\'instant...</li>';
return;
}

data.forEach((entry, index) => {
const li = document.createElement("li");

const rang = document.createElement("span");
rang.className = "rang";
rang.textContent = `#${index + 1}`;

const nom = document.createElement("span");
nom.className = "pseudo-nom";
nom.textContent = entry.pseudo;

li.appendChild(rang);
li.appendChild(nom);

if (monPseudo && entry.pseudo === monPseudo) {
const btn = document.createElement("button");
btn.className = "btn-retirer";
btn.textContent = "✕ Retirer";
btn.onclick = () => quitterFile(entry.id);
li.appendChild(btn);
}

liste.appendChild(li);
});
}

async function rejoindreFile() {
if (!monPseudo) {
const saisi = prompt("✏️ Entre ton pseudo Discord :");
if (!saisi || saisi.trim() === "") return;
monPseudo = saisi.trim();
localStorage.setItem("juicy_pseudo", monPseudo);
}

const { data: existant } = await db
.from("file_attente")
.select("id")
.eq("pseudo", monPseudo);

if (existant && existant.length > 0) {
alert("⚠️ Tu es déjà dans la file d'attente !");
return;
}

const { error } = await db
.from("file_attente")
.insert([{ pseudo: monPseudo }]);

if (error) {
alert("❌ Erreur lors de l'inscription. Réessaie.");
console.error(error);
return;
}

chargerFile();
}

async function quitterFile(id) {
const confirmer = confirm("❓ Tu veux vraiment te retirer de la file ?");
if (!confirmer) return;

await db.from("file_attente").delete().eq("id", id);
localStorage.removeItem("juicy_pseudo");
monPseudo = null;
chargerFile();
}

chargerFile();
setInterval(chargerFile, 5000);

