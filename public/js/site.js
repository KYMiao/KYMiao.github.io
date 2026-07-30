(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var openingTimer = 0;

  function playOpening() {
    var opener = document.querySelector(".opening");
    if (!opener || reducedMotion) return;
    opener.classList.remove("is-playing");
    void opener.offsetWidth;
    opener.classList.add("is-playing");
  }

  function setMenu(open) {
    var body = document.body;
    var menu = document.getElementById("site-menu");
    var menuToggle = document.querySelector(".menu-toggle");
    if (!menu || !menuToggle) return;

    menuToggle.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    menu.inert = !open;
    body.classList.toggle("menu-open", open);

    if (open) {
      requestAnimationFrame(function () {
        menu.focus({ preventScroll: true });
      });
    }
  }

  function initReveal() {
    var elements = document.querySelectorAll("[data-reveal]");

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(function (element) {
        element.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function getSunEvent(date, latitude, longitude, sunrise) {
    var zenith = 90.833;
    var start = new Date(date.getFullYear(), 0, 0);
    var day = Math.floor((date - start) / 86400000);
    var lngHour = longitude / 15;
    var t = day + ((sunrise ? 6 : 18) - lngHour) / 24;
    var meanAnomaly = (0.9856 * t) - 3.289;
    var trueLongitude = meanAnomaly + (1.916 * Math.sin(meanAnomaly * Math.PI / 180)) + (0.02 * Math.sin(2 * meanAnomaly * Math.PI / 180)) + 282.634;
    trueLongitude = (trueLongitude + 360) % 360;

    var rightAscension = Math.atan(0.91764 * Math.tan(trueLongitude * Math.PI / 180)) * 180 / Math.PI;
    rightAscension = (rightAscension + 360) % 360;
    rightAscension += Math.floor(trueLongitude / 90) * 90 - Math.floor(rightAscension / 90) * 90;
    rightAscension /= 15;

    var sinDeclination = 0.39782 * Math.sin(trueLongitude * Math.PI / 180);
    var cosDeclination = Math.cos(Math.asin(sinDeclination));
    var cosHour = (Math.cos(zenith * Math.PI / 180) - (sinDeclination * Math.sin(latitude * Math.PI / 180))) / (cosDeclination * Math.cos(latitude * Math.PI / 180));

    if (cosHour > 1 || cosHour < -1) return null;

    var hourAngle = sunrise ? 360 - Math.acos(cosHour) * 180 / Math.PI : Math.acos(cosHour) * 180 / Math.PI;
    hourAngle /= 15;

    var localMeanTime = hourAngle + rightAscension - (0.06571 * t) - 6.622;
    var utcHour = (localMeanTime - lngHour + 24) % 24;
    var eventDate = new Date(date);
    eventDate.setUTCHours(Math.floor(utcHour), Math.round((utcHour % 1) * 60), 0, 0);
    return eventDate;
  }

  function initTheme() {
    var now = new Date();
    var latitude = 51.752;
    var longitude = -1.2577;
    var sunrise = getSunEvent(now, latitude, longitude, true);
    var sunset = getSunEvent(now, latitude, longitude, false);
    var isDay = sunrise && sunset ? now >= sunrise && now < sunset : now.getHours() >= 7 && now.getHours() < 20;
    document.body.classList.toggle("theme-day", isDay);
    document.body.classList.toggle("theme-night", isDay === false);
  }

  function initCursor() {
    if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

    var cursor = document.querySelector(".cursor-orb");
    if (!cursor) {
      cursor = document.createElement("div");
      cursor.className = "cursor-orb";
      document.body.appendChild(cursor);
    }

    document.onmousemove = function (event) {
      cursor.classList.add("is-active");
      cursor.style.transform = "translate3d(" + event.clientX + "px, " + event.clientY + "px, 0) translate(-50%, -50%)";
    };

    document.onmouseover = function (event) {
      cursor.classList.toggle("is-link", Boolean(event.target.closest("a, button")));
    };

    document.onmouseleave = function () {
      cursor.classList.remove("is-active");
    };
  }

  function ensureLightbox() {
    var overlay = document.querySelector(".photo-lightbox");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "photo-lightbox";
      overlay.setAttribute("aria-hidden", "true");
      overlay.innerHTML =
        '<button class="photo-lightbox-close" type="button" aria-label="Close image viewer">Close</button>' +
        '<button class="photo-lightbox-nav prev" type="button" aria-label="Previous image"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>' +
        '<figure><img alt="" /><figcaption></figcaption></figure>' +
        '<button class="photo-lightbox-nav next" type="button" aria-label="Next image"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>' +
        '<div class="photo-lightbox-meta">' +
          '<div class="photo-lightbox-row">' +
            '<div class="photo-lightbox-count"></div>' +
          '</div>' +
          '<div class="photo-lightbox-strip" aria-label="Gallery thumbnails"></div>' +
        '</div>';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function initLightbox() {
    var active = 0;

    function items() {
      return Array.prototype.slice.call(document.querySelectorAll("[data-lightbox-item]"));
    }

    function elements() {
      var overlay = ensureLightbox();
      return {
        overlay: overlay,
        image: overlay.querySelector("img"),
        caption: overlay.querySelector("figcaption"),
        count: overlay.querySelector(".photo-lightbox-count"),
        strip: overlay.querySelector(".photo-lightbox-strip"),
        close: overlay.querySelector(".photo-lightbox-close"),
        prev: overlay.querySelector(".prev"),
        next: overlay.querySelector(".next")
      };
    }

    function renderStrip(ui, list) {
      ui.strip.innerHTML = "";
      list.forEach(function (entry, index) {
        var button = document.createElement("button");
        var image = document.createElement("img");
        var src = entry.getAttribute("href");
        button.type = "button";
        button.className = "photo-lightbox-thumb";
        button.setAttribute("aria-label", "Open image " + String(index + 1));
        button.setAttribute("aria-current", index === active ? "true" : "false");
        image.src = src;
        image.alt = entry.dataset.caption || "";
        button.appendChild(image);
        button.onclick = function () {
          active = index;
          render();
        };
        ui.strip.appendChild(button);
      });

      var activeThumb = ui.strip.querySelector('[aria-current="true"]');
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }

    function render() {
      var ui = elements();
      var list = items();
      var item = list[active];
      if (!item) return;
      var photoId = item.getAttribute("href");
      ui.overlay.dataset.photoId = photoId;
      ui.image.src = photoId;
      ui.image.alt = item.dataset.caption || "";
      ui.caption.textContent = item.dataset.caption || "";
      ui.count.textContent = String(active + 1).padStart(2, "0") + " / " + String(list.length).padStart(2, "0");
      renderStrip(ui, list);
    }

    function open(index) {
      var ui = elements();
      active = index;
      render();
      ui.overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      bindLightboxControls();
      ui.next.focus({ preventScroll: true });
    }

    function closeBox() {
      var overlay = document.querySelector(".photo-lightbox");
      if (overlay) overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
    }

    function move(delta) {
      var list = items();
      if (!list.length) return;
      active = (active + delta + list.length) % list.length;
      render();
    }

    function bindLightboxControls() {
      var ui = elements();
      ui.close.onclick = closeBox;
      ui.prev.onclick = function () { move(-1); };
      ui.next.onclick = function () { move(1); };
      ui.overlay.onclick = function (event) {
        if (event.target === ui.overlay) closeBox();
      };
    }

    bindLightboxControls();

    window.__kmOpenLightbox = open;
    window.__kmMoveLightbox = move;
    window.__kmCloseLightbox = closeBox;

    if (!window.__kmLightboxReady) {
      window.__kmLightboxReady = true;

      document.addEventListener("click", function (event) {
        var item = event.target.closest("[data-lightbox-item]");
        if (!item) return;
        var list = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox-item]"));
        var index = list.indexOf(item);
        if (index < 0) return;
        event.preventDefault();
        window.__kmOpenLightbox(index);
      }, true);

      document.addEventListener("keydown", function (event) {
        var currentOverlay = document.querySelector(".photo-lightbox");
        if (!currentOverlay || currentOverlay.getAttribute("aria-hidden") === "true") {
          return;
        }
        if (event.key === "Escape") window.__kmCloseLightbox();
        if (event.key === "ArrowLeft") window.__kmMoveLightbox(-1);
        if (event.key === "ArrowRight") window.__kmMoveLightbox(1);
      });
    }
  }

  function initPhotoProtection() {
    if (!document.body.classList.contains("photo-page")) return;

    document.querySelectorAll("body.photo-page img").forEach(function (image) {
      image.draggable = false;
      image.setAttribute("draggable", "false");
    });

    if (window.__kmPhotoProtectionReady) return;
    window.__kmPhotoProtectionReady = true;

    document.addEventListener("contextmenu", function (event) {
      if (!event.target.closest("body.photo-page img, body.photo-page [data-lightbox-item], .photo-lightbox")) return;
      event.preventDefault();
    }, true);

    document.addEventListener("dragstart", function (event) {
      if (!event.target.closest("body.photo-page img")) return;
      event.preventDefault();
    }, true);

    document.addEventListener("keydown", function (event) {
      if (!document.body.classList.contains("photo-page")) return;
      var key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && (key === "s" || key === "u")) {
        event.preventDefault();
      }
    }, true);
  }

  function updateBackToTop() {
    var button = document.querySelector(".back-to-top");
    if (!button) return;
    button.classList.toggle("is-visible", window.scrollY > Math.min(420, window.innerHeight * 0.55));
  }

  function initBackToTop() {
    var button = document.querySelector(".back-to-top");
    if (!button) return;

    button.onclick = function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    };

    updateBackToTop();
    if (!window.__kmBackToTopReady) {
      window.__kmBackToTopReady = true;
      window.addEventListener("scroll", updateBackToTop, { passive: true });
      window.addEventListener("resize", updateBackToTop);
    }
  }

  function init() {
    var menuToggle = document.querySelector(".menu-toggle");
    var menu = document.getElementById("site-menu");
    var replay = document.querySelector(".replay-opening");

    if (menuToggle) {
      menuToggle.onclick = function () {
        setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
      };
    }

    if (menu) {
      menu.onclick = function (event) {
        if (event.target.closest("a")) {
          setMenu(false);
          return;
        }
        if (event.target === menu) {
          window.location.href = "/";
        }
      };
    }

    if (replay) {
      replay.onclick = playOpening;
    }

    setMenu(false);
    initTheme();
    initReveal();
    initCursor();
    initLightbox();
    initPhotoProtection();
    initBackToTop();

    if (!window.__kmOpeningPlayed) {
      window.__kmOpeningPlayed = true;
      window.clearTimeout(openingTimer);
      openingTimer = window.setTimeout(playOpening, 120);
    }
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setMenu(false);
  });

  document.addEventListener("astro:page-load", init);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
