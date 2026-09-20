# Freight Services — Figma extraction

Source: https://www.figma.com/design/u04EfuauE5NRpIju9CiKTo/PBL?node-id=2242-4936

- `content.json`: structured page content, quote form, testimonial, and footer/contact defaults.
- `design-context.txt`: complete reference layout, text, typography and original asset references from Figma (not production code).
- `metadata.xml`: complete node structure and coordinates.
- `reference.jpeg`: full original frame export.
- `assets/`: all 51 referenced image/vector assets plus four composed/individual exports.
- `originals/`: eight original uploaded source images, including hidden/alternate fills.
- `asset-manifest.json`: local file map. Production copies are in `public/images/freight-services/`.

## Seed

Run `npm run seed:freight` using Node 20.19+ and the existing `.env.local`. It seeds only Freight Services and the `services` form, registers the bundled images in the admin media library, and fills empty footer/contact defaults. Existing testimonials, form notification recipient and all other pages are preserved. Original records are backed up in the database's `contentseeds` collection.

Repeating the command refreshes bundled files but preserves admin edits. Explicitly passing `-- --replace` replaces the page/form with the extracted defaults again. Do not run that flag after editing content unless a reset is intended.

## Editing

Page tabs: Banner, About, Our Services, Happy Customers, Maps, Form, SEO. Testimonial entries remain in Globals → Testimonials; `featuredName` chooses which appears first. The full quote form is editable in Forms → Freight services enquiry. Bundled images can be replaced through the normal media picker or Cloudinary upload flow.

Sections use inline Tailwind; shared form and footer rules use the existing `forms.css` and `global-components.css`. There is no page-specific stylesheet.

## Design decisions / missing source data

- Figma supplies no open dropdown choices or required-field rules. Services mirror the ten displayed cards; load types are editable implementation defaults. Company name and free text are optional; contact/routing/date/load fields and consent are required.
- The exact source wording “Full & Load Parts” is retained. The footer's “PBK” copyright typo is corrected to “PBL”.
- Quote/contact calls to action point to the quote section. Existing navigation routes are reused.
- Figma contains social and legal labels but no destination URLs. No social URLs or legal pages were invented; existing configured social URLs render when provided.
- The map and next-day icon use the original exported vector layers, keeping transparent backgrounds and allowing replacement through the CMS.
- Testimonial content already in Globals was retained, including existing practice entries.
- Service cards use the shared `GlassCard`. Testimonials use the same 150-character preview helper and full-review modal as the homepage; Escape closes the modal and restores focus.
- Testimonial previews share one overlapping CSS grid row, sized by the tallest slide. Inactive slides are invisible, inert and hidden from assistive technology; carousel height stays stable without fixed pixel heights or resize listeners.

## Checks

`npm test` verifies content/admin coverage, assets, form normalisation and validation. Browser checks cover desktop/mobile layout, carousel, quote anchors, service choices and date selection. Empty submissions are checked against the real API; no live notification email is sent during QA.
