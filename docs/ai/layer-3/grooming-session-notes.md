# Grooming Session SPA Notes

- Session page and deck layout: `frontend/sprint-manager-spa/src/app/features/grooming/session/grooming-session-page.component.ts`.
- Weight card template and inline styles: `frontend/sprint-manager-spa/src/app/features/grooming/components/weight-card/weight-card.component.ts`.
- Ticket card template and inline styles: `frontend/sprint-manager-spa/src/app/features/grooming/components/ticket-card/ticket-card.component.ts`.
- Shared card asset selection: `frontend/sprint-manager-spa/src/app/features/grooming/components/card-asset-map.ts`.
- Weight-card test: `frontend/sprint-manager-spa/src/app/features/grooming/components/weight-card/weight-card.component.spec.ts`.

## Layout conventions

- Both cards use a 3D `.card-rotor` with separate front and back faces and image assets positioned with `object-fit: cover`.
- The ticket card defines a base width and height and applies a CSS scale through `.card-shell` and `.card-frame`.
- The session page controls deck-card width and centering, and supplies the deck stage minimum height.
- The weight-card component currently keeps all visual layout rules inline in its component stylesheet.

## Validation

Run `npm test -- --watch=false` or `npm run build` from `frontend/sprint-manager-spa`. For development, use `npm run start` or `npm run watch`.
