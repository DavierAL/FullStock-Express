import * as categoryRepository from "../repositories/categoryRepository.js";

export async function getCategoryBySlug(slug) {
  const categories = await categoryRepository.findAll();

  // filtramos la category de acuerdo al slug
  const categoryFinded = categories.find(
    (category) => category.slug.toLowerCase() === slug.toLowerCase(), // tazas12345
  );

  return categoryFinded;
}
