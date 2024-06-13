import { ReactNode } from "react";
import { cn } from "@/libs/utils";
import { styleMap } from "./ui.common";
import { Variant } from "./ui.types";
import { Spinner } from "./Spinner";

const IconButton = ({
  variant = "primary",
  icon,
  className,
  loading = false,
  onClick,
  ...props
}: {
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
  loading?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      {...props}
      className={cn(
        "p-2 rounded-2xl bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center",
        styleMap?.[variant] || styleMap["primary"],
        loading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {icon && !loading ? <span className="inline-block align-middle">{icon}</span> : loading ? <Spinner className="mr-2" size="small" /> : null}
    </button>
  );
};

export default IconButton;
