import "@ncdai/react-wheel-picker/style.css";
import * as WheelPickerPrimitive from "@ncdai/react-wheel-picker";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

type WheelPickerOption = WheelPickerPrimitive.WheelPickerOption;
type WheelPickerClassNames = WheelPickerPrimitive.WheelPickerClassNames;

function WheelPickerWrapper({
  className,
  ...props
}: React.ComponentProps<typeof WheelPickerPrimitive.WheelPickerWrapper>) {
  return (
    <WheelPickerPrimitive.WheelPickerWrapper
      className={cn(
        "w-56 rounded-lg border border-zinc-200 bg-white px-1 shadow-xs dark:border-zinc-700/80 dark:bg-zinc-900",
        "*:data-rwp:first:*:data-rwp-highlight-wrapper:rounded-s-md",
        "*:data-rwp:last:*:data-rwp-highlight-wrapper:rounded-e-md",
        className
      )}
      {...props}
    />
  );
}

function WheelPicker({
  classNames,
  ...props
}: React.ComponentProps<typeof WheelPickerPrimitive.WheelPicker>) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const getScrollContainer = () =>
    pickerRef.current?.querySelector("[data-rwp-scroll-container]") as HTMLElement | null;

  // ✅ Mouse wheel scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scrollEl = getScrollContainer();
    if (scrollEl) scrollEl.scrollTop += e.deltaY / 2;
  };

  // ✅ Click-drag scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    const scrollEl = getScrollContainer();
    if (!scrollEl) return;
    setIsDragging(true);
    setStartY(e.clientY);
    setScrollTop(scrollEl.scrollTop);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const scrollEl = getScrollContainer();
    if (!scrollEl) return;
    const dy = e.clientY - startY;
    scrollEl.scrollTop = scrollTop - dy;
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      ref={pickerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="cursor-grab active:cursor-grabbing select-none"
    >
      <WheelPickerPrimitive.WheelPicker
        classNames={{
          optionItem: "text-zinc-400 dark:text-zinc-500",
          highlightWrapper:
            "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50",
          ...classNames,
        }}
        {...props}
      />
    </div>
  );
}

export { WheelPicker, WheelPickerWrapper };
export type { WheelPickerClassNames, WheelPickerOption };
