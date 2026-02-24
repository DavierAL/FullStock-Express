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
