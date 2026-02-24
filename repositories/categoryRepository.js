import { getData } from "../data/db.js";

export async function findAll() {
  const data = await getData();

  return data.categories;
}
