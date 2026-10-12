# Preparation already completed

These changes apply to personal-site. Other repos do not need to copy every change.

- One shared root layout.
- One development runner for Next and Convex.
- A configuration check and test-only browser fixtures.
- Input validation, pending states, and useful login errors.
- Accessible logo dialogs, keyboard filters, and mobile navigation.
- A fallback icon for missing or broken logos.
- Résumé preview, open, and download links.
- Formatting, unit/backend tests, and browser checks.

## Development migration completed

- 14 logo records and one setting copied to Convex; counts match the exports.
- 14 logo files copied to Cloudflare Images.
- Convex résumé retrieval verified; local PDF fallback kept.
- Owner-only Convex Auth and protected routes implemented.
- Dashboard upload form added.
- Supabase data and source files preserved.

Typecheck, lint, formatting, unit/backend/component tests and browser checks passed. A normal build passed. A live local browser check verified all 14 Cloudflare images loaded, anonymous dashboard access redirected to login, owner setup was available, and the résumé response was a valid PDF.

**Next: test owner signout and uploading, then prepare the production settings.** Follow [PROJECT-NOTES.md](./PROJECT-NOTES.md). The public website has not been switched.
