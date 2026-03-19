
const addToCartForms = document.querySelectorAll('form[action$="/cart/add-item"]');
const toastNotification = document.getElementById('toast-notification');
const toastMessage = document.getElementById('toast-message');
const cartBadge = document.querySelector('.header-actions__cart-badge');

let toastTimeout;

addToCartForms.forEach(form => {
    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const formData = new URLSearchParams(new FormData(form));

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                // 1. Actualizamos el numerito del carrito en el menú superior
                if (cartBadge) {
                    cartBadge.textContent = result.totalItems;
                    // Un pequeño efecto de rebote visual para que el usuario note el cambio
                    cartBadge.style.transform = 'scale(1.5)';
                    setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
                }

                // 2. Mostramos el Toast subiéndolo en la pantalla
                toastMessage.textContent = result.message;
                toastNotification.style.bottom = '20px';

                // 3. Lo volvemos a ocultar después de 3 segundos
                clearTimeout(toastTimeout);
                toastTimeout = setTimeout(() => {
                    toastNotification.style.bottom = '-100px';
                }, 3000);
            }

        } catch (error) {
            console.error("Error al agregar el producto:", error);
            alert("Hubo un problema al agregar el producto.");
        }
    });
});