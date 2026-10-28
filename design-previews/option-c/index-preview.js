// Work index for option C: hovering or focusing a row swaps the preview image beside the list.
const preview = document.querySelector('[data-preview-img]');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

for (const row of document.querySelectorAll('[data-preview-src]')) {
  const show = () => {
    if (preview.getAttribute('src') === row.dataset.previewSrc) return;
    const swap = () => { preview.src = row.dataset.previewSrc; preview.decode().catch(() => {}).finally(() => preview.classList.remove('is-swapping')); };
    if (reduceMotion) return swap();
    preview.classList.add('is-swapping');
    setTimeout(swap, 160);
  };
  row.addEventListener('mouseenter', show);
  row.addEventListener('focus', show);
}
