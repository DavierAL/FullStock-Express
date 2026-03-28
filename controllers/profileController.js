import * as userService from "../services/userService.js";
import { profileSchema } from "../public/js/shared/profileSchema.js";

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

    const result = profileSchema.safeParse(req.body);

    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        return res.render("profile", {
            namePage: "Mi Cuenta",
            user: { ...req.user, ...req.body }, // so user keeps typed values
            errors: fieldErrors
        });
    }

    const { firstName, lastName, phone, address } = result.data;

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
            user: { ...req.user, ...req.body },
            generalError: "Hubo un problema al actualizar tus datos."
        });
    }
}