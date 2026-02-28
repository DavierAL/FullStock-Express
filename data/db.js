import fs from "node:fs/promises";
import path from "node:path";
// Path de mi data.json
const DATA_PATH = path.join("data", "data.json"); // "./data/data.json"

export async function getData() {
    // Leer mi archivo data.json
    const dataJson = await fs.readFile(DATA_PATH, "utf-8");
    // Convertir el json a objeto
    const data = JSON.parse(dataJson);
    return data;
}

export async function saveData(data) {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getNextId(collectionName) {
    const db = await getData();
    const collection = db[collectionName] || [];
    if (collection.length === 0) return 1;
    const ids = collection.map((item) => item.id);
    return Math.max(...ids) + 1;
}