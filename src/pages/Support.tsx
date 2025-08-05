import { SupportHeader } from "@/components/SupportHeader";
import { TicketList } from "@/components/TicketList";
import { SupportChat } from "@/components/SupportChat";
import { SupportMetrics } from "@/components/SupportMetrics";

const Support = () => {
  return (
    <div className="flex-1 flex flex-col h-full">
      <SupportHeader />
      
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SupportMetrics />
            <TicketList />
          </div>
          
          <div className="space-y-6">
            <SupportChat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;