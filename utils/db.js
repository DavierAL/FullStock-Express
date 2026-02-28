import { getData } from "../data/db.js"

export async function getNextId(collectionName) {
    const data = await getData();
    const collection = data[collectionName] || [];

    if (collection.lenght === 0) return 1;

    const ids = collection.map(item => item.id);
    const maxId = Math.max(...ids);
    return maxId + 1;


}