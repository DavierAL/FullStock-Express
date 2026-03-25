const filterForm = document.querySelector('[data-js="filter-form"]');
const productCards = document.querySelectorAll('[data-js="product-card"]');

if (filterForm) {
  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const { minPrice, maxPrice } = e.currentTarget.elements;
    const minVal = parseFloat(minPrice.value) || 0;
    const maxVal = parseFloat(maxPrice.value) || Infinity;

    productCards.forEach((card) => {
      const price = parseFloat(card.dataset.price);
      const isVisible = price >= minVal && price <= maxVal;
      card.dataset.visible = isVisible;
    });

    const url = new URL(window.location);
    
    if (minPrice.value) {
      url.searchParams.set("minPrice", minPrice.value);
    } else {
      url.searchParams.delete("minPrice");
    }

    if (maxPrice.value) {
      url.searchParams.set("maxPrice", maxPrice.value);
    } else {
      url.searchParams.delete("maxPrice");
    }

    window.history.pushState({}, "", url);
  });
}
