<script>
	import { goto } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let products = [];
	let selectedTag = null;
	let selectedCategory = null;
	let selectedArtist = null;
	let minPrice = 0;
	let maxPrice = 1000;
	let currentPage = 1;
	let itemsPerPage = 12;
	let sortBy = 'newest';

	// Add this line - define the options array
	const itemsPerPageOptions = [12, 24, 48, 96];

	// Initialize price range from products
	const productPrices = products.map(product => parseFloat(product.price));
	const initialMinPrice = Math.min(...productPrices);
	const initialMaxPrice = Math.max(...productPrices);

	// Add this reactive declaration to track price changes
	$: priceChanged = minPrice !== initialMinPrice || maxPrice !== initialMaxPrice;

	// Set default price range based on products
	minPrice = initialMinPrice;
	maxPrice = initialMaxPrice;

	// Create lists of unique tags, categories, and artists
	let uniqueTags = [...new Set(products.flatMap(product => product.tags?.map(tag => tag.name)))];
	let uniqueCategories = [...new Set(products.flatMap(product => product.categories?.map(cat => cat.name)))];
	let uniqueArtists = [...new Set(
		products.flatMap(product => product.attributes
			.filter(attr => attr.name.toLowerCase() === 'artist')
			.flatMap(attr => attr.options)
		)
	)];

	// Filter and sort products
	$: filteredProducts = products.filter(product => {
		const matchesTag = !selectedTag || product.tags.some(tag => tag.name === selectedTag);
		const matchesCategory = !selectedCategory || product.categories.some(cat => cat.name === selectedCategory);
		const matchesArtist = !selectedArtist || product.attributes.some(attr => 
			attr.name.toLowerCase() === 'artist' && attr.options.includes(selectedArtist)
		);
		const matchesPrice = parseFloat(product.price) >= minPrice && parseFloat(product.price) <= maxPrice;

		return matchesTag && matchesCategory && matchesArtist && matchesPrice;
	}).sort((a, b) => {
		if (sortBy === 'newest') return new Date(b.date_created) - new Date(a.date_created);
		if (sortBy === 'price-low') return parseFloat(a.price) - parseFloat(b.price);
		if (sortBy === 'price-high') return parseFloat(b.price) - parseFloat(a.price);
		return 0;
	});

	// Pagination
	$: totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
	$: paginatedProducts = filteredProducts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	function handleTagClick(tag) {
		selectedTag = selectedTag === tag ? null : tag;
		currentPage = 1;
	}

	function handleCategoryClick(category) {
		selectedCategory = selectedCategory === category ? null : category;
		currentPage = 1;
	}

	function handleArtistClick(artist) {
		selectedArtist = selectedArtist === artist ? null : artist;
		currentPage = 1;
	}

	function handlePriceChange(event, type) {
		const value = parseFloat(event.target.value);
		if (type === 'min') {
			minPrice = Math.min(value, maxPrice);
		} else if (type === 'max') {
			maxPrice = Math.max(value, minPrice);
		}
		currentPage = 1;
	}

	function changePage(page) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}
</script>

<div class="wrapper space-y-lg py-lg mb-[var(--spacing-xl)]">
	<div class="flex flex-col gap-lg">
		<!-- Filter Controls - Simplified -->
		<div class="filter-controls bg-background p-md rounded-lg">
			<div class="flex flex-wrap gap-md justify-between items-center">
				<!-- Display Options -->
				<div class="flex gap-md items-center">
					<select 
						id="sort-select"
						bind:value={sortBy}
						class="filter-select"
					>
						<option value="newest">Newest</option>
						<option value="price-low">Price: Low to High</option>
						<option value="price-high">Price: High to Low</option>
					</select>

					<select 
						id="items-select"
						bind:value={itemsPerPage}
						class="filter-select"
						on:change={() => currentPage = 1}
					>
						{#each itemsPerPageOptions as option}
							<option value={option}>{option} per page</option>
						{/each}
					</select>
				</div>

				<!-- Active Filters -->
				<div class="filter-tags flex flex-wrap gap-sm">
					{#if selectedCategory}
						<span class="pill pill-primary pill-sm" on:click={() => handleCategoryClick(selectedCategory)}>
							{selectedCategory} ×
						</span>
					{/if}
					{#if selectedTag}
						<span class="pill pill-secondary pill-sm" on:click={() => handleTagClick(selectedTag)}>
							{selectedTag} ×
						</span>
					{/if}
					{#if selectedArtist}
						<span class="pill pill-accent pill-sm" on:click={() => handleArtistClick(selectedArtist)}>
							{selectedArtist} ×
						</span>
					{/if}
					{#if priceChanged}
						<span class="pill pill-neutral pill-sm">
							€{minPrice} - €{maxPrice}
						</span>
					{/if}
				</div>
			</div>
		</div>

		<div class="flex flex-col md:flex-row gap-lg">
			<!-- Sidebar Filters - More Compact -->
			<aside class="filter-sidebar w-full md:w-1/5 bg-background p-md rounded-lg">
				<div class="filter-container space-y-md">
					<!-- Category -->
					<details class="filter-section">
						<summary class="section-title cursor-pointer">Category</summary>
						<div class="pill-group mt-sm">
							{#each uniqueCategories as category}
								<button 
									on:click={() => handleCategoryClick(category)}
									class={`pill ${selectedCategory === category ? 'pill-filled pill-primary' : 'pill-primary'} pill-sm`}
								>
									{category}
								</button>
							{/each}
						</div>
					</details>

					<!-- Tags -->
					<details class="filter-section">
						<summary class="section-title cursor-pointer">Tags</summary>
						<div class="pill-group mt-sm">
							{#each uniqueTags as tag}
								<button 
									on:click={() => handleTagClick(tag)}
									class={`pill ${selectedTag === tag ? 'pill-filled pill-secondary' : 'pill-secondary'} pill-sm`}
								>
									{tag}
								</button>
							{/each}
						</div>
					</details>

					<!-- Artist -->
					<details class="filter-section">
						<summary class="section-title cursor-pointer">Artist</summary>
						<div class="pill-group mt-sm">
							{#each uniqueArtists as artist}
								<button 
									on:click={() => handleArtistClick(artist)}
									class={`pill ${selectedArtist === artist ? 'pill-filled pill-accent' : 'pill-accent'} pill-sm`}
								>
									{artist}
								</button>
							{/each}
						</div>
					</details>

					<!-- Price Range -->
					<details class="filter-section">
						<summary class="section-title cursor-pointer">Price Range</summary>
						<div class="slider-container mt-sm space-y-sm">
							<div class="flex flex-col gap-xs">
								<input
									type="range"
									min={initialMinPrice}
									max={initialMaxPrice}
									bind:value={minPrice}
									on:input={(event) => handlePriceChange(event, 'min')}
									class="w-full"
								/>
								<span class="text-sm">Min: €{minPrice}</span>
							</div>
							<div class="flex flex-col gap-xs">
								<input
									type="range"
									min={initialMinPrice}
									max={initialMaxPrice}
									bind:value={maxPrice}
									on:input={(event) => handlePriceChange(event, 'max')}
									class="w-full"
								/>
								<span class="text-sm">Max: €{maxPrice}</span>
							</div>
						</div>
					</details>
				</div>
			</aside>

			<!-- Product Grid -->
			<div class="product-grid-container flex-1">
				<div class="product-grid">
					{#each paginatedProducts as product (product.id)}
						<div
							in:fly={{ y: 20, duration: 400, delay: 200, easing: quintOut }}
							out:fade={{ duration: 200 }}
							class="product-card"
							on:click={() => goto(`/shop/${product.id}`)}
						>
							<div class="product-image-container">
								<img 
									src={product.images[0]?.src} 
									alt={product.name} 
									class="product-image"
								/>
								<div class="product-overlay">
									<div class="product-tags absolute top-2 left-2 flex flex-wrap gap-1">
										{#each product.tags as tag}
											<span class="pill pill-primary pill-sm">{tag.name}</span>
										{/each}
									</div>
									<div class="product-info">
										<h3 class="product-title">{product.name}</h3>
										<span class="pill pill-secondary pill-sm">€{parseFloat(product.price).toFixed(2)}</span>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Pagination -->
				{#if totalPages > 1}
					<div class="pagination">
						<button 
							class="pagination-button" 
							disabled={currentPage === 1}
							on:click={() => changePage(currentPage - 1)}
						>
							Previous
						</button>
						
						{#each Array(totalPages) as _, i}
							<button 
								class="pagination-button ${currentPage === i + 1 ? 'active' : ''}"
								on:click={() => changePage(i + 1)}
							>
								{i + 1}
							</button>
						{/each}
						
						<button 
							class="pagination-button"
							disabled={currentPage === totalPages}
							on:click={() => changePage(currentPage + 1)}
						>
							Next
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.wrapper {
		max-width: 100%;
		margin: 0 auto;
	}

	.filter-controls {
		position: sticky;
		top: 0;
		z-index: 10;
		background-color: var(--background-color);
	}

	.sort-select,
	.items-select {
		padding: var(--spacing-xs) var(--spacing-sm);
		background-color: var(--background-color);
	}

	.active-filter {
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
			gap: var(--spacing-md);
	}

	.product-card {
		position: relative;
		background: var(--background-color);
		overflow: hidden;
		cursor: pointer;
		transition: transform 0.3s ease;
	}

	.product-card:hover {
		transform: translateY(-4px);
	}

	.product-card:hover .product-info {
			opacity: 1;
	}

	.product-image-container {
		position: relative;
		padding-top: 100%;
	}

	.product-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.product-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: var(--spacing-sm);
	}

	.product-info {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: var(--spacing-sm);
		background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
		opacity: 0;
		transition: opacity 0.3s ease;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}

	.product-title {
		color: var(--background-color);
		font-size: var(--font-size-base);
		font-weight: bold;
		margin: 0;
	}

	.pagination {
		display: flex;
		justify-content: center;
		gap: var(--spacing-xs);
		margin-top: var(--spacing-lg);
		padding: var(--spacing-md);
	}

	.pagination-button {
		padding: var(--spacing-xs) var(--spacing-sm);
		background-color: var(--background-color);
		color: var(--primary-color);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.pagination-button:hover:not(:disabled) {
		background-color: var(--primary-color);
		color: var(--background-color);
	}

	.pagination-button.active {
		background-color: var(--primary-color);
		color: var(--background-color);
	}

	.pagination-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.filter-sidebar {
			position: relative;
			top: 0;
			width: 100%;
		}

		.product-grid {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		}

		.pagination {
			flex-wrap: wrap;
		}
	}

	.filter-container {
		background-color: var(--background-color);
	}

	.filter-section {
		border-bottom: 1px solid var(--secondary-bg-color);
		padding: var(--spacing-sm) 0;
	}

	.filter-section:last-child {
		border-bottom: none;
	}

	.section-title {
		font-size: var(--font-size-base);
		color: var(--primary-color);
		font-weight: 600;
	}

	.filter-select {
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--secondary-bg-color);
		border-radius: var(--border-radius);
		background-color: var(--background-color);
	}

	.pill-group {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
	}

	details summary::-webkit-details-marker {
		display: none;
	}

	details summary::after {
		content: '+';
		float: right;
	}

	details[open] summary::after {
		content: '−';
	}
</style>
