// Infraestrutura do projeto no Railway (substitui o antigo railway.json).
// Ver: railway config plan / railway config apply
import { defineRailway, github, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  // Banco SQLite (galera.db) e fotos (uploads/) ficam neste volume, montado em /data.
  const galeraVolume = volume("galera-data", {
    alerts: { usage: { "100": {}, "80": {}, "95": {} } },
    allowOnlineResize: true,
    region: "us-east4-eqdc4a",
    sizeMB: 50000,
  });

  const galera = service("galera", {
    source: github("Ros1991/casamentocarolfernando", { checkSuites: false }),
    // Virgínia: menor latência para o Brasil entre as regiões disponíveis
    replicas: { "us-east4": 1 },
    healthcheck: "/health",
    healthcheckTimeout: 120,
    volumeMounts: { "/data": galeraVolume },
    // Domínio próprio (CNAME criado no DNS do Canva). O domínio gerado pelo Railway continua ativo.
    domains: [{ domain: "app.annacarolinaefernando.com", port: 3000 }],
    env: {
      PORT: "3000",
      NODE_ENV: "production",
      DATA_DIR: "/data",
      MAX_UPLOAD_MB: "12",
      PUBLIC_URL: "https://app.annacarolinaefernando.com",
      VAPID_SUBJECT: "https://app.annacarolinaefernando.com",
      // Segredos e códigos ficam só no Railway (Variables), nunca no repositório
      SESSION_SECRET: preserve(),
      // INVITE_CODE desligado a pedido dos noivos (sem código na entrada); para exigir, declare aqui e no Railway
      ADMIN_PHONES: preserve(),
      TELAO_CODE: preserve(),
      VAPID_PUBLIC_KEY: preserve(),
      VAPID_PRIVATE_KEY: preserve(),
    },
  });

  return project("galera-casamento", {
    resources: [galera, galeraVolume],
  });
});
