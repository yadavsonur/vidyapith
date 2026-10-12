import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";

export const DataCard = ({ value, label, shouldFormat }) => {
  return (
    <Card className="border-ink-200/90 shadow-subtle hover:border-ink-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-mono uppercase tracking-wider text-ink-500 font-medium">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-serif text-3xl md:text-4xl font-bold text-ink-950">
          {shouldFormat ? formatPrice(value) : value}
        </div>
      </CardContent>
    </Card>
  );
};
