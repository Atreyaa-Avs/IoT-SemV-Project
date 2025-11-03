import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ToolTipProps {
  content: string;
}

export default function ToolTip({content} : ToolTipProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild className="mt-0.5">
            <Info size={12}/>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs" showArrow={true}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
