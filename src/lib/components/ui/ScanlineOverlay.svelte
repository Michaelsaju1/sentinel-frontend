<script lang="ts">
	let { opacity = 0.03 }: { opacity?: number } = $props();
</script>

<div
	class="pointer-events-none fixed inset-0 z-50"
	aria-hidden="true"
	style="
		background: repeating-linear-gradient(
			0deg,
			rgba(0, 119, 170, {opacity}) 0px,
			rgba(0, 119, 170, {opacity}) 1px,
			transparent 1px,
			transparent 2px
		);
	"
></div>
