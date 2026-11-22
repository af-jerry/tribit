
// ── NAV ──
const menuToggle = document.getElementById("menuToggle");
const navMenu    = document.getElementById("navMenu");
const navEl      = document.querySelector(".nav");
const navLinks   = Array.from(navMenu.querySelectorAll("a"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function openMenu() {
  navMenu.classList.add("active");
  menuToggle.classList.add("active");
  menuToggle.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  navMenu.classList.remove("active");
  menuToggle.classList.remove("active");
  menuToggle.setAttribute("aria-expanded", "false");
}

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
try {
  if (localStorage.getItem("tribo-theme") === "dark") document.body.dataset.theme = "dark";
} catch {
  // The page can still run when browser storage is restricted.
}

function syncThemeIcon() {
  const isDark = document.body.dataset.theme === "dark";
  themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
}
syncThemeIcon();

themeToggle.addEventListener("click", () => {
  const next = document.body.dataset.theme === "dark" ? "light" : "dark";
  if (next === "light") { delete document.body.dataset.theme; } else { document.body.dataset.theme = "dark"; }
  try {
    localStorage.setItem("tribo-theme", next);
  } catch {
    // The selected theme still applies to the current page.
  }
  syncThemeIcon();
});

// ── SCROLL TO TOP ──
const scrollTopBtn = document.getElementById("scrollTop");
window.addEventListener("scroll", () => scrollTopBtn.classList.toggle("show", window.scrollY > 280));
scrollTopBtn.addEventListener("click", e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" }); });

// ── SCROLL REVEAL ──

document.documentElement.classList.add("js");
const reveals = document.querySelectorAll(".reveal");

const showAllReveals = () => {
  reveals.forEach((element) => {
    element.classList.add("active");
  });
};

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// Show content immediately if animations are disabled
// or IntersectionObserver is unavailable.
if (reducedMotion || !("IntersectionObserver" in window)) {
  showAllReveals();
} else {
  try {
    const revealObs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    reveals.forEach((element) => {
      if (!element.classList.contains("active")) {
        revealObs.observe(element);
      }
    });

  } catch (error) {
    console.error("Scroll reveal error:", error);
    showAllReveals();
  }
}

// ── ACTIVE NAV SECTION ──
const sections = navLinks
  .map(link => link.getAttribute("href"))
  .filter(href => href && href.startsWith("#"))
  .map(href => document.querySelector(href))
  .filter(Boolean);
if (sections.length && "IntersectionObserver" in window) {
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${e.target.id}`));
    });
  }, { threshold: 0.35, rootMargin: "-20% 0px -60% 0px" });
  sections.forEach(section => sectionObs.observe(section));
}

// ── CONTACT FORM ──

/* ============================================
   TRIBIT — CONTACT FORM & EMAILJS
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const companyInput = document.getElementById("company");
  const phoneInput = document.getElementById("phone");
  const subjectInput = document.getElementById("subject");
  const messageInput = document.getElementById("message");
  const submitBtn = contactForm.querySelector(
    "button[type='submit']"
  );

  const formStatus = document.createElement("div");
  formStatus.id = "formStatus";
  formStatus.setAttribute("role", "status");
  formStatus.setAttribute("aria-live", "polite");
  contactForm.appendChild(formStatus);

  // Disable submission until the form is ready.
  submitBtn.disabled = true;

  const showError = (input) => {
    input.classList.add("invalid");
    input.classList.remove("valid");
  };

  const showOk = (input) => {
    input.classList.add("valid");
    input.classList.remove("invalid");
  };

  const validateName = () => {
    if (nameInput.value.trim().length < 2) {
      showError(nameInput);
      return false;
    }
    showOk(nameInput);
    return true;
  };

  const validateEmail = () => {
    const email = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(emailInput);
      return false;
    }
    showOk(emailInput);
    return true;
  };

  const validateMessage = () => {
    if (messageInput.value.trim().length < 10) {
      showError(messageInput);
      return false;
    }
    showOk(messageInput);
    return true;
  };

  const validateSubject = () => {
    if (!subjectInput.value.trim()) {
      showError(subjectInput);
      return false;
    }
    showOk(subjectInput);
    return true;
  };

  nameInput.addEventListener("blur", validateName);
  emailInput.addEventListener("blur", validateEmail);
  messageInput.addEventListener("blur", validateMessage);
  subjectInput.addEventListener(
    "change",
    validateSubject
  );

  // Prevent native form submission, including
  // programmatic submissions that dispatch this event.
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (submitBtn.disabled) return;

    const valid = [
      validateName(),
      validateEmail(),
      validateSubject(),
      validateMessage()
    ].every(Boolean);

    if (!valid) {
      formStatus.textContent =
        "Please fix the highlighted fields.";
      formStatus.className = "error";
      return;
    }

    if (!window.emailjs) {
      formStatus.textContent =
        "Email service unavailable. Please email hello@tribit.dev.";
      formStatus.className = "error";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    formStatus.textContent =
      "Sending your project details...";
    formStatus.className = "";

    try {

await window.emailjs.send(
  "service_zbw7dby",
  "template_ei4jkjn",
  {
    // Client information
    from_name: nameInput.value.trim(),
    from_email: emailInput.value.trim(),

    // Required for the notification Reply-To
    // and the customer's automatic reply
    reply_to: emailInput.value.trim(),

    // Optional client information
    company: companyInput.value.trim() || "Not provided",
    phone: phoneInput.value.trim() || "Not provided",

    // Readable project type
    project_type:
      subjectInput.options[
        subjectInput.selectedIndex
      ].text,

    // Project description
    message: messageInput.value.trim(),

    // Tribit's business inbox
    to_email: "hello@tribit.dev"
  }
);


      formStatus.textContent =
        "✓ Thank you! Your project details were submitted successfully. We will contact you within 24 hours.";
      formStatus.className = "success";

      contactForm.reset();

      contactForm.querySelectorAll(".valid").forEach(
        (element) => element.classList.remove("valid")
      );

    } catch (error) {
      console.error("Contact form submission failed:", error);

      formStatus.textContent =
        "Failed to send your message. Please email us directly at hello@tribit.dev.";
      formStatus.className = "error";

    } finally {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  });

  // Initialize EmailJS only after the handler exists.
  if (window.emailjs) {
    try {
      // The v3 SDK loaded by contact.html expects the public key as a string.
      window.emailjs.init("56lpZsf4NHQPJRcyk");

      submitBtn.disabled = false;
    } catch (error) {
      console.error("EmailJS initialization failed:", error);
      formStatus.textContent =
        "The contact form is temporarily unavailable. Please email hello@tribit.dev.";
      formStatus.className = "error";
    }
  } else {
    formStatus.textContent =
      "The contact form is temporarily unavailable. Please email hello@tribit.dev.";
    formStatus.className = "error";
  }
});


// ── FAQ ──

/* ==========================================
   TRIBIT — ACCESSIBLE FAQ ACCORDION
   ========================================== */

const faqItems = document.querySelectorAll(".faq-item");

function setFaqState(item, isOpen) {
  const button = item.querySelector(".faq-header");
  const content = item.querySelector(".faq-content");

  item.classList.toggle("faq-open", isOpen);
  button.setAttribute("aria-expanded", String(isOpen));

  // Keep collapsed answers out of keyboard navigation
  // and the accessibility tree.
  content.inert = !isOpen;
}

faqItems.forEach((item, index) => {
  const button = item.querySelector(".faq-header");
  const content = item.querySelector(".faq-content");

  const contentId = `faq-answer-${index + 1}`;
  content.id = contentId;

  button.setAttribute("type", "button");
  button.setAttribute("aria-controls", contentId);

  setFaqState(item, item.classList.contains("faq-open"));

  button.addEventListener("click", () => {
    const wasOpen = item.classList.contains("faq-open");

    faqItems.forEach((faq) => {
      setFaqState(faq, false);
    });

    if (!wasOpen) {
      setFaqState(item, true);
    }
  });
});


// ── SMOOTH SCROLL ──
document.addEventListener("click", e => {
  const link = e.target.closest("a[href^='#']");
  if (link) {
    const target = document.getElementById(link.hash.slice(1));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" }); }
  }
});

// ── SCROLL RESTORATION ──
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
function resetToTop() {
  if (window.location.hash && !document.getElementById(window.location.hash.slice(1))) {
    history.replaceState(null,"", window.location.pathname + window.location.search);
  }
  if (window.location.hash) return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}
window.addEventListener("load", resetToTop);
window.addEventListener("pageshow", resetToTop);

// ── ACCESSIBILITY ──
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (navMenu.classList.contains("active") && navMenu.contains(document.activeElement)) {
      menuToggle.focus();
    }
    closeMenu();

    faqItems.forEach((item) => {
      setFaqState(item, false);
    });
  }
});

console.log("Tribo — Built from friction 🚀");