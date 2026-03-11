import * as userService from "../services/userService.js";

export async function renderProfile(req, res) {
    if (!req.user) {
        return res.redirect("/login");
    }

    res.render("profile", {
        namePage: "Mi Cuenta",
        user: req.user
    });
}

//Procesar el formulario cuando el usuario hace clic en "Guardar"
export async function handleUpdateProfile(req, res) {
    if (!req.user) {
        return res.redirect("/login");
    }

    const { firstName, lastName, phone, address } = req.body;

    try {
        await userService.updateUser(req.user.id, {
            firstName,
            lastName,
            phone,
            address
        });

        // Recargamos la página para que vea sus datos actualizados
        res.redirect("/profile");

    } catch (error) {
        console.error("Error actualizando perfil:", error, 400);
        res.render("profile", {
            namePage: "Mi Cuenta",
            user: req.user,
            error: "Hubo un problema al actualizar tus datos."
        });
    }
}