import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, Users, CheckCircle } from "lucide-react";

const metrics = [
  {
    title: "Tickets Abertos",
    value: "23",
    change: "+5",
    changeType: "increase",
    icon: MessageSquare,
    color: "text-orange-500"
  },
  {
    title: "Tempo Médio de Resposta",
    value: "8m",
    change: "-2m",
    changeType: "decrease",
    icon: Clock,
    color: "text-blue-500"
  },
  {
    title: "Tickets Resolvidos Hoje",
    value: "47",
    change: "+12",
    changeType: "increase",
    icon: CheckCircle,
    color: "text-green-500"
  },
  {
    title: "Agentes Online",
    value: "8",
    change: "+2",
    changeType: "increase",
    icon: Users,
    color: "text-purple-500"
  },
];

export const SupportMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-sm font-medium">
              {metric.title}
            </CardDescription>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Badge 
                variant={metric.changeType === "increase" ? "secondary" : "outline"}
                className="px-1"
              >
                {metric.change}
              </Badge>
              <span>desde ontem</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};