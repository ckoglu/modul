
export function initializeTooltip() {
  // Tooltip gösterme
  document.addEventListener(
    'mouseenter',
    function (e) {
      if (
        e.target.nodeType === Node.ELEMENT_NODE &&
        e.target.matches('[data-alt-title], [data-sag-title], [data-sol-title], [data-ust-title]')
      ) {
        let el = e.target;
        el.tooltipTimeout = setTimeout(() => {
          el.classList.add('tooltip-visible');
        }, 500);
      }
    },
    true // capture mode açık
  );

  // Tooltip gizleme
  document.addEventListener(
    'mouseleave',
    function (e) {
      if (
        e.target.nodeType === Node.ELEMENT_NODE &&
        e.target.matches('[data-alt-title], [data-sag-title], [data-sol-title], [data-ust-title]')
      ) {
        let el = e.target;
        clearTimeout(el.tooltipTimeout);
        el.classList.remove('tooltip-visible');
        el.classList.add('tooltip-immediate-hide');
        setTimeout(() => {
          el.classList.remove('tooltip-immediate-hide');
        }, 10);
      }
    },
    true
  );
}