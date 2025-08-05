import { AIAgentHeader } from "@/components/AIAgentHeader";
import { PromptEditor } from "@/components/PromptEditor";
import { ModelSelector } from "@/components/ModelSelector";
import { AIMetrics } from "@/components/AIMetrics";
import { ConversationHistory } from "@/components/ConversationHistory";

const AIAgent = () => {
  return (
    <div className="flex-1 flex flex-col h-full">
      <AIAgentHeader />
      
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ModelSelector />
            <PromptEditor />
            <ConversationHistory />
          </div>
          
          <div className="space-y-6">
            <AIMetrics />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;