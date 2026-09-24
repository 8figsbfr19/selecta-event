(function () {
  "use strict";

  /* ---------------- Countdown ---------------- */

  var TARGET_HOUR = 21;
  var TARGET_MINUTE = 59;
  var CALGARY_TZ = "America/Edmonton";

  function getCalgaryDateParts(date) {
    var fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: CALGARY_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    var parts = {};
    fmt.formatToParts(date).forEach(function (p) {
      parts[p.type] = p.value;
    });
    return parts;
  }

  function getCalgaryUtcOffsetMinutes(date) {
    // Difference between UTC wall time and Calgary wall time, in minutes.
    var parts = getCalgaryDateParts(date);
    var asUTC = Date.UTC(
      parseInt(parts.year, 10),
      parseInt(parts.month, 10) - 1,
      parseInt(parts.day, 10),
      parseInt(parts.hour, 10),
      parseInt(parts.minute, 10),
      parseInt(parts.second, 10)
    );
    return Math.round((asUTC - date.getTime()) / 60000);
  }

  function getTonightTarget() {
    var now = new Date();
    var parts = getCalgaryDateParts(now);
    var offsetMinutes = getCalgaryUtcOffsetMinutes(now);

    var targetUTC = Date.UTC(
      parseInt(parts.year, 10),
      parseInt(parts.month, 10) - 1,
      parseInt(parts.day, 10),
      TARGET_HOUR,
      TARGET_MINUTE,
      0
    ) - offsetMinutes * 60000;

    return new Date(targetUTC);
  }

  var target = getTonightTarget();

  var hoursEl = document.getElementById("hours");
  var minutesEl = document.getElementById("minutes");
  var secondsEl = document.getElementById("seconds");
  var captionEl = document.getElementById("countdown-caption");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    var now = new Date();
    var diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      captionEl.textContent = "The celebration has begun — Melkam Addis Amet!";
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var h = Math.floor(totalSeconds / 3600);
    var m = Math.floor((totalSeconds % 3600) / 60);
    var s = totalSeconds % 60;

    hoursEl.textContent = pad(h);
    minutesEl.textContent = pad(m);
    secondsEl.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);

  /* ---------------- Adey Abeba flower field ---------------- */

  var FLOWER_COUNT = 16;
  var field = document.getElementById("flower-field");

  function flowerSVG(size) {
    var petalColorA = "#f6dd8a";
    var petalColorB = "#e6c15c";
    var centerColor = "#b8892f";
    var petals = "";
    var petalCount = 6;
    for (var i = 0; i < petalCount; i++) {
      var angle = (360 / petalCount) * i;
      petals +=
        '<ellipse cx="0" cy="-9" rx="4.2" ry="9" ' +
        'transform="rotate(' + angle + ')" ' +
        'fill="url(#petalGrad)" />';
    }
    return (
      '<svg width="' + size + '" height="' + size + '" viewBox="-16 -16 32 32" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="' + petalColorA + '" />' +
            '<stop offset="100%" stop-color="' + petalColorB + '" />' +
          '</linearGradient>' +
        '</defs>' +
        '<g>' + petals + '</g>' +
        '<circle cx="0" cy="0" r="3.4" fill="' + centerColor + '" />' +
      '</svg>'
    );
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function spawnFlowers() {
    if (!field) return;
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < FLOWER_COUNT; i++) {
      var wrap = document.createElement("div");
      wrap.className = "flower";

      var size = randomBetween(16, 32);
      var left = randomBetween(2, 96);
      var duration = randomBetween(16, 30);
      var delay = randomBetween(-30, 5);
      var drift = randomBetween(-60, 60);
      var opacity = randomBetween(0.35, 0.85);
      var scale = randomBetween(0.8, 1.3);

      wrap.style.left = left + "%";
      wrap.style.animationDuration = duration + "s";
      wrap.style.animationDelay = delay + "s";
      wrap.style.setProperty("--drift", drift + "px");
      wrap.style.setProperty("--o", opacity);
      wrap.style.setProperty("--s", scale);
      wrap.innerHTML = flowerSVG(size);

      fragment.appendChild(wrap);
    }

    field.appendChild(fragment);
  }

  spawnFlowers();
})();
