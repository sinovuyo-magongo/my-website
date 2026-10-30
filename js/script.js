/* ============================================================
   Prudiey Nails — Script
   Handles the mobile navigation toggle used on every page.

   ENQUIRY FORM (enquiry.html): validates input, then displays a
   dynamic response showing the price of the selected service and
   the requested date — no backend, computed entirely client-side
   from the form's own data.

   CONTACT FORM (contact.html): validates input, then compiles the
   name, email, and message into an email (subject + body) and
   opens the user's email client via a mailto: link addressed to
   the salon's email, so the user can review and send it.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  // ---------- Mobile nav toggle ----------
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }
  
    // ---------- Prevent past dates on enquiry form ----------
  const dateInput = document.getElementById("date");
  if (dateInput) {
    dateInput.min = new Date().toISOString().split("T")[0];
  }

  // ---------- Mark current page's nav link as active ----------
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    if (link.getAttribute("href") === currentPage) {
      link.setAttribute("aria-current", "page");
    }
  });

  // ============================================================
  // FORM VALIDATION — shared by both forms
  // Checks every field with JavaScript and shows an error message
  // under any field that is empty or wrong, instead of relying on
  // the browser's default popup.
  // ============================================================

  // Message shown when a required field is left empty
  const requiredMessages = {
    "full-name": "Please enter your full name.",
    "phone": "Please enter your phone number.",
    "email": "Please enter your email address.",
    "service": "Please choose a service.",
    "date": "Please choose your preferred date.",
    "msg-name": "Please enter your name.",
    "msg-email": "Please enter your email address.",
    "msg-type": "Please select a message type.",
    "msg-text": "Please type your message."
  };

  // Returns an error message for a field, or "" if the field is fine
  function getErrorMessage(field) {
    const value = field.value.trim();

    // 1. Required but empty
    if (field.required && value === "") {
      return requiredMessages[field.id] || "This field is required.";
    }

    // Optional and empty is fine (e.g. technician, notes)
    if (value === "") {
      return "";
    }

    // 2. Rules for specific fields
    if (field.id === "full-name" || field.id === "msg-name") {
      if (value.length < 2) {
        return "Your name must be at least 2 characters long.";
      }
      if (!/^[A-Za-zÀ-ÿ' -]+$/.test(value)) {
        return "Names can only contain letters, spaces, hyphens and apostrophes.";
      }
    }

    if (field.id === "phone") {
      // Remove spaces, dashes and brackets, then expect 0XXXXXXXXX or +27XXXXXXXXX
      const digits = value.replace(/[\s\-()]/g, "");
      if (!/^(\+27|0)\d{9}$/.test(digits)) {
        return "Enter a valid South African number, e.g. 071 555 0182.";
      }
    }

    if (field.id === "email" || field.id === "msg-email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Enter a valid email address, e.g. name@example.com.";
      }
    }

    if (field.id === "date" && field.validity.rangeUnderflow) {
      return "Please choose today's date or a future date.";
    }

    if (field.id === "msg-text" && value.length < 10) {
      return "Please write at least 10 characters so we can help you properly.";
    }

    return "";
  }

  // Puts an error message under a field
  function showError(field, message) {
    clearError(field);
    const error = document.createElement("p");
    error.className = "field-error";
    error.id = field.id + "-error";
    error.textContent = message;
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", error.id);
    field.parentElement.appendChild(error);
  }

  // Removes a field's error message
  function clearError(field) {
    const existing = document.getElementById(field.id + "-error");
    if (existing) {
      existing.remove();
    }
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  }

  // Checks every field in a form. Returns true only if all are valid.
  function validateForm(form) {
    let firstInvalid = null;

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      const message = getErrorMessage(field);
      if (message) {
        showError(field, message);
        if (!firstInvalid) {
          firstInvalid = field;
        }
      } else {
        clearError(field);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus(); // jump the cursor to the first problem
    }
    return firstInvalid === null;
  }

  // Set up both forms: turn off the browser's own popups (we show our own)
  // and remove a field's error as soon as the user starts fixing it.
  document.querySelectorAll("#booking-form, .quick-form").forEach(function (form) {
    form.noValidate = true;
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("input", function () { clearError(field); });
      field.addEventListener("change", function () { clearError(field); });
    });
  });

  // ============================================================
  // ENQUIRY FORM — enquiry.html
  // Shows the user a response about cost and availability.
  // ============================================================
  const bookingForm = document.getElementById("booking-form");
  const bookingResponse = document.getElementById("booking-response");
  // Where the enquiry is sent. Replace YOUR_FORM_ID with your Formspree form ID.
  const ENQUIRY_ENDPOINT = "https://formspree.io/f/xoeenkgk";

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate every field; error messages appear under any invalid field
      if (!validateForm(bookingForm)) {
        return;
      }

      // Pull the selected service's visible text, e.g. "Gel manicure (R320)"
      const serviceSelect = document.getElementById("service");
      const serviceText = serviceSelect.options[serviceSelect.selectedIndex].text;

      // Extract the price from the option text
      const priceMatch = serviceText.match(/\(([^)]+)\)/); // captures "R320" or "from R150"
      const servicePrice = priceMatch ? priceMatch[1] : "a price to be confirmed";
      const serviceName = serviceText.split(" (")[0];

      // Format the requested date nicely
      const dateValue = document.getElementById("date").value;
      let formattedDate = "your selected date";
      if (dateValue) {
        const dateObj = new Date(dateValue + "T00:00:00");
        formattedDate = dateObj.toLocaleDateString("en-ZA", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      
      // Check the requested date against the studio's real opening hours (Sun & Mon closed)
      const requestedDay = new Date(dateValue + "T00:00:00").getDay(); // 0 = Sunday, 1 = Monday
      const isClosed = requestedDay === 0 || requestedDay === 1;
      const availabilityNote = isClosed
        ? "<p><strong>Note:</strong> the studio is closed on Sundays and Mondays — Prudiey will reach out to suggest the nearest available day.</p>"
        : "<p>This falls on a regular studio day, so availability is likely — Prudiey will confirm your exact time slot by WhatsApp or email within one business day.</p>";

      // Technician preference, for a slightly more tailored response
      const technicianSelect = document.getElementById("technician");
      const technicianText =
        technicianSelect.value === "none"
          ? "whoever is available"
          : technicianSelect.options[technicianSelect.selectedIndex].text;

              // The same summary as before, now shown once the request has been sent
      const summaryHTML =
        "<p><strong>Thanks — here's a summary of your request:</strong></p>" +
        "<p><strong>" + serviceName + "</strong> costs <strong>" + servicePrice + "</strong>.</p>" +
        "<p>Requested date: <strong>" + formattedDate + "</strong>, with <strong>" + technicianText + "</strong>.</p>" +
        availabilityNote;

      // The data that gets sent to the server
      const enquiryData = {
        _subject: "New booking enquiry: " + serviceName,
        name: document.getElementById("full-name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        service: serviceName + " (" + servicePrice + ")",
        date: formattedDate,
        technician: technicianText,
        notes: document.getElementById("notes").value.trim() || "None"
      };

      // Show the user something is happening and stop double-clicks
      const submitBtn = bookingForm.querySelector(".submit-btn");
      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      // AJAX: send the data in the background, no page reload
      fetch(ENQUIRY_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(enquiryData)
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Server responded with status " + response.status);
          }
          bookingResponse.innerHTML =
            "<p><strong>Your request has been sent.</strong></p>" + summaryHTML;
        })
        .catch(function () {
          bookingResponse.innerHTML =
            "<p><strong>Sorry, your request could not be sent.</strong></p>" +
            "<p>Please check your internet connection and try again, or message Prudiey on WhatsApp at +27 71 555 0182.</p>";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
          bookingResponse.hidden = false;
          bookingResponse.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });
  }

  // ============================================================
  // CONTACT FORM — contact.html
  // Compiles the message into an email and opens it via mailto:
  // so the user can review and send it from their own email client.
  // ============================================================
  const quickForm = document.querySelector(".quick-form");

  if (quickForm) {
    quickForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validate every field; error messages appear under any invalid field
      if (!validateForm(quickForm)) {
        return;
      }

const name = document.getElementById("msg-name").value.trim();
const email = document.getElementById("msg-email").value.trim();
const type = document.getElementById("msg-type").value;
const message = document.getElementById("msg-text").value.trim();

const recipient = "hello@prudieynails.co.za";
const subject = encodeURIComponent(type + " - website enquiry from " + name);
const body = encodeURIComponent(
  "Name: " + name + "\n" +
  "Email: " + email + "\n" +
  "Type of message: " + type + "\n\n" +
  "Message:\n" + message
);

      const mailtoLink = "mailto:" + recipient + "?subject=" + subject + "&body=" + body;

      // Opens the user's default email client with the message pre-filled,
      // addressed to the salon's email, ready for the user to send.
      window.location.href = mailtoLink;
    });
  }

  // ============================================================
  // GALLERY LIGHTBOX — index.html and about.html
  // Clicking a gallery image opens a larger copy in an overlay.
  // The overlay is built with DOM manipulation, so no extra HTML
  // is needed in the pages.
  // ============================================================
  const galleryImages = document.querySelectorAll(
    ".image-gallery img, .three-image-gallery img"
  );

  if (galleryImages.length > 0) {
    // Build the overlay once
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-label", "Enlarged image");
    lightbox.hidden = true;

    const lightboxImg = document.createElement("img");

    const closeBtn = document.createElement("button");
    closeBtn.className = "lightbox-close";
    closeBtn.textContent = "\u00D7"; // the × symbol
    closeBtn.setAttribute("aria-label", "Close enlarged image");

    lightbox.appendChild(closeBtn);
    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);

    function closeLightbox() {
      lightbox.hidden = true;
    }

    // Open: copy the clicked image into the overlay
    galleryImages.forEach(function (img) {
      img.addEventListener("click", function () {
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        lightbox.hidden = false;
      });
    });

    // Close: click the dark background or the × button
    lightbox.addEventListener("click", function (e) {
      if (e.target !== lightboxImg) {
        closeLightbox();
      }
    });

    // Close: press Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeLightbox();
      }
    });
  }

  // ============================================================
  // SERVICES SEARCH, FILTER AND SORT — services.html
  // The controls are built with JavaScript (DOM manipulation) and
  // work on the service cards that are already on the page.
  // ============================================================
  const servicesWrapper = document.querySelector(".services-wrapper");
  const serviceCategories = document.querySelectorAll(".service-category");

  if (servicesWrapper && serviceCategories.length > 0) {

    // Remember each card's original position so "Default order" can restore it
    document.querySelectorAll(".service-item").forEach(function (item, index) {
      item.dataset.order = index;
    });

    // ----- Build the controls -----
    const controls = document.createElement("div");
    controls.className = "service-controls";
    controls.innerHTML =
      '<div class="form-group">' +
        '<label for="service-search">Search services</label>' +
        '<input type="search" id="service-search" placeholder="e.g. gel, pedicure, acrylic">' +
      '</div>' +
      '<div class="form-group">' +
        '<label for="service-filter">Category</label>' +
        '<select id="service-filter"><option value="all">All categories</option></select>' +
      '</div>' +
      '<div class="form-group">' +
        '<label for="service-sort">Sort by</label>' +
        '<select id="service-sort">' +
          '<option value="default">Default order</option>' +
          '<option value="low">Price: low to high</option>' +
          '<option value="high">Price: high to low</option>' +
        '</select>' +
      '</div>';

    const searchInput = controls.querySelector("#service-search");
    const filterSelect = controls.querySelector("#service-filter");
    const sortSelect = controls.querySelector("#service-sort");

    // Fill the category dropdown from the headings already on the page
    serviceCategories.forEach(function (category, index) {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = category.querySelector("h2").textContent;
      filterSelect.appendChild(option);
    });

    // A line that tells the user how many results are showing
    const status = document.createElement("p");
    status.className = "service-status";
    status.setAttribute("aria-live", "polite");

    // Put the controls above the first category
    servicesWrapper.insertBefore(controls, serviceCategories[0]);
    servicesWrapper.insertBefore(status, serviceCategories[0]);

    // ----- Helper: turn "R320" or "from R150" into the number 320 / 150 -----
    function getPrice(item) {
      const text = item.querySelector(".price").textContent;
      const number = parseInt(text.replace(/[^0-9]/g, ""), 10);
      return isNaN(number) ? 0 : number;
    }

    // ----- Apply search, filter and sort -----
    function updateServices() {
      const query = searchInput.value.trim().toLowerCase();
      const chosenCategory = filterSelect.value;
      const sortMode = sortSelect.value;
      let visibleCount = 0;

      serviceCategories.forEach(function (category, index) {
        const items = Array.from(category.querySelectorAll(".service-item"));

        // Sort the cards inside this category
        items.sort(function (a, b) {
          if (sortMode === "low") { return getPrice(a) - getPrice(b); }
          if (sortMode === "high") { return getPrice(b) - getPrice(a); }
          return a.dataset.order - b.dataset.order;
        });
        items.forEach(function (item) { category.appendChild(item); });

        // Search: show only cards whose text contains the search words
        let matchesInCategory = 0;
        items.forEach(function (item) {
          const matches = item.textContent.toLowerCase().includes(query);
          item.hidden = !matches;
          if (matches) { matchesInCategory++; }
        });

        // Filter: hide the whole category if it was not chosen or has no matches
        const categoryAllowed =
          chosenCategory === "all" || chosenCategory === String(index);
        category.hidden = !categoryAllowed || matchesInCategory === 0;

        if (!category.hidden) { visibleCount += matchesInCategory; }
      });

      // Tell the user what is showing
      if (visibleCount === 0) {
        status.textContent = "No services match your search. Try a different word or category.";
      } else {
        status.textContent =
          "Showing " + visibleCount + (visibleCount === 1 ? " service." : " services.");
      }
    }

    searchInput.addEventListener("input", updateServices);
    filterSelect.addEventListener("change", updateServices);
    sortSelect.addEventListener("change", updateServices);

    updateServices(); // run once so the count shows on page load
  }
    // ============================================================
  // SERVICE DETAILS MODAL — services.html
  // Clicking a service card opens a popup built from the card's own
  // text (name, description, price) with a button to book it.
  // ============================================================
  const serviceCards = document.querySelectorAll(".service-item");

  if (serviceCards.length > 0) {
    // Build the popup once
    const modal = document.createElement("div");
    modal.className = "service-modal";
    modal.hidden = true;
    modal.innerHTML =
      '<div class="service-modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
        '<button class="lightbox-close" aria-label="Close service details">\u00D7</button>' +
        '<h3>Service details</h3>' +
        '<h2 id="modal-title"></h2>' +
        '<p class="modal-description"></p>' +
        '<p class="modal-price"></p>' +
        '<a class="cta-link modal-book">Book this service</a>' +
      '</div>';
    document.body.appendChild(modal);

    const modalClose = modal.querySelector(".lightbox-close");
    const modalTitle = modal.querySelector("#modal-title");
    const modalDescription = modal.querySelector(".modal-description");
    const modalPrice = modal.querySelector(".modal-price");
    const modalBook = modal.querySelector(".modal-book");
    let lastFocused = null;

    function openModal(card) {
      const name = card.querySelector("h4").textContent;
      modalTitle.textContent = name;
      modalDescription.textContent = card.querySelector(".service-info p").textContent;
      modalPrice.textContent = card.querySelector(".price").textContent;
      modalBook.href = "enquiry.html?service=" + encodeURIComponent(name);

      lastFocused = card;
      modal.hidden = false;
      document.body.style.overflow = "hidden"; // stop the page scrolling behind
      modalClose.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused) { lastFocused.focus(); } // return to the card that was clicked
    }

    // Make every card clickable, and usable with the keyboard
    serviceCards.forEach(function (card) {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.addEventListener("click", function () { openModal(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card);
        }
      });
    });

    // Close: × button, click on the dark background, or Escape
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) { closeModal(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) { closeModal(); }
    });

    // Keep Tab inside the popup while it is open
    modal.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") { return; }
      if (e.shiftKey && document.activeElement === modalClose) {
        e.preventDefault();
        modalBook.focus();
      } else if (!e.shiftKey && document.activeElement === modalBook) {
        e.preventDefault();
        modalClose.focus();
      }
    });
  }
  // ----- Pre-select the service chosen on the Services page -----
  const serviceDropdown = document.getElementById("service");

  if (serviceDropdown) {
    const requestedService = new URLSearchParams(window.location.search).get("service");

    if (requestedService) {
      Array.from(serviceDropdown.options).forEach(function (option) {
        // Option text looks like "Gel manicure (R320)" so compare only the name part
        if (option.text.split(" (")[0].toLowerCase() === requestedService.toLowerCase()) {
          serviceDropdown.value = option.value;
        }
      });
    }
  }

    // ============================================================
  // INTERACTIVE SERVICE-AREA MAP — contact.html
  // Uses the Leaflet library with OpenStreetMap tiles. Circles show
  // the general service areas only (no exact address, for privacy).
  // ============================================================
  const mapElement = document.getElementById("service-map");

  if (mapElement && typeof L !== "undefined") {

    const serviceAreas = [
      { name: "Fichardt Park", lat: -29.1489, lng: 26.1592 },
      { name: "Universitas",   lat: -29.1057, lng: 26.1848 }
    ];

    // Create the map. On phones, one-finger dragging is switched off so
    // the page can still be scrolled when a finger lands on the map.
    const map = L.map(mapElement, {
      scrollWheelZoom: false,
      dragging: !L.Browser.mobile
    }).setView([-29.127, 26.172], 12);

    // The map picture itself
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Draw one circle per service area, in the site's colours
    const areaGroup = L.featureGroup();
    const areaCircles = {};

    serviceAreas.forEach(function (area) {
      const circle = L.circle([area.lat, area.lng], {
        radius: 1200,
        color: "#b76e79",      // rose gold outline
        fillColor: "#f7cad0",  // blush pink fill
        fillOpacity: 0.5,
        weight: 2
      });
      circle.bindPopup(
        "<strong>" + area.name + "</strong><br>" +
        "General service area. The exact address is shared once your booking is confirmed."
      );
      circle.addTo(areaGroup);
      areaCircles[area.name] = circle;
    });

    areaGroup.addTo(map);
    map.fitBounds(areaGroup.getBounds().pad(0.3));

    // Buttons that fly the map to each area
    const mapControls = document.createElement("div");
    mapControls.className = "map-controls";

    function addMapButton(label, action) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "submit-btn";
      button.textContent = label;
      button.addEventListener("click", action);
      mapControls.appendChild(button);
    }

    addMapButton("Show both areas", function () {
      map.closePopup();
      map.flyToBounds(areaGroup.getBounds().pad(0.3));
    });

    serviceAreas.forEach(function (area) {
      addMapButton(area.name, function () {
        const circle = areaCircles[area.name];
        map.flyToBounds(circle.getBounds().pad(0.4));
        circle.openPopup();
      });
    });

    mapElement.parentNode.insertBefore(mapControls, mapElement);

  } else if (mapElement) {
    // Leaflet did not load (for example, no internet): hide the empty box.
    // The Google maps below the section still work as a fallback.
    mapElement.hidden = true;
  }

});