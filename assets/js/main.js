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

const heroMotion = document.querySelector('[data-hero-motion]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

if (heroMotion instanceof HTMLCanvasElement && !reduceMotion.matches && finePointer.matches) {
  const hero = heroMotion.closest('.hero');
  const context = heroMotion.getContext('2d');

  if (hero instanceof HTMLElement && context) {
    let width = 0;
    let height = 0;
    let lastPoint = null;
    let animationFrame = 0;
    let particleCount = 0;
    let particles = [];

    const resizeCanvas = () => {
      const bounds = hero.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      heroMotion.width = Math.round(width * pixelRatio);
      heroMotion.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const drawParticle = (particle, now) => {
      const progress = Math.min((now - particle.createdAt) / particle.life, 1);
      const alpha = Math.pow(1 - progress, 1.7) * 0.72;
      const isLightArea = particle.y < height * 0.57;
      const color = isLightArea
        ? `rgba(55, 29, 20, ${alpha * 0.72})`
        : `rgba(255, 239, 211, ${alpha})`;

      context.save();
      context.translate(particle.x, particle.y - progress * 7);
      context.rotate(particle.angle);
      context.lineWidth = 1.25;
      context.strokeStyle = color;
      context.fillStyle = color;

      if (particle.isDot) {
        context.beginPath();
        context.arc(0, 0, 1.6, 0, Math.PI * 2);
        context.fill();
      } else {
        context.beginPath();
        context.moveTo(-3.5, -4.2);
        context.lineTo(2.2, 0);
        context.lineTo(-3.5, 4.2);
        context.stroke();
      }

      context.restore();
    };

    const renderTrail = (now) => {
      animationFrame = 0;
      context.clearRect(0, 0, width, height);
      particles = particles.filter((particle) => now - particle.createdAt < particle.life);
      particles.forEach((particle) => drawParticle(particle, now));
      if (particles.length) animationFrame = window.requestAnimationFrame(renderTrail);
    };

    const requestTrailFrame = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(renderTrail);
    };

    hero.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const bounds = hero.getBoundingClientRect();
      const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };

      if (!lastPoint) {
        lastPoint = point;
        return;
      }

      const deltaX = point.x - lastPoint.x;
      const deltaY = point.y - lastPoint.y;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance < 8) return;

      const steps = Math.min(Math.max(Math.floor(distance / 11), 1), 10);
      const angle = Math.atan2(deltaY, deltaX);

      for (let step = 1; step <= steps; step += 1) {
        const ratio = step / steps;
        particleCount += 1;
        particles.push({
          x: lastPoint.x + deltaX * ratio,
          y: lastPoint.y + deltaY * ratio,
          angle,
          createdAt: performance.now(),
          life: 760 + Math.random() * 360,
          isDot: particleCount % 6 === 0,
        });
      }

      if (particles.length > 140) particles.splice(0, particles.length - 140);
      lastPoint = point;
      requestTrailFrame();
    });

    hero.addEventListener('pointerleave', () => {
      lastPoint = null;
    });

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(hero);
    resizeCanvas();
  }
}
