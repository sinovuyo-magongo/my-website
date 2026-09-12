# Website Project: Prudie Nails

## Student Information
- **Name:** Sinovuyo Magongo
- **Student Number:** ST10481104
- **Course:** WED Development/ WEDE5020

---

## Project Overview
This project is a multi-page business website designed for **Prudie Nails**, a home-based nail salon operating out of Bloemfontein. The purpose of the website is to establish an online presence, showcase nail work, share professional history, and give clients a general idea of service coverage areas.

---

## Goals & Features
- **Professional Brand Presence:** To move from social media only to a dedicated business portfolio website.
- **Client Education:** Clearly explain salon history and operational focus.
- **Location Awareness:** Provide generalized interactive location maps representing the Fichardt Park and Universitas service sectors.
- **Clean Navigation:** An easy-to-use menu linking the structural components together seamlessly.

---

## Part 1 Submission Details
This submission delivers the fundamental layout structure, containing:
- Core folder structuring including `css/`, `images/`, `js/`, and `pages/`.
- Valid content formatting for semantic markup flow.
- Configured file routing structures linking individual core components.

---

## Project Timeline
- **Week 1:** Initialize repository structure and set up local file folders.
- **Week 2:** Create foundational skeleton schemas (`index.html`, `about.html`, `services.html`, `contact.html`).
- **Week 3:** Implement styling parameters, clean up assets, embedded functional content maps.
- **Week 4:** Finalize README documentation layout, test linkages, push verified build to GitHub.

---

## Website Sitemap
- `index.html` (Home / Landing Dashboard)
- `pages/`
  - `about.html` (History, Brand Narrative, Team Showcase)
  - `services.html` (Treatment Information and Catalog Listings)
  - `enquiry.html` (Booking Requests and Intake Communication)
  - `contact.html` (Location Overviews and Social Directories)

---

## Changelog
- **Initial Setup:** Generated foundational empty workspace with initial default `README.md`.
- **Core Update:** Populated folder architectures (`css`, `js`, `images`, `pages`) with active layout documents.
- **Content Expansion:** Drafted internal semantic sections for `about.html` and configured map integrations on `contact.html`.

---

## References
- Code practices based on technical layout lessons supplied by course lecturers.
- Map integrations sourced live using iframe templates from [Google Maps](https://google.com).
- Built structural styles and layouts using standard responsive development methodologies.
-
### Part 1 Corrections
- Fixed missing CSS link and script reference on index.html.
- Standardised script.js path across all pages (was inconsistent, causing 404s on some pages).
- Removed invalid stray <script> tag inside script.js that broke the file.
- Fixed unclosed <div> in index.html (.recent-sets-section).
- Fixed broken nested map markup and duplicate closing tag in contact.html.
- Fixed dead "Book Now" links pointing to non-existent book.html; now point to enquiry.html.

### Part 2 Additions
- Created external stylesheet (css/style.css) linked across all pages.
- Applied base styles, typography (Playfair Display + Lato), and colour scheme (blush pink, rose gold, cream, charcoal).
- Implemented Flexbox/Grid layouts for nav, galleries, service items, and contact details.
- Added hover/focus/active states on buttons, nav links, and service items.
- Added responsive breakpoints at 768px (tablet) and 480px (mobile), with mobile nav toggle.
- Added wireframes for all five site pages (home, about, services, enquiry, contact) — previously missing from Part 1 submission.