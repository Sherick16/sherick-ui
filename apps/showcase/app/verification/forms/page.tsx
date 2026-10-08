"use client";

import { useState } from "react";
import {
  Button,
  CheckboxGroup,
  Combobox,
  DirectionProvider,
  Field,
  Form,
  Input,
  NumberField,
  RadioGroup,
  Select,
  type FormErrors,
} from "sherick-ui";

const roleOptions = [
  { label: "Admin", value: "role-admin" },
  { label: "Moderator", value: "role-mod" },
  { label: "Booster", value: "role-booster" },
  { label: "Verified", value: "role-verified" },
  { label: "Muted", value: "role-muted", disabled: true },
];

const channelOptions = [
  { label: "#rules", value: "rules" },
  {
    label: "Giveaways",
    options: [
      { label: "#giveaway", value: "giveaway" },
      { label: "#giveaway-winners", value: "giveaway-winners" },
    ],
  },
  {
    label: "Community",
    options: [
      { label: "#general", value: "general" },
      { label: "#memes", value: "memes" },
      { label: "#archive", value: "archive", disabled: true },
    ],
  },
];

const gameOptions = [
  { label: "Book of Dead", value: "book-of-dead" },
  { label: "Gates of Olympus", value: "gates-of-olympus" },
  { label: "Sweet Bonanza", value: "sweet-bonanza" },
];

const casinoOptions = [
  { value: "aurora", label: "Aurora Casino", description: "aurora.example, aurora-play.example" },
  { value: "harbor", label: "Harbor Slots", description: "harborslots.example" },
  {
    value: "meridian",
    label: "Meridian",
    description: "meridian.example, meridian-bet.example, a-long-mirror-domain-name.meridian.example",
  },
  { value: "north", label: "North Star", description: "northstar.example", disabled: true },
];

export default function VerificationFormsPage() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState("Not submitted");
  const [roles, setRoles] = useState<string[]>(["role-admin", "role-booster"]);
  const [games, setGames] = useState<string[]>(["book-of-dead"]);
  const [channel, setChannel] = useState<string | null>("giveaway");

  return (
    <main data-testid="verification-forms" className="min-h-screen bg-sherick-canvas px-6 py-10 text-sherick-ink">
      <section className="mx-auto flex max-w-3xl min-w-0 flex-col gap-12">
        <header>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Extra-ticket rule</h1>
        </header>

        <Form
          aria-label="Extra-ticket rule"
          errors={errors}
          onFormSubmit={(values) => {
            /* A server that rejects one name it has already seen, so the errors map arrives after a
               submission that passed every field's own validation. */
            if (values.title === "Taken") {
              setErrors({ title: "A rule with this title already exists." });
              return;
            }
            setErrors({});
            setSubmitted(JSON.stringify(values));
          }}
        >
          <Input name="title" label="Rule title" required placeholder="Weekend boost" />
          <Field name="roles" label="Required roles" description="Members need every role listed.">
            <Combobox multiple options={roleOptions} value={roles} onValueChange={setRoles} placeholder="Add a role" />
          </Field>
          <Field name="channel" label="Announcement channel">
            <Select options={channelOptions} value={channel} onValueChange={setChannel} aria-label="Announcement channel" />
          </Field>
          <div className="grid gap-6 sm:grid-cols-3">
            <Field name="multiplier" label="Ticket multiplier (×)">
              <NumberField defaultValue={15} min={1} suffix="×" />
            </Field>
            <Field name="price" label="Price per ticket (€)">
              <NumberField defaultValue={0.1} step={0.05} prefix="€" format={{ minimumFractionDigits: 2 }} locale="en-US" />
            </Field>
            <Field name="bonus" label="Bonus tickets">
              <NumberField defaultValue={2} min={0} suffix="× tickets" />
            </Field>
          </div>
          <CheckboxGroup
            name="casinos"
            label="Casinos"
            description="The rule applies on every domain of a ticked casino."
            appearance="surface"
            required
            options={casinoOptions}
          />
          <CheckboxGroup
            name="accept"
            label="Also accept"
            defaultValue={["bonus-buy"]}
            options={[
              { value: "bonus-buy", label: "Bonus buys" },
              { value: "free-spins", label: "Free spins" },
              { value: "live", label: "Live tables" },
            ]}
          />
          <Field name="games" label="Allowed games" description="Paste one title per line.">
            <Combobox
              multiple
              creatable
              options={gameOptions}
              value={games}
              onValueChange={setGames}
              placeholder="Add a game"
            />
          </Field>
          <div className="flex items-center gap-4">
            <Button type="submit" appearance="filled">Save rule</Button>
            <output data-testid="form-submitted" className="min-w-0 truncate text-sm">{submitted}</output>
          </div>
        </Form>

        <section className="flex flex-col gap-6" aria-label="Single fields">
          <Field label="Channel">
            <Combobox options={channelOptions} defaultValue="general" placeholder="Find a channel" />
          </Field>
          <Field label="Uncontrolled tags">
            <Combobox multiple creatable options={[]} defaultValue={["alpha"]} placeholder="Add a tag" />
          </Field>
          <Field label="Read-only roles">
            <Combobox multiple readOnly options={roleOptions} defaultValue={["role-admin", "role-mod"]} />
          </Field>
          <Input label="Invite link" prefix="https://" suffix=".discord.gg" placeholder="sherick" />
          <Input label="Invalid amount" prefix="€" error errorMessage="Enter an amount." placeholder="0.00" />
          <RadioGroup
            label="Draw"
            appearance="surface"
            defaultValue="weekly"
            options={[
              { value: "daily", label: "Daily", description: "Draws at midnight UTC." },
              { value: "weekly", label: "Weekly", description: "Draws every Sunday." },
            ]}
          />
          <div data-testid="narrow-forms" className="w-72 max-w-full">
            <Field label="Narrow roles">
              <Combobox
                multiple
                options={roleOptions}
                defaultValue={["role-admin", "role-mod", "role-booster", "role-verified"]}
              />
            </Field>
          </div>
        </section>

        <div dir="rtl" className="min-w-0">
          <DirectionProvider direction="rtl">
            <div className="flex flex-col gap-6">
              <Field label="RTL roles">
                <Combobox multiple options={roleOptions} defaultValue={["role-admin", "role-mod"]} />
              </Field>
              <Field label="RTL price (€)">
                <NumberField defaultValue={5} prefix="€" />
              </Field>
            </div>
          </DirectionProvider>
        </div>
      </section>
    </main>
  );
}
