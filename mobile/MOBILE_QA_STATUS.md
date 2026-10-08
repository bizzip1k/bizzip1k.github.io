# BIZZIP Mobile QA Status

Checked: 2026-10-08 13:04 KST

## Protected approved snapshots
- mobile-approved-baseline-2026-10-08-1157
- mobile-detail-guides-approved-2026-10-08-1304
- mobile-readpages-approved-2026-10-08-1320

## Navigation QA
Checked the active mobile navigation chain:
- landing
- main menu destination pages
- 8 business category hubs
- 6 problem branches
- 44 business final guide pages
- content detail page
- resource detail pages

Result: no broken internal file links detected in the checked active paths.

## Page hierarchy rule
- Selection / intermediate pages: 2-column grid cards
- Final reading / explanation pages: vertical reading flow only
- Very narrow screens may fall back to 1 column for usability

## Protected UI
Do not revise approved landing, PC site, main mobile hubs, or intermediate-page layout unless explicitly reopened by the user.

## Legacy / orphan templates
These files are not referenced by the current menu flow or current mobile JavaScript:
- business-category.html
- business-guide.html
- problem-guide.html

Keep them untouched for now. Do not treat them as production pages unless the dynamic-template workflow is explicitly revived.
