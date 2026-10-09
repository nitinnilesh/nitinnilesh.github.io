document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-reveal]').forEach((button) => {
    const target = document.getElementById(button.dataset.reveal);
    if (!target) return;
    button.addEventListener('click', () => {
      const opening = target.hidden;
      target.hidden = !opening;
      button.setAttribute('aria-expanded', String(opening));
      button.textContent = opening ? 'Hide answer' : 'Reveal answer';
    });
  });

  const previous = document.body.dataset.prev;
  const next = document.body.dataset.next;
  const pager = document.querySelector('.pager');
  if (pager && !document.getElementById('discussion')) {
    const discussionLink = document.createElement('a');
    discussionLink.className = 'button discussion-link';
    discussionLink.href = 'index.html#discussion';
    discussionLink.textContent = 'Questions & discussion';
    pager.insertBefore(discussionLink, pager.children[1] || null);
  }

  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input, button, textarea, select')) return;
    if (event.key === 'ArrowLeft' && previous) window.location.href = previous;
    if (event.key === 'ArrowRight' && next) window.location.href = next;
  });
});
