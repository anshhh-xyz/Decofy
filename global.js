

class DockNavbar {
  constructor(options = {}) {
    this.container = options.container || null;
    this.baseItemSize = options.baseItemSize || 40;
    this.magnification = options.magnification || 54;
    this.distance = options.distance || 140;
    this.panelHeight = options.panelHeight || 48;
    this.items = options.items || [];

    this.panel = null;
    this.dockItems = [];
    this.mouseX = Infinity;
    this.isHovered = false;

    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const panel = document.createElement('div');
    panel.className = 'dock-panel';
    panel.setAttribute('role', 'toolbar');
    panel.setAttribute('aria-label', 'Application dock');
    this.panel = panel;

    this.items.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = `dock-item ${item.className || ''}`;
      itemEl.setAttribute('role', 'button');
      itemEl.setAttribute('tabindex', '0');
      itemEl.setAttribute('aria-label', item.label);
      itemEl.style.width = `${this.baseItemSize}px`;
      itemEl.style.height = `${this.baseItemSize}px`;

      itemEl.innerHTML = `
        <div class="dock-icon">${item.icon}</div>
        <div class="dock-label" role="tooltip">${item.label}</div>
      `;

      itemEl.addEventListener('click', (e) => {
        if (item.onClick) item.onClick(e);
        else if (item.href) {
          if (item.href.startsWith('#')) {
            const target = document.querySelector(item.href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.location.href = item.href;
          }
        }
      });

      itemEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          itemEl.click();
        }
      });

      this.dockItems.push({
        el: itemEl,
        currentSize: this.baseItemSize,
        targetSize: this.baseItemSize
      });

      panel.appendChild(itemEl);
    });

    this.container.appendChild(panel);

    panel.addEventListener('mousemove', (e) => {
      this.isHovered = true;
      this.mouseX = e.clientX;
      this.startAnimation();
    });

    panel.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.startAnimation();
    });

    panel.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.mouseX = Infinity;
      this.startAnimation();
    });

    this.startAnimation();
  }

  startAnimation = () => {
    if (!this.animating) {
      this.animating = true;
      requestAnimationFrame(this.animate);
    }
  }

  animate = () => {
    if (!this.animating) return;

    if (this.panel && this.panel.offsetParent === null) {
      this.animating = false;
      return;
    }

    let needsNextFrame = this.isHovered;

    this.dockItems.forEach(itemData => {
      const rect = itemData.el.getBoundingClientRect();
      const itemCenterX = rect.left + rect.width / 2;

      let target = this.baseItemSize;

      if (this.isHovered && this.mouseX !== Infinity) {
        const dist = Math.abs(this.mouseX - itemCenterX);
        if (dist < this.distance) {
          const normDist = dist / this.distance;
          const factor = Math.cos(normDist * (Math.PI / 2));
          target = this.baseItemSize + (this.magnification - this.baseItemSize) * factor;
        }
      }

      itemData.targetSize = target;
      const diff = itemData.targetSize - itemData.currentSize;

      if (Math.abs(diff) > 0.05) {
        itemData.currentSize += diff * 0.22;
        needsNextFrame = true;
      } else {
        itemData.currentSize = itemData.targetSize;
      }

      itemData.el.style.width = `${itemData.currentSize.toFixed(2)}px`;
      itemData.el.style.height = `${itemData.currentSize.toFixed(2)}px`;
    });

    if (needsNextFrame) {
      requestAnimationFrame(this.animate);
    } else {
      this.animating = false;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {

  const navbar = document.getElementById('navbar');
  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.add('open');
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (mobileClose && mobileMenu && hamburger) {
    mobileClose.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      if (hamburger && mobileMenu) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  const revealElements = document.querySelectorAll('.reveal, .reveal-line');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  const dockContainer = document.getElementById('navbarDock');
  if (dockContainer) {
    new DockNavbar({
      container: dockContainer,
      baseItemSize: 40,
      magnification: 54,
      distance: 140,
      panelHeight: 48,
      items: [
        {
          label: 'Home',
          href: 'index.html',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
        },
        {
          label: 'Projects',
          href: 'projects_category.html',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`
        },
        {
          label: 'Gallery',
          href: 'gallery.html',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
        },
        {
          label: 'Services',
          href: 'services.html',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`
        },
        {
          label: 'About Us',
          href: 'about.html',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
        },
        {
          label: 'Contact',
          href: 'contact.html',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
        }
      ]
    });
  }
});
