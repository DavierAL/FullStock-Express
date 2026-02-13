import fs from "node:fs/promises";
import path from "node:path";

const DATA_PATH = path.join("data", "data.json");

// Leer y parsear data.json
export async function readData() {
  const dataJson = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(dataJson);
}

// Escribir data.json con formato legible
export async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

export function parsePriceToCents(value) {
  if (!value || isNaN(value) || value === "Infinity" || value.trim() === "")
    return null;
  return value * 100;
}

export function validationsPrices(minPrice, maxPrice) {
  let message = "";
  let title = "";

  if (
    !minPrice ||
    isNaN(minPrice) ||
    minPrice.trim() === "" ||
    parseFloat(minPrice) < 0
  ) {
    title = "Precio minímo Incorrecto";
    message = `El precio minímo debe ser un valor entero positivo, se ingreso "${minPrice}"`;
  }

  if (
    !maxPrice ||
    isNaN(maxPrice) ||
    maxPrice.trim() === "" ||
    parseFloat(maxPrice) < 0
  ) {
    title = "Precio Máximo Incorrecto";
    message = `El precio Máximo debe ser un valor entero positivo, se ingreso "${maxPrice}"`;
  }

  if (parseFloat(minPrice) > parseFloat(maxPrice)) {
    title = "Filtros incorrectos";
    message = `El precio Minímo no debe ser mayor al precio máximo`;
  }

  return {
    message,
    title,
  };
}
