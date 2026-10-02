const toggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open', !expanded);
  });

  nav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }
  });
}

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const lightbox = document.querySelector('[data-lightbox]');
if (lightbox instanceof HTMLDialogElement) {
  const lightboxImage = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('[data-lightbox-caption]');

  document.querySelectorAll('[data-expand-image]').forEach((button) => {
    button.addEventListener('click', () => {
      const image = button.querySelector('img');
      if (!(image instanceof HTMLImageElement) || !(lightboxImage instanceof HTMLImageElement)) return;
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      if (lightboxCaption) lightboxCaption.textContent = button.getAttribute('data-caption') || image.alt;
      lightbox.showModal();
    });
  });

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
}
