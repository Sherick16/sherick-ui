# Searchable project list

Copy [`ResourceListExample.tsx`](ResourceListExample.tsx) and [`resources.css`](resources.css) into a React application. Load your host CSS before `sherick-ui/styles.css`. Replace the local project data and the marked create/archive handlers with your route or API calls; the example has no backend. Replace the sample `owner === "You"` check with your signed-in user's ID. The `Table` is presentational, so filtering and sorting stay in ordinary application state. Local search applies immediately (`debounceMs={0}`); for server-backed search, use `Search`'s debounce and loading props.

Run `bun run dev` and visit `/examples/resources` for the populated preview or `/examples/resources/empty` for a workspace with no projects. Pass `initialProjects={[]}` to see that state in another application.
