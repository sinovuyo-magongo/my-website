/* ============================================
   Prudiey Nails — Script
   Handles the mobile navigation toggle used on
   every page, plus a small confirmation message
   for the enquiry and contact forms (front-end
   only — no data is actually sent anywhere yet).
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {

  // Mobile nav toggle: shows/hides the nav links on small screens
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }

  // Mark the current page's nav link as active (matches the page URL)
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    if (link.getAttribute("href") === currentPage) {
      link.setAttribute("aria-current", "page");
    }
  });

  // Booking form (enquiry.html): simple front-end confirmation on submit
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Thanks! This form doesn't send anywhere yet, but in a real submission your booking request would be on its way.");
    });
  }

  // Quick message form (contact.html)
  const quickForm = document.querySelector(".quick-form");
  if (quickForm) {
    quickForm.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Thanks for your message! This form doesn't send anywhere yet, but it's ready to be connected up.");
    });
  }

});