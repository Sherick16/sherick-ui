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

/* The authored alphas these compositions are built from — the design language's state steps (§11),
   the tint strengths (§10) and the matte ladder (§4). They are exported so the measured sensitivity
   of the palette to them is inspectable: a label-bearing fill answers to 4.5:1 in every state, and
   how much of that the palette carries and how much a state step carries is a visible trade-off. */
export const stateAlphas = {
  /** `stateLayer.*` — a `::before` in `currentColor` over the control's own fill. */
  state: {
    quiet: { hover: 0.05, press: 0.09 },
    tonal: { hover: 0.09, press: 0.15 },
    filled: { hover: 0.18, press: 0.26 },
  },
  /** `tone.soft.*` / `tone.tonal.*`, `tone.selected.*`, and the neutral rest fill. */
  tint: {
    soft: { primary: 0.12, danger: 0.09, warning: 0.09, success: 0.09 },
    selected: { primary: 0.22, danger: 0.16, warning: 0.16, success: 0.16 },
    neutralRest: 0.56,
  },
  /** The matte ladder a field and a selection mark use. */
  field: { quiet: 0.42, card: 0.78, control: 0.66, hover: 0.82, engaged: 0.90 },
  /* The wall of an empty mark's well that the light makes legible, as `elevation-well` draws it:
     the *shade* wall above in light mode, the *lit* wall below in dark mode, and the same value
     the other way round in each theme is a deliberate bounce. `tone` names the lighting value and
     `alpha` the rung's alpha; the composition below is what makes those numbers a promise. */
  well: {
    light: { tone: "light-bottom", alpha: 0.62 },
    dark: { tone: "light-top", alpha: 0.40 },
  },
};

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
export const contrastCompositions = (variables, alphas = stateAlphas, theme = "light") => {
  const STATE = alphas.state;
  const TINT = alphas.tint;
  const FIELD = alphas.field;
  const WELL = alphas.well[theme];
  const colour = (name) => oklchToSrgb(variables[`--sui-${name}`]);

  const canvas = colour("canvas");
  const surface = colour("surface");
  const surfaceHigh = colour("surface-high");
  const surfaceFloat = colour("surface-float");
  const surfaceOverlay = colour("surface-overlay");

  /* Every surface a component composites a fill over. An *opaque fill* is not a surface: the neutral
     fill a `secondary` control takes is listed where it is actually used. */
  const surfaces = {
    canvas,
    "quiet well (surface 0.42)": composite(surface, FIELD.quiet, canvas),
    "matte card (surface 0.78)": composite(surface, FIELD.card, canvas),
    "chip at rest (surface-high 0.56)": composite(surfaceHigh, TINT.neutralRest, canvas),
    "field (surface-high 0.66)": composite(surfaceHigh, FIELD.control, canvas),
    /* An empty mark sits in the *opaque* neutral well, the same one a Switch's track sits in. */
    "empty mark well (surface-high)": surfaceHigh,
    "field hover (surface-high 0.82)": composite(surfaceHigh, FIELD.hover, canvas),
    "engaged field (surface-high 0.90)": composite(surfaceHigh, FIELD.engaged, canvas),
    "acrylic sheet (surface-float 0.86)": composite(surfaceFloat, 0.86, canvas),
    "acrylic dense / tooltip (surface-float 0.90)": composite(surfaceFloat, 0.9, canvas),
    "hero sheet / dialog (surface-overlay 0.90)": composite(surfaceOverlay, 0.9, canvas),
  };
  const surfaceEntries = Object.entries(surfaces);

  /* Where a *tinted control* can actually sit: the page, inside a card, in a well, or on a floating
     sheet. The field steps are not among them — a tonal control is never placed inside a field, and
     the controls that do live there (a combobox's trailing parts, a field's submit control) are
     foreground-only — and neither is an empty mark's well, which holds nothing but its own mark.
     Both are still *surfaces* for the roles that do answer to them. */
  const controlEntries = surfaceEntries.filter(([where]) =>
    [
      "canvas",
      "quiet well (surface 0.42)",
      "matte card (surface 0.78)",
      "acrylic sheet (surface-float 0.86)",
      "acrylic dense / tooltip (surface-float 0.90)",
      "hero sheet / dialog (surface-overlay 0.90)",
    ].includes(where)
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
    ["canvas", "matte card (surface 0.78)"].flatMap((where) =>
      [0.075, 0.13].map((alpha) => [`${where} + danger ${alpha}`, colour("ink-muted"), tint("danger", alpha, surfaces[where])])
    )
  );
  add(
    "text on a data row under the pointer",
    WCAG_TEXT,
    "a Table row is read rather than activated, and answers the pointer with an ink tint over its own quiet fill",
    ["ink", "ink-muted"].map((role) => [`${role} on a hovered row`, colour(role), composite(colour("ink"), 0.05, groove)])
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
      ["acrylic sheet (surface-float 0.86)", "acrylic dense / tooltip (surface-float 0.90)"].flatMap((where) =>
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
    ["canvas", "matte card (surface 0.78)"].flatMap((where) =>
      [0.075, 0.13].map((alpha) => [`${where} + danger ${alpha}`, colour("danger"), tint("danger", alpha, surfaces[where])])
    )
  );
  add(
    "a destructive command's label through its highlight",
    WCAG_TEXT,
    "a Menu's danger row: the label is the accent and the row's highlight is a quiet step of that same accent",
    ["acrylic sheet (surface-float 0.86)", "hero sheet / dialog (surface-overlay 0.90)"].flatMap((where) =>
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
      ["at rest inside a card", colour("ink-muted"), composite(surface, FIELD.quiet, surfaces["matte card (surface 0.78)"])],
      ["while engaged", colour("primary-strong"), groove],
    ]
  );
  add("a mark on the opaque neutral fill", WCAG_NON_TEXT, "an unchecked Switch's thumb is `currentColor` over the track's opaque neutral fill", [["unchecked switch thumb", colour("ink"), neutralFill]]);
  add(
    "the wall the light makes legible on an empty mark's well",
    WCAG_NON_TEXT,
    "an unchecked box, an unselected radio: a mark with no content of its own is identified by its depth, and this is the wall of that well that carries it — the shaded one above in light mode, the lit one below in dark mode, exactly as `elevation-well` draws them. The opposite wall is a deliberate bounce and is not a boundary.",
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
      ["acrylic sheet (surface-float 0.86)", "hero sheet / dialog (surface-overlay 0.90)"].flatMap((where) =>
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
export const measureContrast = (themes, alphas = stateAlphas) =>
  Object.entries(themes).flatMap(([theme, variables]) =>
    contrastCompositions(variables, alphas, theme).map(({ id, requirement, note, checks }) => {
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
