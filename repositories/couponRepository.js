import { getData } from "../data/db.js";

export async function findByCode(code) {
    const data = await getData();
    const coupon = data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active === true);
    return coupon || null;
}