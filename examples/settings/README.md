# Workspace settings

Copy [`SettingsExample.tsx`](SettingsExample.tsx) and [`settings.css`](settings.css) into a React application. Load host CSS before `sherick-ui/styles.css`. The example saves to local state and simulates token revocation: replace those two marked handlers with your API calls, updating the saved baseline and success messages only after the server succeeds. Supply your real initial values and adapt the fields and consequence text to your product.

Run `bun run dev` and visit `/examples/settings` for the live preview. The source imports only public Sherick UI components, not the showcase.

The project-visibility choices use `RadioGroup appearance="surface"` (requires 2.2.0).
The option label composes ordinary supporting text and a Badge, with no radio-specific
metadata props or state selectors. The application still owns the draft/save/cancel model.

Surface-choice labels inherit the row ink, including their supporting copy; smaller type
and weight carry the hierarchy without losing contrast on the selected tint.
