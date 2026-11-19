// The pricing page's Buy buttons: Paddle's checkout, opened on this page (Paddle.js).
//
// Until the live account is set up, LIVE is null and the buttons say "On sale after the beta"; Paddle.js isn't
// loaded at all. Client-side tokens are meant to be public; they can only open checkouts.
//
// Trying it with Paddle's sandbox: serve this folder locally (python -m http.server 8095 --bind 127.0.0.1) and open
// http://127.0.0.1:8095/pricing.html?checkout=sandbox. That loads buy-sandbox.js, which is never committed (see
// .gitignore) and never published: the key generator signs sandbox sales with the real key, so a sandbox checkout on
// desktopwiki.com would hand out working licenses for Paddle's public test card. buy-sandbox.js sets
// window.DW_SANDBOX_CHECKOUT = { environment: 'sandbox', token: 'test_…', prices: { 'family-yearly': 'pri_…', … } }
// with the token "desktopwiki.com Buy buttons" (sandbox-vendors.paddle.com → Developer tools → Authentication →
// Client-side tokens) and the price ids in desktopwiki/server/licenses/README.md.
(function () {
  'use strict';

  // Set up the live account's products the same way, then fill this in (its token starts with live_):
  // { environment: 'production', token: 'live_…', prices: { 'family-yearly': 'pri_…', 'team-yearly': …,
  //   'business-yearly': … } }
  var LIVE = null;

  var bought = null;

  function theme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function showThanks(email) {
    var box = document.getElementById('thanks');
    if (!box) return;
    var where = document.getElementById('thanks-email');
    if (where) where.textContent = email || 'the email address you gave';
    box.hidden = false;
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    box.focus();
  }

  function onEvent(e) {
    if (!e || !e.name) return;
    if (e.name === 'checkout.completed') {
      bought = (e.data && e.data.customer && e.data.customer.email) || '';
    } else if (e.name === 'checkout.closed' && bought !== null) {
      showThanks(bought);
      bought = null;
    }
  }

  function open(priceId) {
    bought = null;
    window.Paddle.Checkout.open({
      items: [{ priceId: priceId, quantity: 1 }],
      settings: { displayMode: 'overlay', theme: theme(), locale: 'en', allowLogout: true }
    });
  }

  function makeButtons(checkout) {
    var places = document.querySelectorAll('[data-buy]');
    for (var i = 0; i < places.length; i++) {
      var place = places[i];
      var priceId = checkout.prices[place.getAttribute('data-buy')];
      if (!priceId) continue;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = place.getAttribute('data-buy-class') || 'button';
      button.textContent = place.getAttribute('data-buy-label') || 'Buy';
      button.addEventListener('click', open.bind(null, priceId));
      place.replaceWith(button);
    }
  }

  function loadScript(src, then) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = then;
    document.head.appendChild(script);
  }

  function start(checkout) {
    if (!checkout) return;
    loadScript('https://cdn.paddle.com/paddle/v2/paddle.js', function () {
      if (checkout.environment === 'sandbox') window.Paddle.Environment.set('sandbox');
      window.Paddle.Initialize({ token: checkout.token, eventCallback: onEvent });
      makeButtons(checkout);
    });
  }

  var wanted = null;
  try { wanted = new URLSearchParams(location.search).get('checkout'); } catch (e) {}
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  if (wanted === 'sandbox' && local) {
    loadScript('buy-sandbox.js', function () { start(window.DW_SANDBOX_CHECKOUT); });
  } else {
    start(LIVE);
  }
})();
