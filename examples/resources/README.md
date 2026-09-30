# Searchable project list

Copy [`ResourceListExample.tsx`](ResourceListExample.tsx) and [`resources.css`](resources.css) into a React application using **Sherick UI 2.2.0 or newer**. Load host CSS before `sherick-ui/styles.css`, then the example's overrides. This example has no backend: each read settles after 500 ms, and `failAttempt` can fail one numbered read. Replace that simulation with your application's data owner; query keys, cancellation, stale-data policy, sorting, filters, pagination and mutations remain application concerns.

The same `TableColumn[]` and native `tableClassName` supply loaded and placeholder column geometry. `Skeleton` supplies only the cell bars. Widths and minimum width are ordinary CSS. First load announces loading; a refresh keeps the successful content and filters visible; a failed read offers one retry. A dataset with no projects offers creation, while filtered-empty results offer clearing.

`Input type="search"` applies local filtering immediately through `onValueChange`. Use `Search` when `onSearch` is a meaningful submission/debounce boundary, for example committing a server query; do not add a no-op submit callback for immediate filtering. The status popover contains visibly labelled checkboxes, and its selected-filter summary stays visible after the popover closes. Clearing filters resets the whole filter set. The toolbar wraps independently of the table's local scroller.

Preview routes:

- `/examples/resources`: first load, filtering, sorting, pagination and retained-content refresh.
- `/examples/resources/empty`: truly empty dataset (`initialProjects={[]}`).
- `/examples/resources/failure`: failed first read, then successful retry (`failAttempt={1}`).
- `/examples/resources/refresh-failure`: first refresh fails while content remains (`failAttempt={2}`).

Replace sample `owner === "You"` checks with the signed-in user's ID and the marked create/archive handlers with your route or API calls. Successful reads and mutations must reflect the application's actual persistence; the preview timer is not a query-state library.
