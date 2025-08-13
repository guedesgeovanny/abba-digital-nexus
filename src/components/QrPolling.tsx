import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQRCodeTimer } from "@/hooks/useQRCodeTimer";

type RawResp = any;
type Sessao = { status: string; qr?: string | null; pairingCode?: string | null; error?: string };

function normalizeResp(resp: RawResp): Sessao {
  const j = Array.isArray(resp) ? (resp[0] ?? {}) : (resp ?? {});

  // status pode vir encapsulado em j.instance.status
  let rawStatus = (j.instance && typeof j.instance === 'object' && (j.instance.status as string))
    || (j.status as string)
    || (j.state as string)
    || (j.pairingCode || j.code ? "PAIRING" : null)
    || "UNKNOWN";
  const status = String(rawStatus).toUpperCase();

  // localizar QR - buscar em diferentes campos conhecidos
  let qr: string | null = (j.qr as string) ?? (j.base64 as string) ?? (j.image as string) ?? null;
  // se não tiver prefixo data:image, adicionaremos apenas na renderização

  const pairingCode: string | null = (j.pairingCode as string) ?? (j.code as string) ?? null;

  return { status, qr, pairingCode };
}

// Detecta conexão na nova estrutura retornada pelo webhook
function isTargetConnectedPayload(raw: any): boolean {
  console.log('🔍 [isTargetConnectedPayload] Checking payload:', JSON.stringify(raw, null, 2));
  
  const data = Array.isArray(raw) ? raw[0] : raw;
  const target = data.instance || data;
  
  if (!target || typeof target !== 'object') {
    console.log('❌ [isTargetConnectedPayload] Invalid target object');
    return false;
  }
  
  // Considera conectado se status é "open"
  const isConnected = target.status && target.status.toLowerCase() === "open";
  
  console.log('🎯 [isTargetConnectedPayload] Status:', target.status);
  console.log('🎯 [isTargetConnectedPayload] Result:', isConnected ? "✅ CONNECTED" : "❌ NOT CONNECTED");
  
  return isConnected;
}

// Extrai dados de perfil da nova estrutura
function extractProfileData(raw: any) {
  const data = Array.isArray(raw) ? raw[0] : raw;
  const target = data.instance || data;
  
  return {
    profileName: target.profileName && target.profileName !== "not loaded"
      ? target.profileName
      : "Usuário WhatsApp",
    profilePictureUrl: target.profilePictureUrl || "",
    contact: target.owner || "",
    connectedAt: target.status === "open" ? new Date().toISOString() : null,
  };
}

export default function QrPolling({
  instance,
  endpoint,
  intervalMs = 3000,
  initialQr,
  onConnected
}: {
  instance: string;
  endpoint: string; // ex.: "https://SEU_N8N/webhook/qr-status" ou "/api/whats/status"
  intervalMs?: number;
  initialQr?: string;
  onConnected?: (profileData: any) => void;
}) {
  const [status, setStatus] = useState<string>("LOADING");
  const [qr, setQr] = useState<string | null>(initialQr || null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isGeneratingNewQr, setIsGeneratingNewQr] = useState<boolean>(false);

  // Timer de 1 minuto para expiração do QR
  const { timeLeft, formattedTime, isExpired, reset: resetTimer } = useQRCodeTimer({
    isActive: !!qr && status !== 'CONNECTED',
    duration: 60, // 1 minuto
    onExpire: () => {
      console.log('⏳ [QrPolling] QR Code expired after 1 minute');
      setStatus('EXPIRED');
    }
  });

  const lastQrRef = useRef<string | null>(initialQr || null);
  const timerRef = useRef<number | null>(null); // polling interval
  const abortRef = useRef<AbortController | null>(null);
  const isPollingRef = useRef<boolean>(false);

  // Se temos um QR inicial, definir status como QRCODE
  useEffect(() => {
    if (initialQr) {
      setStatus("QRCODE");
      lastQrRef.current = initialQr;
      setQr(initialQr);
    }
  }, [initialQr]);

  const stopAllTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const fetchStatus = async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      // Usar endpoint de verificação de status específico
      const statusUrl = endpoint.replace('conecta-mp-brasil', 'verifica-status-mp-brasil');
      const url = `${statusUrl}?instanceName=${encodeURIComponent(instance)}&t=${Date.now()}`;

      console.log('🔄 [QrPolling] Checking status for:', instance);
      console.log('🔗 [QrPolling] URL:', url);

      const r = await fetch(url, {
        signal: ac.signal,
        headers: { "cache-control": "no-cache" },
        method: 'GET'
      });

      if (!r.ok) {
        console.warn('⚠️ [QrPolling] Status check failed:', r.status, r.statusText);
        return; // Não alterar o estado em caso de erro de rede
      }

      const raw = await r.json();
      console.log('📊 [QrPolling] Raw response:', raw);

      // Verifica se recebeu dados de conexão bem-sucedida
      if (isTargetConnectedPayload(raw)) {
        console.log('🎯 [QrPolling] Connection successful!');
        setStatus('CONNECTED');
        lastQrRef.current = null;
        setQr(null);
        stopAllTimers();
        abortRef.current?.abort();
        
        // Extrair dados da conexão usando a nova função
        console.log('💾 [QrPolling] Extracting connection data from:', raw);
        const connectionData = extractProfileData(raw);
        console.log('📋 [QrPolling] Final connection data:', connectionData);
        
        if (onConnected) onConnected(connectionData);
        return;
      }
      
      // A cada ciclo de polling, também executar verificação completa
      // (isso garante que mesmo sem mudança de status, os dados sejam sincronizados)
      const normalizedData = normalizeResp(raw);
      if (normalizedData.status && ['QRCODE', 'PAIRING', 'LOADING'].includes(normalizedData.status) && onConnected) {
        // Fazer uma verificação silenciosa em paralelo para manter dados atualizados
        // sem bloquear o polling atual
        setTimeout(async () => {
          try {
            const statusUrl = endpoint.replace('conecta-mp-brasil', 'verifica-status-mp-brasil');
            const checkUrl = `${statusUrl}?instanceName=${encodeURIComponent(instance)}&t=${Date.now()}`;
            const checkResponse = await fetch(checkUrl);
            if (checkResponse.ok) {
              const checkData = await checkResponse.json();
              if (isTargetConnectedPayload(checkData)) {
                const connectionData = extractProfileData(checkData);
                onConnected(connectionData);
              }
            }
          } catch (error) {
            console.log('🔄 [QrPolling] Silent check failed:', error);
          }
        }, 0);
      }
      console.log('✅ [QrPolling] Normalized data:', normalizedData);

      // Atualizar status e pairing code (exibir status vindo de instance.status se presente)
      setStatus(normalizedData.status);
      setPairingCode(normalizedData.pairingCode ?? null);

      // Manter QR visível até a condição de sucesso acima
      if (normalizedData.qr && normalizedData.qr !== lastQrRef.current) {
        console.log('🆕 [QrPolling] New QR received, updating...');
        lastQrRef.current = normalizedData.qr;
        setQr(normalizedData.qr);
      } else if (!qr && lastQrRef.current) {
        console.log('🔄 [QrPolling] Restoring QR from backup...');
        setQr(lastQrRef.current);
      }

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('❌ [QrPolling] Polling error:', error);
      }
    }
  };

  useEffect(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    console.log('🚀 [QrPolling] Starting polling for instance:', instance);
    console.log('⏱️ [QrPolling] Interval:', intervalMs + 'ms');
    console.log('📱 [QrPolling] Initial QR available:', !!initialQr);

    // Timer será resetado pelo resetTimer() abaixo

    // Se não temos QR inicial, fazer fetch imediatamente
    if (!initialQr) {
      console.log('🔍 [QrPolling] No initial QR, fetching status immediately...');
      fetchStatus();
    }

    // Iniciar polling
    timerRef.current = window.setInterval(() => {
      console.log('⏰ [QrPolling] Polling tick...');
      fetchStatus();
    }, intervalMs);

    // Resetar timer quando começar novo polling
    resetTimer();

    return () => {
      console.log('🛑 [QrPolling] Cleanup: stopping polling...');
      stopAllTimers();
      abortRef.current?.abort();
      isPollingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, endpoint, intervalMs]);

  const generateNewQrCode = async () => {
    console.log('🔁 [QrPolling] Generating new QR code...');
    setIsGeneratingNewQr(true);
    setStatus('LOADING');
    
    try {
      // Fazer chamada para gerar novo QR code
      const url = `${endpoint}?instanceName=${encodeURIComponent(instance)}&t=${Date.now()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const normalized = normalizeResp(data);
        
        if (normalized.qr) {
          setQr(normalized.qr);
          lastQrRef.current = normalized.qr;
          setStatus('QRCODE');
          resetTimer(); // Reiniciar o timer de 1 minuto
        }
      }
    } catch (error) {
      console.error('❌ [QrPolling] Error generating new QR:', error);
    }
    
    setIsGeneratingNewQr(false);
  };

  // QR deve aparecer se temos um QR válido E o status não é CONNECTED nem EXPIRED
  const showQr = !!qr && status !== "CONNECTED" && status !== "EXPIRED";

  return (
    <div className="flex flex-col items-center gap-4">
      {showQr && (
        <>
          <div className="border-2 border-primary rounded-xl p-2 bg-white">
            <img
              alt="QR Code para conectar WhatsApp"
              src={qr?.startsWith("data:image") ? qr : `data:image/png;base64,${qr}`}
              className="w-64 h-64 rounded-lg"
            />
          </div>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm font-medium">Escaneie o QR Code com seu WhatsApp</p>
              <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                {formattedTime}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>1. Abra o WhatsApp no seu celular</p>
              <p>2. Toque em Mais opções → Dispositivos conectados</p>
              <p>3. Toque em Conectar dispositivo</p>
              <p>4. Aponte seu celular para esta tela</p>
            </div>
          </div>
        </>
      )}

      {!showQr && pairingCode && (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Código de pareamento</p>
          <div className="text-lg font-mono px-4 py-2 border rounded-lg bg-muted">
            {pairingCode}
          </div>
          <p className="text-xs text-muted-foreground">Digite este código no WhatsApp</p>
        </div>
      )}

      {status.toUpperCase() === "CONNECTED" && (
        <div className="text-center space-y-2">
          <div className="text-green-600 font-medium text-lg">✅ Conectado com sucesso!</div>
          <p className="text-sm text-muted-foreground">Seu WhatsApp foi conectado</p>
        </div>
      )}

      {!showQr && status !== "CONNECTED" && status !== "EXPIRED" && !pairingCode && (
        <div className="text-center space-y-2">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <div className="text-sm text-muted-foreground">
            {isGeneratingNewQr ? "Gerando novo código..." : "Aguardando conexão..."}
          </div>
        </div>
      )}

      {(status === "EXPIRED" || isExpired) && (
        <div className="text-center space-y-3">
          <div className="text-sm text-destructive">QR Code expirado (1 minuto)</div>
          <Button 
            variant="outline" 
            onClick={generateNewQrCode}
            disabled={isGeneratingNewQr}
          >
            {isGeneratingNewQr ? "Gerando..." : "Gerar Novo Código"}
          </Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        Status: <span className="font-mono">{status}</span>
      </div>
    </div>
  );
}
