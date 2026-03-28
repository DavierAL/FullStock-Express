import { z } from "zod";

export const profileSchema = z.object({
    firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
    phone: z.string().min(9, { message: "El teléfono debe ser válido y tener al menos 9 caracteres." }),
    address: z.string().min(5, { message: "La dirección debe ser clara, mínimo 5 caracteres." })
});
