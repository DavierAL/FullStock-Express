import fs from "node:fs/promises";
import path from "node:path";
// Path de mi data.json
const DATA_PATH = path.join("data", "data.json"); // "./data/data.json"

// Cache en memoria para evitar leer el disco en cada operación
let cachedData = null;

export async function getData() {
    if (!cachedData) {
        // Solo leemos del disco la primera vez o después de invalidar
        const dataJson = await fs.readFile(DATA_PATH, "utf-8");
        cachedData = JSON.parse(dataJson);
    }
    return cachedData;
}

export async function saveData(data) {
    // Actualizamos cache y persistimos en disco simultáneamente
    cachedData = data;
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getNextId(collectionName) {
    const db = await getData();
    const collection = db[collectionName] || [];
    if (collection.length === 0) return 1;
    const ids = collection.map((item) => item.id);
    return Math.max(...ids) + 1;
}