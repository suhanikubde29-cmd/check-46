/* ================== CONFIG ================== */
var EXIT_URL = "https://www.google.com";

/* ================== SMOOTH CARD ENTRANCE ================== */
/* Fades and scales the popup card in when the page is actually shown.
   On prerendered pages the animation is held until the visitor really
   arrives, otherwise it would play invisibly during prerender and they'd
   see nothing. A safety timer guarantees the card always becomes visible
   even if something goes wrong. */
(function () {
  var modalEl = document.querySelector('.modal');
  if (!modalEl) { return; }

  var played = false;
  function playEnter() {
    if (played) { return; }
    played = true;
    modalEl.classList.add('enter');
    /* Darken the background at the same moment, so it reads as the popup
       opening on top of the page. */
    var dimEl = document.querySelector('.video-dim');
    if (dimEl) { dimEl.classList.add('backdrop-in'); }
  }

  modalEl.style.opacity = '0';

  if (document.prerendering) {
    document.addEventListener('prerenderingchange', playEnter, { once: true });
  } else {
    playEnter();
  }

  /* Safety net: never leave the card hidden, no matter what. */
  setTimeout(playEnter, 1200);
})();

/* ================== GPT AD DISPLAY ================== */
/* Both ads are now shown from inline scripts placed directly after their
   own ad boxes, so neither has to wait for this file to download. Nothing
   ad-related is left here on purpose. */

function trackDecline(stepName) {
  if (window.gtag) {
    gtag('event', 'decline', {
      step: stepName,
      page_path: location.pathname
    });
  }
}

/* ================== GEO DETECTION (country-verification page only) ================== */
function detectRegion() {
  var countryData = {
    GB: { flag: "🇬🇧", name: "United Kingdom", short: "the UK" },
    CA: { flag: "🇨🇦", name: "Canada", short: "Canada" },
    US: { flag: "🇺🇸", name: "United States", short: "the US" }
  };

  fetch("https://ipapi.co/json/")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var code = data && data.country_code;
      var info = countryData[code] || countryData.US;
      applyRegion(info);
    })
    .catch(function () {
      applyRegion(countryData.US);
    });
}

function applyRegion(info) {
  var flagEl = document.getElementById("regionFlag");
  var nameEl = document.getElementById("regionName");
  var enterBtn = document.getElementById("regionEnterBtn");
  var exitBtn = document.getElementById("regionExitBtn");
  if (!flagEl) { return; }
  flagEl.textContent = info.flag;
  nameEl.textContent = info.name;
  enterBtn.textContent = "I am in " + info.short + " — Enter";
  exitBtn.textContent = "I am not in " + info.short + " — Exit";
}

/* ================== HUMAN CHECK ANIMATION (video-playing page only) ================== */
function runHumanCheck() {
  var visual = document.getElementById('verifyVisual');
  var bar = document.getElementById('verifyBar');
  if (!visual) { return; }
  visual.classList.add('show');
  setTimeout(function () {
    bar.style.width = '100%';
  }, 30);
}

/* ================== PAGE TRANSITION ================== */
var pageLoadTime = Date.now();
var SKELETON_MS = 1500;

function goToNextPage(url) {
  var loadingEl = document.getElementById('loadingState');
  var cardEl = document.querySelector('.card');
  var modalEl = document.querySelector('.modal');

  if (loadingEl && cardEl && modalEl) {
    /* Lock the popup frame before swapping its contents. The previous
       version let the skeleton's larger content change the modal height,
       which made the popup visibly stretch during the exit animation. */
    modalEl.classList.add('transitioning');
    cardEl.style.display = 'none';
    loadingEl.classList.add('active');
  }

  /* Keep the same smooth closing animation, but animate a stable-size frame. */
  setTimeout(function () {
    if (modalEl) {
      modalEl.classList.remove('enter');
      modalEl.classList.add('leave');
    }
  }, SKELETON_MS - 180);

  setTimeout(function () {
    window.location.href = url;
  }, SKELETON_MS);
}
