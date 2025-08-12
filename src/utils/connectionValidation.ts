export const validateConnectionName = (name: string): string => {
  if (!name.trim()) return "Nome obrigatório";
  if (name.includes(" ")) return "Sem espaços";
  if (name.length < 3) return "Mínimo 3 caracteres";
  if (name.length > 30) return "Máximo 30 caracteres";
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) return "Apenas letras, números, _ e -";
  return "";
};

export interface StatusResponse {
  contato?: string;
  profilename?: string;
  fotodoperfil?: string;
  connected?: boolean;
  status?: string;
}

export const WEBHOOK_URLS = {
  CREATE_INSTANCE: "https://webhock-veterinup.abbadigital.com.br/webhook/nova-instancia-mp-brasil",
  CONNECT: "https://webhock-veterinup.abbadigital.com.br/webhook/conecta-mp-brasil",
  CHECK_STATUS: "https://webhock-veterinup.abbadigital.com.br/webhook/verifica-status-mp-brasil",
  DISCONNECT: "https://webhock-veterinup.abbadigital.com.br/webhook/desconecta-mp-brasil",
  DELETE_INSTANCE: "https://webhock-veterinup.abbadigital.com.br/webhook/desconecta-contato"
};

export const POLLING_CONFIG = {
  interval: 3000,
  qrExpiration: 60,
  maxRetries: 20,
  requestTimeout: 15000
};