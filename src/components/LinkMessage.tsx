
import { LinkInfo, getLinkIcon } from "@/utils/linkDetection"

interface LinkMessageProps {
  links: LinkInfo[]
  messageText: string
  isOutgoing: boolean
}

export const LinkMessage = ({ links, messageText, isOutgoing }: LinkMessageProps) => {
  // Renderizar o texto da mensagem substituindo URLs por links clicáveis
  const renderMessageWithLinks = () => {
    let processedText = messageText
    
    links.forEach(link => {
      const linkElement = `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline ${
        isOutgoing ? 'text-abba-black' : 'text-abba-green'
      }">${link.text}</a>`
      
      processedText = processedText.replace(link.url, linkElement)
    })
    
    return { __html: processedText }
  }

  return (
    <div className="space-y-2">
      <div 
        className="text-sm"
        dangerouslySetInnerHTML={renderMessageWithLinks()}
      />
      
      {/* Preview dos links */}
      {links.length > 0 && (
        <div className="space-y-1">
          {links.map((link, index) => (
            <div 
              key={index}
              className={`flex items-center gap-2 text-xs p-2 rounded border ${
                isOutgoing 
                  ? 'bg-black/10 border-black/20' 
                  : 'bg-white/10 border-white/20'
              }`}
            >
              <span>{getLinkIcon(link.type)}</span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:underline ${
                  isOutgoing ? 'text-abba-black' : 'text-abba-text'
                }`}
                title={link.url}
              >
                {link.text}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
