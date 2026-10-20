"use client";
import { Button, Divider, IconButton, NavGroup, Tooltip } from "sherick-ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download04Icon, PencilEdit02Icon, SidebarLeft01Icon } from "@hugeicons/core-free-icons";

const SideNav = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <>
      {/* Top */}
      <div className="flex justify-between mb-4">
        <Tooltip content="Close sidebar" position="right">
          <IconButton
            icon={<HugeiconsIcon icon={SidebarLeft01Icon} aria-hidden="true" className="w-6 h-6" />}
            variant="secondary"
            onClick={() => setOpen(false)}
          />
        </Tooltip>
        <Tooltip content="Download all chats" position="right">
          <IconButton
            icon={<HugeiconsIcon icon={Download04Icon} aria-hidden="true" className="w-6 h-6" />}
            variant="secondary"
          />
        </Tooltip>
      </div>
      <Button
        icon={<HugeiconsIcon icon={PencilEdit02Icon} aria-hidden="true" className="w-4 h-4" />}
        className="w-full mb-4"
        variant="primary"
      >
        Create chat
      </Button>
      <Divider className="mb-4 mt-8" />
      {/* Middle */}
      <div className="overflow-y-auto">
        <NavGroup
          title="Today"
          items={[
            { label: "Chat 1", href: "/" },
            { label: "Chat 2", href: "/" },
            { label: "Chat 3", href: "/" },
          ]}
        />
        <NavGroup
          title="Yesterday"
          items={[
            { label: "Chat 1", href: "/" },
            { label: "Chat 2", href: "/" },
            { label: "Chat 3", href: "/" },
          ]}
        />
      </div>
      {/* Bottom */}
      <Divider className="my-8" />
    </>
  );
};

export default SideNav;
