const SUPABASE_URL = "https://jivhgkrajycynjekpnaf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppdmhna3JhanljeW5qZWtwbmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjkwMDEsImV4cCI6MjA5NTA0NTAwMX0.Kc8o1SDDMJIa7WMTmlohIguuVyDEV-Cww6IV7-3Fw9w";
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const MOT_DE_PASSE_ADMIN = "Valentin-revalet1";

let monPseudo = localStorage.getItem("juicy_pseudo") || null;
let isAdmin = false;

// Vérifie si admin via l'URL
const params = new URLSearchParams(window.location.search);
if (params.get("admin") === MOT_DE_PASSE_ADMIN) {
isAdmin = true;
document.addEventListener("DOMContentLoaded", () => {
afficherBandeauAdmin();
});
}

function afficherBandeauAdmin() {
const bandeau = document.createElement("div");
bandeau.style.cssText = `
position: fixed;
top: 0;
left: 0;
width: 100%;
background: linear-gradient(90deg, #cc0000, #ff4444);
color: white;
text-align: center;
padding: 8px;
font-weight: bold;
font-size: 14px;
z-index: 9999;
letter-spacing: 1px;
`;
bandeau.textContent = "🔐 MODE ADMINISTRATEUR ACTIVÉ";
document.body.prepend(bandeau);
}

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

// Bouton retirer pour la propre personne
if (monPseudo && entry.pseudo === monPseudo) {
const btn = document.createElement("button");
btn.className = "btn-retirer";
btn.textContent = "✕ Retirer";
btn.onclick = () => quitterFile(entry.id);
li.appendChild(btn);
}

// Bouton admin pour supprimer n'importe qui
if (isAdmin) {
const btnAdmin = document.createElement("button");
btnAdmin.className = "btn-retirer";
btnAdmin.textContent = "🗑️ Supprimer";
btnAdmin.style.background = "rgba(255,0,0,0.2)";
btnAdmin.style.borderColor = "#ff0000";
btnAdmin.style.color = "#ff4444";
btnAdmin.style.marginLeft = "8px";
btnAdmin.onclick = () => supprimerAdmin(entry.id, entry.pseudo);
li.appendChild(btnAdmin);
}

liste.appendChild(li);
});
}

async function supprimerAdmin(id, pseudo) {
const confirmer = confirm(`❓ Supprimer "${pseudo}" de la file ?`);
if (!confirmer) return;
await db.from("file_attente").delete().eq("id", id);
chargerFile();
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

// ===== FAQ =====
const FAQ = [
{
question: "Qu'est-ce qu'un boost ?",
reponse: "Un boost est un service que l'on demandeà quelqu'un afin d'augmenter son rang, ses trophés ou ses prestiges (Dans Brawl Star). Concrètement, une personne plus expérimentée que vous joue sur votre compte pour atteindre l'objectif pour lequel vous avez payer. Le But est de gagner plus rapidement en progrssion et d'atteindre un niveau qui demanderait beaucoup plus de temps et d'efforts."
},
{
question: "Je n'ai pas PayPal, comment puis-je payer ?",
reponse: "Ne vous inquiétez pas, si vous ne possedez pas PayPal, plusieurs alternatives sont disponibles afin d'effectuer le paiement sans problème. Vous pouvez utiliser des éléments de Brawl Star comme moyen de paiement. Par exemple, vous pouvez utiliser un Brawl Pass normal ou plus ou bien encore de gemmes pour atteindre la valeur du boost. Ces objets virtuels peuvent être achetés ici: https://store.supercell.com"
},
{
question: "Comment puis-je être sûr de ne pas être « scam » ?",
reponse: "Pour un boost et peu importe la personne, on ne peut pas être sûr de ne pas être scam. C'est pourquoi nous misons tout sur le sérieux, la sincerité et la qualité du service. Pour l'instant 100% de nos clients sont satisfaits de nos services. On espere que ce texte vous aura rassuré."
},
{
question: "Combien de temps prend le boost avant d'être accompli ?",
reponse: "Le temps nécessaire dépend principalement de l'objectif demandé. Certains boosts peuvent être réalisés en quelques heures, tandis que d'autres demandent plus de temps selon le rang visé, le nombre de trophés à faire et la difficulté. Par exemple, un boost allant de mythique 1 à Légendaire 1 prend en général moins de 48h à être réalisé. Sachez que nous faisons tout notre possible pour réaliser les boosts le plus rapidement possible."
}
];

function ouvrirFaq(index) {
document.getElementById("faq-modal-question").textContent = FAQ[index].question;

const reponseElement = document.getElementById("faq-modal-reponse");

if (index === 1) {
reponseElement.innerHTML = `Ne vous inquiétez pas, à la place de l'argent, vous pouvez envoyer un Brawl Pass et le boost s'effectuera quand même. Vous pouvez acheter un Brawl Pass ici : <a href="https://store.supercell.com" target="_blank" style="color:#00cfff; text-decoration:underline;">store.supercell.com</a>`;
} else {
reponseElement.textContent = FAQ[index].reponse;
}

document.getElementById("faq-overlay").classList.add("actif");
}

function fermerFaq() {
document.getElementById("faq-overlay").classList.remove("actif");
}

