import { z } from "zod";

const valueEmpty = (name, type) => {
    return `${type === "m" ? "El" : "La"} ${name} es requerida`
}

export const orderSchema = z.object({
    email: z.email("Email inválido"),
    firstName: z.string().min(3, { error: valueEmpty("nombre", "m") }),
    lastName: z.string().min(3, { error: valueEmpty("apellido", "m") }),
    phone: z.string().min(9, { error: valueEmpty("teléfono", "m") }),
    company: z.string().optional(),
    address: z.string().min(3, { error: valueEmpty("dirección", "f") }),
    city: z.string().min(1, { error: valueEmpty("ciudad", "f") }),
    country: z.string().min(1, { error: valueEmpty("país", "m") }),
    region: z.string().min(1, { error: valueEmpty("región", "f") }),
    postalCode: z.string().min(1, { error: valueEmpty("código postal", "m") }),
    paymentMethod: z.string().min(1, { error: valueEmpty("método de pago", "m") }),
})