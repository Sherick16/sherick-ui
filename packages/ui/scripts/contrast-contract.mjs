/**
 * The contrast contract.
 *
 * One canonical home for the colour math and one canonical description of the compositions the
 * design system actually renders. `scripts/smoke-package.mjs` runs it against the values in the
 * published `dist/theme.css`; nothing else in the repository re-implements either half.
 *
 * Three rules shape this file:
 *
 * 1. **Measure compositions, not token pairs.** Every entry names a role, the requirement it answers
 *    to, and the chain of fills that produces the colour a reader actually sees. A state layer is a
 *    `::before` painted in `currentColor` at an opacity over the control's own fill, so hover and
 *    pressed states move the *background* toward the label while the label itself is untouched:
 *    `foreground vs composite(currentColor, alpha, composite(tint, alpha, surface))`. A contract
 *    built from resting token pairs misses that, and a tonal control that measures 4.5:1 at rest can
 *    fall below the requirement while it is being used.
 * 2. **Measure the roles the language permits.** The matrix is organised by what the design language
 *    allows: text roles on surfaces, semantic foregrounds on their own tint and through their
 *    interactive states, on-colours on strong fills, meaningful marks, the detail role, and the
 *    focus indicator against every surface and every fill an inset ring is drawn over.
 * 3. **Name the role in every id.** A composition that spans several semantic roles emits one entry
 *    per role, so a failure names the accent that causes it and a single accent can be solved on its
 *    own. Ids are part of the report a reviewer reads.
 *
 * WCAG asks 4.5:1 of text and 3:1 of the non-text information that identifies a control or its
 * state. Disabled controls are exempt as inactive components; nothing here relies on that exemption
 * for an enabled state.
 */

/* ---------------------------------------------------------------------------------------------
   Colour math
   --------------------------------------------------------------------------------------------- */

/** A token value (`L C H`) as encoded sRGB, the space a browser composites in. */
export const oklchToSrgb = (value) => {
  const [lightness, chroma, hue] = value.trim().split(/\s+/).map(Number);
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => {
    const encoded = channel <= 0.0031308 ? 12.92 * channel : 1.055 * Math.max(channel, 0) ** (1 / 2.4) - 0.055;
    return Math.min(1, Math.max(0, encoded));
  });
};

/** A token value as encoded sRGB: bare OKLCH (`L C H`), wrapped `oklch(...)`, or `#rrggbb`. */
const hexToSrgb = (value) => {
  const hex = value.trim().replace(/^#/, "");
  const expanded = hex.length === 3 ? [...hex].map((character) => character + character).join("") : hex;
  return [0, 2, 4].map((index) => parseInt(expanded.slice(index, index + 2), 16) / 255);
};
export const parseColour = (value) => {
  const trimmed = value.trim();
  if (trimmed.startsWith("#")) return hexToSrgb(trimmed);
  return oklchToSrgb(trimmed.replace(/^oklch\(/, "").replace(/\)$/, ""));
};

const relativeLuminance = ([red, green, blue]) => {
  const linear = (channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
};

export const contrastRatio = (foreground, background) => {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

/** A translucent fill composited over the surface beneath it. */
export const composite = (top, alpha, bottom) => top.map((channel, index) => channel * alpha + bottom[index] * (1 - alpha));

export const WCAG_TEXT = 4.5;
export const WCAG_NON_TEXT = 3;

/* ---------------------------------------------------------------------------------------------
   The alphas the recipes actually use
   --------------------------------------------------------------------------------------------- */

/* The contrast model does not restate the authored alphas. `contrastCompositions` is given the
   state, tint and field steps from `recipeAlphas` — which `ui.common.ts` derives from the
   published recipes — and it reads the acrylic fills and the identifying wall of `elevation-well`
   from the theme variables themselves. A recipe change therefore moves the measurement with it
   instead of leaving a second handwritten copy behind. */

const SEMANTIC = ["primary", "danger", "warning", "success"];
/** The opaque fill each semantic role takes: `primary` has a deeper fill token, the others are their own fill. */
const opaqueFill = (name) => (name === "primary" ? "primary-strong" : name);

/* ---------------------------------------------------------------------------------------------
   The contract
   --------------------------------------------------------------------------------------------- */

/**
 * @param {Record<string, string>} variables the `--sui-*` values of one theme
 * @returns {Array<{id: string, requirement: number, note: string, checks: Array<[string, number[], number[]]>}>}
 */
export const contrastCompositions = (variables, alphas) => {
  const STATE = alphas.state;
  const TINT = alphas.tint;
  const FIELD = alphas.field;
  const colour = (name) => parseColour(variables[`--sui-${name}`]);

  /* The identifying wall of `elevation-well`. The design rule is that a well deepens exactly one
     of `recessed`'s two walls, so the layer with the greatest alpha is the wall the contract
     measures, and its tone comes from the same token rather than from a second list. The rendered
     proof that this wall clears 3:1 as painted lives in the browser suite; this is the authored
     model. */
  const WELL = (() => {
    const token = String(variables["--sui-elevation-well"] ?? "");
    const walls = [...token.matchAll(/var\(--sui-([a-z-]+)\)\s*\/\s*([\d.]+)/g)].map(([, tone, alpha]) => ({ tone, alpha: Number(alpha) }));
    if (walls.length === 0) throw new Error("elevation-well has no measurable wall");
    return walls.reduce((deepest, wall) => (wall.alpha > deepest.alpha ? wall : deepest));
  })();

  const canvas = colour("canvas");
  const surface = colour("surface");
  const surfaceHigh = colour("surface-high");
  const surfaceFloat = colour("surface-float");
  const surfaceOverlay = colour("surface-overlay");

  /* Every surface a component composites a fill over. An *opaque fill* is not a surface: the neutral
     fill a `secondary` control takes is listed where it is actually used. The acrylic fills are read
     from the theme's own `--sui-glass-*` / `--sui-overlay-fill` values; the code well is the
     `material.matte` shell a `CodeBlock` wears with its own `bg-sherick-canvas/[0.28]` code fill
     over it. */
  const ACRYLIC = "acrylic sheet";
  const ACRYLIC_DENSE = "acrylic dense / tooltip";
  const HERO_SHEET = "hero sheet / dialog";
  const CODE_WELL = "code well";
  const acrylicFill = Number(variables["--sui-glass-fill"]);
  const acrylicDenseFill = Number(variables["--sui-glass-dense-fill"]);
  const overlayFill = Number(variables["--sui-overlay-fill"]);
  const codeWell = composite(canvas, 0.28, composite(surface, FIELD.card, canvas));
  const surfaces = {
    canvas,
    "quiet well": composite(surface, FIELD.quiet, canvas),
    "matte card": composite(surface, FIELD.card, canvas),
    "chip at rest": composite(surfaceHigh, TINT.neutralRest, canvas),
    "field": composite(surfaceHigh, FIELD.control, canvas),
    /* An empty mark sits in the *opaque* neutral well, the same one a Switch's track sits in. */
    "empty mark well": surfaceHigh,
    "field hover": composite(surfaceHigh, FIELD.hover, canvas),
    "engaged field": composite(surfaceHigh, FIELD.engaged, canvas),
    [CODE_WELL]: codeWell,
    [ACRYLIC]: composite(surfaceFloat, acrylicFill, canvas),
    [ACRYLIC_DENSE]: composite(surfaceFloat, acrylicDenseFill, canvas),
    [HERO_SHEET]: composite(surfaceOverlay, overlayFill, canvas),
  };
  const surfaceEntries = Object.entries(surfaces);

  /* Where a *tinted control* can actually sit: the page, inside a card, in a well, or on a floating
     sheet. The field steps are not among them — a tonal control is never placed inside a field, and
     the controls that do live there (a combobox's trailing parts, a field's submit control) are
     foreground-only — and neither is an empty mark's well, which holds nothing but its own mark.
     Both are still *surfaces* for the roles that do answer to them. */
  const controlEntries = surfaceEntries.filter(([where]) =>
    ["canvas", "quiet well", "matte card", ACRYLIC, ACRYLIC_DENSE, HERO_SHEET].includes(where)
  );

  /** The opaque neutral fill a `secondary` control takes, and the groove a value control runs in. */
  const neutralFill = surfaceHigh;
  const groove = composite(surface, FIELD.quiet, canvas);

  const tint = (role, alpha, base) => composite(colour(role), alpha, base);
  const withState = (role, alpha, base) => composite(colour(role), alpha, base);

  const compositions = [];
  const add = (id, requirement, note, checks) => compositions.push({ id, requirement, note, checks });

  /* -- text roles, which need no semantic accent ------------------------------------------- */
  add("text.high on every authored surface", WCAG_TEXT, "labels and values", surfaceEntries.map(([where, base]) => [where, colour("ink"), base]));
  add("text.medium on every authored surface", WCAG_TEXT, "supporting copy, descriptions, placeholders", surfaceEntries.map(([where, base]) => [where, colour("ink-muted"), base]));
  add("text.high on the opaque neutral fill", WCAG_TEXT, "a `secondary` filled control's label", [["strong secondary fill", colour("ink"), neutralFill]]);
  add(
    "text.medium on an invalid or engaged field",
    WCAG_TEXT,
    "a field's placeholder while the field's own error ladder is in effect",
    ["canvas", "matte card"].flatMap((where) =>
      [FIELD.invalid, FIELD.invalidFocus].map((alpha) => [`${where} + danger ${alpha}`, colour("ink-muted"), tint("danger", alpha, surfaces[where])])
    )
  );
  add(
    "text on a data row under the pointer",
    WCAG_TEXT,
    "a Table row is read rather than activated, and answers the pointer with an ink tint over its own quiet fill",
    ["ink", "ink-muted"].map((role) => [`${role} on a hovered row`, colour(role), composite(colour("ink"), STATE.quiet.hover, groove)])
  );
  add(
    "text.high on a semantic tint [soft]",
    WCAG_TEXT,
    "an Alert's copy or a tag's label: the copy keeps its own emphasis while the tint carries the meaning",
    SEMANTIC.flatMap((role) => controlEntries.map(([where, base]) => [`${where} + ${role} soft`, colour("ink"), tint(role, TINT.soft[role], base)]))
  );
  add(
    "text.high on a semantic tint [selected]",
    WCAG_TEXT,
    "a selected row, segment or chip: the label is the high text step over the selection tint",
    SEMANTIC.flatMap((role) => controlEntries.map(([where, base]) => [`${where} + ${role} selected`, colour("ink"), tint(role, TINT.selected[role], base)]))
  );

  /* -- the code well, which is text on its own surface --------------------------------------- */
  const CODE_ROLES = ["text", "comment", "string", "number", "keyword", "function", "tag"];
  add(
    "the code syntax palette on the code well",
    WCAG_TEXT,
    "a CodeBlock's plain text and every Prism syntax role, read against the well its own matte shell and its `bg-sherick-canvas/[0.28]` fill composite to",
    CODE_ROLES.map((role) => [`code.${role}`, colour(`code-${role}`), surfaces[CODE_WELL]])
  );
  add(
    "a Prism namespace token on the code well",
    WCAG_TEXT,
    "the namespace role carries `opacity: 0.7` and no colour of its own, so it renders as code text faded toward the well",
    [["namespace (code-text at 0.7)", composite(colour("code-text"), 0.7, surfaces[CODE_WELL]), surfaces[CODE_WELL]]]
  );

  /* -- semantic foregrounds ---------------------------------------------------------------- */
  for (const role of SEMANTIC) {
    const fg = colour(role);
    add(
      `tone.text.${role} on every authored surface`,
      WCAG_TEXT,
      "a text-appearance control, a link, an error message, a destructive menu row",
      surfaceEntries.map(([where, base]) => [where, fg, base])
    );
    add(
      `tone.text.${role} on its own tint, through its states`,
      WCAG_TEXT,
      "a tonal Button/IconButton, a Badge, a Card: the label is the accent and the fill is a tint of it, and hover/press composite the label over that fill again",
      controlEntries.flatMap(([where, base]) => {
        const fill = tint(role, TINT.soft[role], base);
        return [
          [`${where} at rest`, fg, fill],
          [`${where} hovered`, fg, withState(role, STATE.tonal.hover, fill)],
          [`${where} pressed`, fg, withState(role, STATE.tonal.press, fill)],
        ];
      })
    );
    add(
      `tone.text.${role} on a surface, through the quiet states`,
      WCAG_TEXT,
      "a text-appearance Button/IconButton and a ghost control answer the pointer with a quiet step over the surface itself",
      surfaceEntries.flatMap(([where, base]) => [
        [`${where} at rest`, fg, base],
        [`${where} hovered`, fg, withState(role, STATE.quiet.hover, base)],
        [`${where} pressed`, fg, withState(role, STATE.quiet.press, base)],
      ])
    );
    add(
      `tone.text.${role} on the floating sheets, through the tonal states`,
      WCAG_TEXT,
      "an acrylic IconButton, and a Toast's own mark on the sheet it arrived on",
      [ACRYLIC, ACRYLIC_DENSE].flatMap((where) =>
        [["at rest", 0], ["hovered", STATE.tonal.hover], ["pressed", STATE.tonal.press]].map(([state, alpha]) => [
          `${where} ${state}`,
          fg,
          alpha ? withState(role, Number(alpha), surfaces[where]) : surfaces[where],
        ])
      )
    );
    add(
      `tone.text.${role} on its selected tint`,
      WCAG_NON_TEXT,
      "the mark a Select or Combobox option carries, and a selected toggle's own mark",
      controlEntries.map(([where, base]) => [where, fg, tint(role, TINT.selected[role], base)])
    );
    add(
      `on-colour on its strong fill, through the filled states [${role}]`,
      WCAG_TEXT,
      "a filled Button, a Confirm action: hover and press composite the on-colour over the fill",
      (() => {
        const fill = colour(opaqueFill(role));
        const on = colour(`on-${role}`);
        return [
          ["at rest", on, fill],
          ["hovered", on, composite(on, STATE.filled.hover, fill)],
          ["pressed", on, composite(on, STATE.filled.press, fill)],
        ];
      })()
    );
    add(
      `a selection mark on its selected fill [${role}]`,
      WCAG_NON_TEXT,
      "the tick, the radio dot and the switch thumb are `currentColor` over the selection fill, which the same colour overlays again while the control is hovered or pressed",
      (() => {
        const fill = colour(opaqueFill(role));
        const on = colour(`on-${role}`);
        return [
          ["at rest", on, fill],
          ["hovered", on, composite(on, STATE.filled.hover, fill)],
          ["pressed", on, composite(on, STATE.filled.press, fill)],
        ];
      })()
    );
    add(
      `a progress fill against its track [${role}]`,
      WCAG_NON_TEXT,
      "the bar that says how far the work has come, against the groove it runs in",
      [["progress", colour(opaqueFill(role)), groove]]
    );
  }

  add(
    "tone.text.danger in the error fills",
    WCAG_TEXT,
    "the error placeholder, and error copy sitting on the invalid field's own fill",
    ["canvas", "matte card"].flatMap((where) =>
      [FIELD.invalid, FIELD.invalidFocus].map((alpha) => [`${where} + danger ${alpha}`, colour("danger"), tint("danger", alpha, surfaces[where])])
    )
  );
  add(
    "a destructive command's label through its highlight",
    WCAG_TEXT,
    "a Menu's danger row: the label is the accent and the row's highlight is a quiet step of that same accent",
    [ACRYLIC, HERO_SHEET].flatMap((where) =>
      [["at rest", 0], ["hovered", STATE.quiet.hover], ["highlighted", STATE.quiet.press]].map(([state, alpha]) => [
        `${where} ${state}`,
        colour("danger"),
        alpha ? withState("danger", Number(alpha), surfaces[where]) : surfaces[where],
      ])
    )
  );

  /* -- meaningful non-text marks ----------------------------------------------------------- */
  add(
    "a value control's handle against its groove",
    WCAG_NON_TEXT,
    "a Slider's handle is a matte fill inside a recessed groove, and takes the accent while the pointer is on it",
    [
      ["at rest on the page", colour("ink-muted"), groove],
      ["at rest inside a card", colour("ink-muted"), composite(surface, FIELD.quiet, surfaces["matte card"])],
      ["while engaged", colour("primary-strong"), groove],
    ]
  );
  add("a mark on the opaque neutral fill", WCAG_NON_TEXT, "an unchecked Switch's thumb is `currentColor` over the track's opaque neutral fill", [["unchecked switch thumb", colour("ink"), neutralFill]]);
  add(
    "the wall the light makes legible on an empty mark's well",
    WCAG_NON_TEXT,
    "an unchecked box, an unselected radio: a mark with no content of its own is identified by its depth, and this is the wall of that well that carries it — the shaded one above in light mode, the lit one below in dark mode, exactly as `elevation-well` draws them. That the authored alpha clears 3:1 as painted is measured from rendered pixels in the browser suite; the opposite wall is a deliberate bounce and is not a boundary.",
    surfaceEntries.map(([where, base]) => [where, composite(colour(WELL.tone), WELL.alpha, surfaceHigh), base])
  );
  add(
    "the detail role on the surfaces it is permitted on",
    WCAG_NON_TEXT,
    "non-text furniture that still carries meaning: gutters, rails, secondary graphical detail, a status mark's frame",
    surfaceEntries.map(([where, base]) => [where, colour("detail"), base])
  );

  /* -- the focus indicator ----------------------------------------------------------------- */
  add(
    "the focus indicator against every authored surface",
    WCAG_NON_TEXT,
    "the outer ring: a control that stands alone, and a field that draws it outside its own edge",
    surfaceEntries.map(([where, base]) => [where, colour("focus"), base])
  );
  for (const role of SEMANTIC) {
    add(
      `the focus indicator over the ${role} soft tint` ,
      WCAG_NON_TEXT,
      "an inset ring drawn inside a dismissal or a segment that sits on a tinted surface",
      controlEntries.map(([where, base]) => [where, colour("focus"), tint(role, TINT.soft[role], base)])
    );
    add(
      `the focus indicator over a highlighted ${role} row` ,
      WCAG_NON_TEXT,
      "the inset ring on a collection row while the row is highlighted: the row's highlight is a quiet step of its own label colour, which on a destructive command is the accent",
      [ACRYLIC, HERO_SHEET].flatMap((where) =>
        [["hovered", STATE.quiet.hover], ["highlighted", STATE.quiet.press]].map(([state, alpha]) => [
          `${where} ${state}` ,
          colour("focus"),
          withState(role, Number(alpha), surfaces[where]),
        ])
      )
    );
    add(
      `the focus indicator over the ${role} selected tint`,
      WCAG_NON_TEXT,
      "an inset ring drawn inside a selected segment or a selected row",
      controlEntries.map(([where, base]) => [where, colour("focus"), tint(role, TINT.selected[role], base)])
    );
  }

  return compositions;
};

/**
 * Runs the contract for both themes.
 *
 * @param {{light: Record<string, string>, dark: Record<string, string>}} themes
 * @returns {Array<{theme: string, id: string, requirement: number, note: string, ratio: number, where: string, pass: boolean}>}
 */
export const measureContrast = (themes, alphas) =>
  Object.entries(themes).flatMap(([theme, variables]) =>
    contrastCompositions(variables, alphas).map(({ id, requirement, note, checks }) => {
      const worst = checks.reduce(
        (lowest, [where, foreground, background]) => {
          const ratio = contrastRatio(foreground, background);
          return ratio < lowest.ratio ? { ratio, where } : lowest;
        },
        { ratio: Number.POSITIVE_INFINITY, where: "" }
      );
      return { theme, id, requirement, note, ratio: worst.ratio, where: worst.where, pass: worst.ratio >= requirement };
    })
  );

/** A printable report, worst first. */
export const formatContrastReport = (results) =>
  [...results]
    .sort((a, b) => a.ratio / a.requirement - b.ratio / b.requirement)
    .map((r) => `  ${r.pass ? "ok  " : "FAIL"} ${r.theme}:${r.id} — ${r.ratio.toFixed(2)}:1 on ${r.where} (needs ${r.requirement})`)
    .join("\n");
