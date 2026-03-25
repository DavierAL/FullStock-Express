/* eslint-env browser */

const passwordInputs = document.querySelectorAll('input[type="password"][data-toggle-password]');

passwordInputs.forEach(input => {
  // Crea el wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'password-input';

  // Inyecta el wrapper antes del input
  input.parentNode.insertBefore(wrapper, input);
  
  // Mueve el input dentro del wrapper
  wrapper.appendChild(input);
  
  // Agrega la clase de field al input
  input.classList.add('password-input__field');

  // Crea el botón
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'password-input__toggle button button--ghost button--sm-icon';
  button.setAttribute('aria-label', 'Mostrar contraseña');
  
  // Crea la imagen
  const img = document.createElement('img');
  img.src = '/images/icons/eye.svg';
  img.alt = ''; // decorativa
  button.appendChild(img);
  
  // Añade el botón al wrapper
  wrapper.appendChild(button);

  // Funcionalidad de toggle
  button.addEventListener('click', () => {
    if (input.type === 'password') {
      input.type = 'text';
      img.src = '/images/icons/eye-off.svg';
      button.setAttribute('aria-label', 'Ocultar contraseña');
    } else {
      input.type = 'password';
      img.src = '/images/icons/eye.svg';
      button.setAttribute('aria-label', 'Mostrar contraseña');
    }
  });
});
