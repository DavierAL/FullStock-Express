import { getData } from "../data/db.js"

export async function getNextId(collectionName) {
    const data = await getData();
    const collection = data[collectionName] || [];

    if (collection.lenght === 0) return 1;


}