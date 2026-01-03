export function filterFavoriteProducts(products, favoriteKeywords) {
  if (!favoriteKeywords || favoriteKeywords.length === 0) {
    return products;
  }

  const keywords = favoriteKeywords.map(k => k.toLowerCase().trim());

  return products.filter(product => {
    const searchText = `${product.name} ${product.description} ${product.fullText}`.toLowerCase();

    return keywords.some(keyword => searchText.includes(keyword));
  });
}

export function formatProductsForEmail(products, favoriteKeywords) {
  if (products.length === 0) {
    return `
      <h2>No matching BOGO deals found today</h2>
      <p>We didn't find any BOGO deals matching your favorites: <strong>${favoriteKeywords.join(', ')}</strong></p>
      <p>Check back tomorrow!</p>
    `;
  }

  // Count matches for each keyword (unique - each product counted only once)
  const keywordCounts = {};
  const countedProducts = new Set();

  favoriteKeywords.forEach(keyword => {
    keywordCounts[keyword] = 0;
  });

  // Count each product only once, for its first matching keyword
  products.forEach(product => {
    const searchText = `${product.name} ${product.description} ${product.fullText}`.toLowerCase();

    for (const keyword of favoriteKeywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        keywordCounts[keyword]++;
        break; // Count this product only once
      }
    }
  });

  // Build the keyword counts display
  const keywordCountsHtml = favoriteKeywords
    .map(keyword => `<strong>${keyword}: ${keywordCounts[keyword]}</strong>`)
    .join(' | ');

  let html = `
    <h2>Your Publix BOGO Deals (${products.length} found)</h2>
    <p style="font-size: 16px; padding: 10px; background-color: #e8f5e9; border-radius: 5px;">
      ${keywordCountsHtml}
    </p>
    <hr>
  `;

  products.forEach((product, index) => {
    // Parse the full description to extract deal details
    const fullText = product.fullText || product.description || '';

    html += `
      <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #00893e;">
        <h3 style="margin: 0 0 5px 0; color: #00893e; font-size: 18px;">${index + 1}. ${product.name}</h3>
        ${product.price ?
          `<p style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold; color: #d32f2f;">
            ${product.price}
          </p>` : ''}
        ${fullText ?
          `<p style="margin: 0; color: #333; font-size: 14px; line-height: 1.5; white-space: pre-line;">
            ${fullText.trim()}
          </p>` : ''}
      </div>
    `;
  });

  html += `
    <hr>
    <p style="color: #666; font-size: 12px;">
      This is an automated notification from your Publix BOGO Monitor.<br>
      Visit <a href="https://www.publix.com/savings/weekly-ad/bogo">Publix BOGO Deals</a> for more details.
    </p>
  `;

  return html;
}
