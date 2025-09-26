import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export function ProBadge() {
  return (
    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
      <Star className="h-3 w-3 mr-1" />
      Pro
    </Badge>
  );
}