// Portfolio interactions only. Page text and project details live in index.html.

const $ = s => document.querySelector(s);
let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches,
  seconds = 0; // Memory Cam: toggle animation and synchronize playback labels.
function setPlay() {
  $('#play').innerHTML = playing ? 'Ⅱ <span>PAUSE</span>' : '▶ <span>PLAY</span>';
  $('#play').setAttribute('aria-label', playing ? 'Pause memory playback' : 'Play memory');
  $('#viewfinder').classList.toggle('paused', !playing);
  $('#record-status').innerHTML = playing ? '<b>●</b> REC' : 'Ⅱ PAUSE'
}
setPlay();
$('#play').onclick = () => {
  playing = !playing;
  setPlay()
}; // Advance the on-screen timer only while playback is active.
setInterval(() => {
  if (playing) {
    seconds++;
    $('#timecode').textContent = new Date(seconds * 1000).toISOString().slice(11, 19)
  }
}, 1000); // Shared brief feedback message.
let toastTimer;

function toast(t) {
  $('#toast').textContent = t;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3000)
} // Capture effect is visual only; it does not save a photo.
$('#capture').onclick = () => {
  const flash = $('#flash');
  flash.classList.remove('snap');
  void flash.offsetWidth;
  flash.classList.add('snap');
  toast('A little moment, captured. ♡')
};
// Project modal: read content from HTML templates rather than duplicating it here.
const dialog = $('#detail');
document.querySelectorAll('[data-project]').forEach(button => button.onclick = () => {
  const template = document.querySelector('#project-detail-' + button.dataset.project);
  const content = template.content;
  $('#dialog-label').textContent = content.querySelector('.project-detail-stack').textContent;
  $('#dialog-title').textContent = content.querySelector('.project-detail-title').textContent;
  $('#dialog-text').textContent = content.querySelector('.project-detail-description').textContent;
  dialog.showModal()
});
$('.close').onclick = () => dialog.close();
dialog.onclick = e => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close()
  }
};
// Demo form: validate, animate, then clear fields after completion.
const contactForm = $('#contact-form');
let sending = false;
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  if (sending || !contactForm.reportValidity()) return;
  const name = $('#sender-name').value.trim();
  const message = $('#message').value.trim();
  if (!name || !message) {
    $('#form-status').textContent = 'Please enter your name and message.';
    (!name ? $('#sender-name') : $('#message')).focus();
    return;
  }
  sending = true;
  const button = contactForm.querySelector('button[type="submit"]');
  button.disabled = true;
  button.classList.add('sending');
  button.innerHTML = 'Sending <span class="send-spinner" aria-hidden="true"></span>';
  contactForm.setAttribute('aria-busy', 'true');
  $('#form-status').textContent = '';
  setTimeout(() => {
    button.classList.remove('sending');
    button.classList.add('sent');
    button.innerHTML = 'Sent <span class="send-check" aria-hidden="true">✓</span>';
    contactForm.removeAttribute('aria-busy');
    contactForm.reset();
    $('#form-status').textContent = 'Demo complete.';
    setTimeout(() => {
      button.classList.remove('sent');
      button.innerHTML = 'Send <span aria-hidden="true">↗</span>';
      button.disabled = false;
      sending = false;
      $('#form-status').textContent = '';
    }, 2500);
  }, 900);
});

// Keep anchor offsets accurate when the navigation wraps or text is enlarged.
const siteHeader = document.querySelector('header');
const sectionLinks = [...document.querySelectorAll('nav a')];
const pageSections = [...document.querySelectorAll('main > section')];
let sectionTick = false;

function updateCurrentSection() {
  const boundary = siteHeader.getBoundingClientRect().height + Math.min(innerHeight * .25, 180);
  let current = pageSections[0];
  for (const section of pageSections) {
    if (section.getBoundingClientRect().top <= boundary) current = section
  }
  for (const link of sectionLinks) {
    if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current')
  }
  sectionTick = false;
}
// Keep section anchors clear of the sticky navbar, including on mobile.
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--nav-height', siteHeader.getBoundingClientRect().height + 'px');
  updateCurrentSection()
}).observe(siteHeader);
addEventListener('scroll', () => {
  if (!sectionTick) {
    sectionTick = true;
    requestAnimationFrame(updateCurrentSection)
  }
}, {
  passive: true
});
updateCurrentSection();
