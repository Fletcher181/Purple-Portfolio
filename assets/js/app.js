const $ = (selector) => document.querySelector(selector);

// Memory Cam playback and timer.
let playing = !matchMedia("(prefers-reduced-motion: reduce)").matches;
let seconds = 0;

function setPlay() {
  $("#play").innerHTML = playing
    ? 'Ⅱ <span>PAUSE</span>'
    : '▶ <span>PLAY</span>';

  $("#play").setAttribute(
    "aria-label",
    playing ? "Pause memory playback" : "Play memory"
  );

  $("#viewfinder").classList.toggle("paused", !playing);
  $("#record-status").innerHTML = playing
    ? "<b>●</b> REC"
    : "Ⅱ PAUSE";
}

setPlay();

$("#play").onclick = () => {
  playing = !playing;
  setPlay();
};

setInterval(() => {
  if (playing) {
    seconds++;
    $("#timecode").textContent = new Date(seconds * 1000)
      .toISOString()
      .slice(11, 19);
  }
}, 1000);

// Shared feedback message.
let toastTimer;

function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    $("#toast").classList.remove("show");
  }, 3000);
}

// Camera capture animation.
$("#capture").onclick = () => {
  const flash = $("#flash");

  flash.classList.remove("snap");
  void flash.offsetWidth;
  flash.classList.add("snap");

  toast("A little moment, captured. ♡");
};

// Project cards open their GitHub links in the same tab.
document.querySelectorAll("[data-project]").forEach((button) => {
  button.onclick = () => {
    const template = document.querySelector(
      "#project-detail-" + button.dataset.project
    );

    const url = template?.dataset.githubUrl?.trim();

    if (!url) {
      toast("GitHub link not added yet.");
      return;
    }

    try {
      const destination = new URL(url);

      if (destination.protocol !== "https:") {
        toast("Please add a valid HTTPS GitHub link.");
        return;
      }

      window.location.assign(destination.href);
    } catch {
      toast("Please check this project's GitHub link.");
    }
  };
});

// Contact form demo: validate, animate, and clear inputs.
// This does not deliver an actual message.
const contactForm = $("#contact-form");
let sending = false;

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (sending || !contactForm.reportValidity()) return;

  const name = $("#sender-name").value.trim();
  const message = $("#message").value.trim();

  if (!name || !message) {
    $("#form-status").textContent =
      "Please enter your name and message.";

    (!name ? $("#sender-name") : $("#message")).focus();
    return;
  }

  sending = true;

  const button = contactForm.querySelector('button[type="submit"]');

  button.disabled = true;
  button.classList.add("sending");
  button.innerHTML =
    'Sending <span class="send-spinner" aria-hidden="true"></span>';

  contactForm.setAttribute("aria-busy", "true");
  $("#form-status").textContent = "";

  setTimeout(() => {
    button.classList.remove("sending");
    button.classList.add("sent");
    button.innerHTML =
      'Sent <span class="send-check" aria-hidden="true">✓</span>';

    contactForm.removeAttribute("aria-busy");
    contactForm.reset();
    $("#form-status").textContent = "Demo complete.";

    setTimeout(() => {
      button.classList.remove("sent");
      button.innerHTML = 'Send <span aria-hidden="true">↗</span>';
      button.disabled = false;

      sending = false;
      $("#form-status").textContent = "";
    }, 2500);
  }, 900);
});

// Highlight the current section in the navbar.
const siteHeader = document.querySelector("header");
const sectionLinks = [...document.querySelectorAll("nav a")];
const pageSections = [...document.querySelectorAll("main > section")];

let sectionTick = false;

function updateCurrentSection() {
  const boundary =
    siteHeader.getBoundingClientRect().height +
    Math.min(innerHeight * 0.25, 180);

  let current = pageSections[0];

  for (const section of pageSections) {
    if (section.getBoundingClientRect().top <= boundary) {
      current = section;
    }
  }

  for (const link of sectionLinks) {
    if (link.hash === "#" + current.id) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  }

  sectionTick = false;
}

// Keep section headings clear of the sticky navbar.
new ResizeObserver(() => {
  document.documentElement.style.setProperty(
    "--nav-height",
    siteHeader.getBoundingClientRect().height + "px"
  );

  updateCurrentSection();
}).observe(siteHeader);

addEventListener(
  "scroll",
  () => {
    if (!sectionTick) {
      sectionTick = true;
      requestAnimationFrame(updateCurrentSection);
    }
  },
  { passive: true }
);

updateCurrentSection();