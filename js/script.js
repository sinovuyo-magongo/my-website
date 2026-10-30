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

        bookingResponse.innerHTML =
        "<p><strong>Thanks — here's a summary of your request:</strong></p>" +
        "<p><strong>" + serviceName + "</strong> costs <strong>" + servicePrice + "</strong>.</p>" +
        "<p>Requested date: <strong>" + formattedDate + "</strong>, with <strong>" + technicianText + "</strong>.</p>" +
        availabilityNote;

      bookingResponse.hidden = false;
      bookingResponse.scrollIntoView({ behavior: "smooth", block: "center" });
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

});