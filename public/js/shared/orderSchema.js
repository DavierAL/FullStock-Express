import { z } from "zod";

const valueEmpty = (name, type) => {
    return `${type === "m" ? "El" : "La"} ${name} es requerida`
}

export const orderSchema = z.object({
    email: z.email("Email inválido"),
    firstName: z.string().min(3, { message: valueEmpty("nombre", "m") }),
    lastName: z.string().min(3, { message: valueEmpty("apellido", "m") }),
    phone: z.string().min(9, { message: valueEmpty("teléfono", "m") }),
    company: z.string().optional(),
    address: z.string().min(3, { message: valueEmpty("dirección", "f") }),
    city: z.string().min(1, { message: valueEmpty("ciudad", "f") }),
    country: z.string().min(1, { message: valueEmpty("país", "m") }),
    region: z.string().min(1, { message: valueEmpty("región", "f") }),
    postalCode: z.string().min(1, { message: valueEmpty("código postal", "m") }),
    paymentMethod: z.string().optional(),
})