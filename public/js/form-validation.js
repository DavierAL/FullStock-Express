

function showError(container, message) {
    container.classList.add("input-field--error");
    // Evitamos crear múltiples spans si ya hay un error mostrándose
    if (!container.querySelector(".input-field__error")) {
        const span = document.createElement("span");
        span.classList.add("input-field__error");
        span.textContent = message;
        container.appendChild(span);
    } else {
        container.querySelector(".input-field__error").textContent = message;
    }
}

function clearError(container) {
    container.classList.remove("input-field--error");
    const span = container.querySelector(".input-field__error");
    if (span) span.remove();
}

export function setupFormValidation(form, schema) {
    if (!form) {
        console.log("Formulario no existe");
        return;
    }

    // Agregamos el atributo novalidate para evitar validación nativa del navegador
    form.setAttribute("novalidate", "");

    const touchedFields = new Set();

    // Evento al perder el foco (blur)
    form.addEventListener("focusout", (e) => {
        const fieldName = e.target.name;
        if (!fieldName) return; // Si no tiene nombre, ignorarlo

        touchedFields.add(fieldName);
        validate();
    });

    // Evento al escribir o cambiar algo (real-time validation)
    form.addEventListener("input", (e) => {
        const fieldName = e.target.name;
        if (!fieldName) return;

        // Validar en tiempo real solo si el usuario ya interactuó previamente con este campo
        if (touchedFields.has(fieldName)) {
            validate();
        }
    });

    // Evento al intentar enviar el formulario
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Al intentar enviar, marcamos todos los campos como "tocados" para mostrar todos sus errores
        const allInputs = form.querySelectorAll("input, select, textarea");
        allInputs.forEach(input => {
            if (input.name) touchedFields.add(input.name);
        });

        // Validamos todos los campos antes de enviarlo
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        const result = schema.safeParse(data);

        validate();

        // Si la validación es exitosa, se puede enviar el formulario
        if (result.success) {
            form.submit();
        }
    });

    function validate() {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        const result = schema.safeParse(data);
        const allInputs = form.querySelectorAll("input, select, textarea");

        // Primero, limpiamos los errores de los campos tocados
        allInputs.forEach(input => {
            const fieldName = input.name;
            if (touchedFields.has(fieldName)) {
                const container = input.closest(".input-field");
                if (container) {
                    clearError(container);
                }
            }
        });

        // Mostrar los errores de todos los campos tocados
        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            Object.entries(errors).forEach(([fieldName, messages]) => {
                if (touchedFields.has(fieldName)) {
                    const input = form.querySelector(`[name="${fieldName}"]`);
                    if (input) {
                        const container = input.closest(".input-field");
                        if (container) {
                            showError(container, messages[0]);
                        }
                    }
                }
            });
        }
    }
}