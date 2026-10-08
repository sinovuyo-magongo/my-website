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
  // ENQUIRY FORM — enquiry.html
  // Shows the user a response about cost and availability.
  // ============================================================
  const bookingForm = document.getElementById("booking-form");
  const bookingResponse = document.getElementById("booking-response");

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Run native HTML validation (required fields, valid email/date, etc.)
      if (!bookingForm.checkValidity()) {
        bookingForm.reportValidity();
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

      if (!quickForm.checkValidity()) {
        quickForm.reportValidity();
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

});