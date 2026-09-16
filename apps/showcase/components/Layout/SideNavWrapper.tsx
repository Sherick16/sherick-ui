'use client';
import { useState } from "react";
import { cn } from "sherick-ui/dev";
import { PanelRightClose } from "lucide-react";
import SideNav from "./SideNav";
import { IconButton, Tooltip } from "sherick-ui";

const SideNavWrapper = ({
  className,
  ...props
}: {
  className?: string;
}) => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div
        className={cn(
          "h-[100dvh] left-0 z-50 bg-gray-700 bg-opacity-20 transition-all duration-200 ease-in-out",
          open ? "max-w-72 w-full px-6 py-8 opacity-100" : "max-w-0 w-0 px-1 py-8 opacity-0",
          className
        )}
        {...props}
      >
        <SideNav open={open} setOpen={setOpen} />
      </div>
      {!open && (
        <div className="fixed top-8 left-6 z-50">
          <Tooltip content="Open sidebar" position="right">
            <IconButton icon={<PanelRightClose className="w-6 h-6" />} variant="secondary" onClick={() => setOpen(true)} />
          </Tooltip>
        </div>
      )}
    </>
  );
}

export default SideNavWrapper;
