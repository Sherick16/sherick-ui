"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Chip,
  ChipGroup,
  Combobox,
  DatePicker,
  Drawer,
  NumberField,
  Search,
  Select,
  Table,
} from "sherick-ui";

const reasons = [
  { value: "bet", label: "Bet amount unclear", count: 19 },
  { value: "win", label: "Win amount unclear", count: 19 },
  { value: "game", label: "Game identity unclear", count: 17 },
  { value: "casino", label: "Identify casino", count: 4 },
  { value: "summary", label: "Win read from a LAST WIN summary", count: 2 },
  { value: "bonus", label: "Active bonus state unclear", count: 1 },
];

const campaigns = [
  { label: "All campaigns", value: "all" },
  { label: "Bullshark November Giveaway", value: "bullshark" },
  { label: "Rapter Winter Raffle", value: "rapter" },
];

const variants = ["primary", "secondary", "success", "warning", "danger"] as const;

/* An overview table as a moderation dashboard composes it: a flush, compact table of navigable rows in a
   card, filter chips with counts that scroll along one line, a toolbar of `sm` fields, and a bottom sheet
   with a grab handle. */
export default function OverviewVerificationPage() {
  const [chosen, setChosen] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const chips = (
    <>
      <Chip value="all" count={36}>All</Chip>
      {reasons.map((reason) => (
        <Chip key={reason.value} value={reason.value} count={reason.count}>
          {reason.label}
        </Chip>
      ))}
    </>
  );

  return (
    <main className="min-h-screen bg-sherick-canvas p-4 sm:p-8">
      <h1 className="mb-6 text-2xl font-semibold text-sherick-ink">Review queue</h1>

      <div data-testid="toolbar" className="mb-6 flex flex-wrap items-center gap-2">
        <div className="w-56">
          <Search size="sm" aria-label="Search participants" placeholder="Search participants" onSearch={() => undefined} />
        </div>
        <div className="w-56">
          <label htmlFor="campaign-scope" className="sr-only">Campaign scope</label>
          <Combobox size="sm" clearable={false} id="campaign-scope" options={campaigns} defaultValue="all" />
        </div>
        <div className="w-40">
          <Select size="sm" aria-label="Order" options={[{ label: "Oldest first", value: "old" }]} defaultValue="old" />
        </div>
        <div className="w-40">
          <NumberField size="sm" aria-label="Minimum tickets" defaultValue={1} />
        </div>
        <div className="w-48">
          <DatePicker size="sm" aria-label="Since" />
        </div>
        <Button size="sm" variant="secondary" onClick={() => setSheetOpen(true)}>
          Filters
        </Button>
      </div>

      <div data-testid="clearable" className="mb-6 w-64">
        <label htmlFor="clearable-campaign" className="sr-only">Clearable campaign</label>
        <Combobox id="clearable-campaign" options={campaigns} defaultValue="bullshark" />
      </div>

      <Card data-testid="overview-card" className="max-w-4xl">
        <ChipGroup
          data-testid="reason-chips"
          aria-label="Review reason"
          overflow="scroll"
          value={chosen.length === 0 ? ["all"] : chosen}
          onValueChange={(next) => {
            const added = next.find((value) => !chosen.includes(value) && value !== "all");
            setChosen(next.includes("all") && !added ? [] : next.filter((value) => value !== "all"));
          }}
        >
          {chips}
        </ChipGroup>

        <div className="mt-4">
          <Table
            data-testid="overview-table"
            appearance="flush"
            density="compact"
            interactive
            aria-label="Review queue"
            headers={[
              { id: "participant", label: "Participant", rowHeader: true },
              { id: "campaign", label: "Campaign" },
              { id: "reason", label: "Review reason" },
              { id: "tickets", label: "Potential tickets", align: "end" },
              { id: "waiting", label: "Waiting", align: "end" },
            ]}
            rows={[
              [<a key="jp" href="#jp">J.P.</a>, "Bullshark November Giveaway", <Badge key="jp" appearance="subtle" variant="warning">Bet amount unclear</Badge>, "2", "4h 8m"],
              [<a key="mq" href="#mq">Moniquee</a>, "Bullshark November Giveaway", <Badge key="mq" appearance="subtle" variant="warning">Bet amount unclear</Badge>, "2", "4h 7m"],
              [<a key="tg" href="#tg">TommyG1982</a>, "Rapter Winter Raffle", <Badge key="tg" appearance="subtle" variant="warning">Identify casino</Badge>, "2", "4h 5m"],
              [<a key="lt" href="#lt">Lotte</a>, "Rapter Winter Raffle", <Badge key="lt" appearance="subtle" variant="secondary">Possible reused screenshot</Badge>, "1", "1h 35m"],
              [<a key="dv" href="#dv">DaveSpins</a>, "Rapter Winter Raffle", "—", "3", "12m"],
            ]}
          />
        </div>
      </Card>

      <div className="mt-6 max-w-4xl">
        <Table
          data-testid="default-table"
          aria-label="Default table"
          headers={[{ id: "project", label: "Project" }, { id: "owner", label: "Owner" }]}
          rows={[["Design system", "Ana"]]}
        />
      </div>

      <div data-testid="subtle-badges" className="mt-6 flex flex-wrap items-start gap-2">
        {variants.map((variant) => (
          <Badge key={variant} appearance="subtle" variant={variant}>
            {variant}
          </Badge>
        ))}
        <Badge data-testid="default-badge" variant="warning">Default</Badge>
      </div>

      <Drawer side="bottom" handle open={sheetOpen} onOpenChange={setSheetOpen}>
        <Drawer.Content>
          <Drawer.Header>Filters</Drawer.Header>
          <div className="px-6 pt-3 sm:px-7">
            <ChipGroup aria-label="Review reason in the sheet" value={chosen} onValueChange={setChosen}>
              {reasons.map((reason) => (
                <Chip key={reason.value} value={reason.value} count={reason.count}>
                  {reason.label}
                </Chip>
              ))}
            </ChipGroup>
          </div>
          <Drawer.Footer>
            <Drawer.Close render={<Button appearance="filled">Show results</Button>} />
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </main>
  );
}
