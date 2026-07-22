import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function RefreshButton({ onClick, size = "sm" }) {
  const [spinning, setSpinning] = useState(false);

  const handleClick = async () => {
    setSpinning(true);
    try {
      await onClick?.();
    } finally {
      setSpinning(false);
    }
  };

  const sizeClass = size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <button
      onClick={handleClick}
      disabled={spinning}
      className="rounded p-1 text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
      title="Refresh"
    >
      <RefreshCw className={`${sizeClass} ${spinning ? "animate-spin" : ""}`} />
    </button>
  );
}
