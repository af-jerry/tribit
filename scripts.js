
// ── NAV ──
const menuToggle = document.getElementById("menuToggle");
const navMenu    = document.getElementById("navMenu");
const navEl      = document.querySelector(".nav");
const navLinks   = Array.from(navMenu.querySelectorAll("a"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function closeMenu() { navMenu.classList.remove("active"); menuToggle.classList.remove("active"); menuToggle.setAttribute("aria-expanded","false"); }
function openMenu()  { navMenu.classList.add("active");    menuToggle.classList.add("active");    menuToggle.setAttribute("aria-expanded","true"); }

menuToggle.addEventListener("click", e => { e.stopPropagation(); navMenu.classList.contains("active") ? closeMenu() : openMenu(); });
document.addEventListener("click", e => { if (!navEl.contains(e.target)) closeMenu(); });
navLinks.forEach(l => l.addEventListener("click", closeMenu));
window.addEventListener("scroll", () => {
  closeMenu();
  navEl.style.boxShadow = window.scrollY > 60 ? "0 4px 32px rgba(15,13,46,0.12)" : "";
});

// ── THEME ──
const themeToggle = document.getElementById("themeToggle");
const themeIcon   = themeToggle.querySelector("i");
const storedTheme = localStorage.getItem("tribo-theme");
if (storedTheme === "dark") document.body.dataset.theme = "dark";

function syncThemeIcon() {
  const isDark = document.body.dataset.theme === "dark";
  themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
}
syncThemeIcon();

themeToggle.addEventListener("click", () => {
  const next = document.body.dataset.theme === "dark" ? "light" : "dark";
  if (next === "light") { delete document.body.dataset.theme; } else { document.body.dataset.theme = "dark"; }
  localStorage.setItem("tribo-theme", next);
  syncThemeIcon();
});

// ── SCROLL TO TOP ──
const scrollTopBtn = document.getElementById("scrollTop");
window.addEventListener("scroll", () => scrollTopBtn.classList.toggle("show", window.scrollY > 280));
scrollTopBtn.addEventListener("click", e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" }); });

// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll(".reveal");
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("active"); revealObs.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
reveals.forEach(el => { if (!el.classList.contains("active")) revealObs.observe(el); });

// ── ACTIVE NAV SECTION ──
const sections = navLinks.map(l => document.querySelector(l.getAttribute("href"))).filter(Boolean);
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${e.target.id}`));
  });
}, { threshold: 0.35, rootMargin: "-20% 0px -60% 0px" });
sections.forEach(s => { if (s) sectionObs.observe(s); });

// ── CONTACT FORM ──
document.addEventListener("DOMContentLoaded", () => { if (window.emailjs) emailjs.init("56lpZsf4NHQPJRcyk"); });

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  const nameInput    = document.getElementById("name");
  const emailInput   = document.getElementById("email");
  const companyInput = document.getElementById("company");
  const phoneInput   = document.getElementById("phone");
  const subjectInput = document.getElementById("subject");
  const messageInput = document.getElementById("message");
  const consentInput = document.getElementById("consent");
  const submitBtn    = contactForm.querySelector("button[type='submit']");
  const formStatus   = document.createElement("div");
  formStatus.id = "formStatus"; formStatus.setAttribute("aria-live","polite");
  contactForm.appendChild(formStatus);

  const showError = i => { i.classList.add("invalid"); i.classList.remove("valid"); };
  const showOk    = i => { i.classList.add("valid");   i.classList.remove("invalid"); };

  const validateName    = () => { if (nameInput.value.trim().length < 2)         { showError(nameInput);    return false; } showOk(nameInput);    return true; };
  const validateEmail   = () => { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) { showError(emailInput);   return false; } showOk(emailInput);   return true; };
  const validateMessage = () => { if (messageInput.value.trim().length < 10)     { showError(messageInput); return false; } showOk(messageInput); return true; };
  const validateSubject = () => { if (!subjectInput.value.trim())                { showError(subjectInput); return false; } showOk(subjectInput); return true; };
  const validateConsent = () => { if (!consentInput.checked)                     { showError(consentInput); return false; } showOk(consentInput); return true; };

  nameInput.addEventListener("blur",    validateName);
  emailInput.addEventListener("blur",   validateEmail);
  messageInput.addEventListener("blur", validateMessage);
  subjectInput.addEventListener("change", validateSubject);
  consentInput.addEventListener("change", validateConsent);

  contactForm.addEventListener("submit", e => {
    e.preventDefault();
    if (!(validateName() && validateEmail() && validateMessage() && validateSubject() && validateConsent())) {
      formStatus.textContent = "Please fix the highlighted fields."; formStatus.className = "error"; return;
    }
    submitBtn.classList.add("loading"); submitBtn.disabled = true;
    formStatus.textContent = "Sending your project details..."; formStatus.className = "";

    if (!window.emailjs) {
      formStatus.textContent = "Email service unavailable. Please try again later."; formStatus.className = "error";
      submitBtn.classList.remove("loading"); submitBtn.disabled = false; return;
    }

    emailjs.send("service_043kh2v", "template_hu3un3p", {
      from_name: nameInput.value.trim(), from_email: emailInput.value.trim(),
      company: companyInput.value.trim() || "Not provided", phone: phoneInput.value.trim() || "Not provided",
      project_type: subjectInput.value, message: messageInput.value.trim(), to_email: "hello@tribo.app"
    }).then(() => {
      formStatus.textContent = "✓ Thank you! We received your project details. We will contact you within 24 hours.";
      formStatus.className = "success"; contactForm.reset();
      contactForm.querySelectorAll(".valid").forEach(el => el.classList.remove("valid"));
      setTimeout(() => { formStatus.textContent = ""; formStatus.className = ""; }, 6000);
    }).catch(err => {
      console.error(err);
      formStatus.textContent = "Failed to send. Please email us directly at hello@tribo.app";
      formStatus.className = "error";
    }).finally(() => { submitBtn.classList.remove("loading"); submitBtn.disabled = false; });
  });
}

// ── FAQ ──
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach(item => {
  item.querySelector(".faq-header").addEventListener("click", () => {
    const wasOpen = item.classList.contains("faq-open");
    faqItems.forEach(i => i.classList.remove("faq-open"));
    if (!wasOpen) item.classList.add("faq-open");
  });
});

// ── NEWSLETTER ──
const newsletterForm = document.getElementById("newsletterForm");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", e => {
    e.preventDefault();
    const inp = newsletterForm.querySelector("input[type='email']");
    const btn = newsletterForm.querySelector("button");
    if (!inp.value.trim()) return;
    const orig = btn.innerHTML; btn.innerHTML = '<i class="fas fa-check"></i>'; btn.disabled = true;
    setTimeout(() => { inp.value = ""; btn.innerHTML = orig; btn.disabled = false; }, 2000);
  });
}

// ── SMOOTH SCROLL ──
document.addEventListener("click", e => {
  const link = e.target.closest("a[href^='#']");
  if (link) {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" }); }
  }
});

// ── SCROLL RESTORATION ──
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
function resetToTop() {
  if (window.location.hash) history.replaceState(null,"", window.location.pathname + window.location.search);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}
window.addEventListener("load", resetToTop);
window.addEventListener("pageshow", resetToTop);

// ── ACCESSIBILITY ──
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeMenu(); faqItems.forEach(i => i.classList.remove("faq-open")); }
});

console.log("Tribo — Built from friction 🚀");