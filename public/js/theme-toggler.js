/* eslint-env browser */
export function mountThemeToggler(parent) {
  if (!(parent instanceof HTMLElement)) {
    console.error('El contenedor padre no es un HTMLElement válido.', parent);
    return;
  }

  const btn = document.createElement('button');
  btn.className = 'button button--ghost button--xl-icon';
  const img = document.createElement('img');
  img.alt = ''; // Imagen decorativa
  btn.appendChild(img);
  parent.prepend(btn);

  let currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  function updateUI() {
    if (currentTheme === 'dark') {
      img.src = '/images/icons/sun.svg';
      btn.setAttribute('aria-label', 'Cambiar a modo claro');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      img.src = '/images/icons/moon.svg';
      btn.setAttribute('aria-label', 'Cambiar a modo oscuro');
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }

  btn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    updateUI();
  });

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", (event) => {
    const theme = localStorage.getItem("theme");
    if (!theme) {
      currentTheme = event.matches ? 'dark' : 'light';
      updateUI();
    }
  });

  // Inicialización de la UI basada en el estado inicial del HTML
  updateUI();
}
