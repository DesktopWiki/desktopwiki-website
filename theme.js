// Light/dark toggle. The initial theme is set by the inline script in <head>.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function render() {
    var dark = root.getAttribute('data-theme') === 'dark';
    // The button offers the mode you'd switch to.
    btn.querySelector('.icon').textContent = dark ? '☀' : '☾';
    btn.querySelector('.label').textContent = dark ? 'Light mode' : 'Dark mode';
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    render();
  });

  // Follow the system setting until the visitor picks one.
  if (window.matchMedia) {
    var mq = matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (e) {
      var saved = null;
      try { saved = localStorage.getItem('theme'); } catch (err) {}
      if (saved) return;
      root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      render();
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  render();
})();
