<script>
    // Import the component to display exhibitions
    import LatestVirtualExhibition from '$lib/components/LatestVirtualExhibition.svelte';
	import VirtualExhibitionGrid from '$lib/components/VirtualExhibitionGrid.svelte';
    
    // Load data from the server (exhibitions and media)
    export let data;
    const { exhibitions, media } = data;
</script>

<div class="exhibitions-page px-page">
    <!-- Pass all exhibitions and media to LatestVirtualExhibition -->
    <LatestVirtualExhibition {exhibitions} {media} />
    <VirtualExhibitionGrid {exhibitions} {media} />
</div>

<style>
    .exhibitions-page {
    }
    .page-title {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
    }
</style>
