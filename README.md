# Galera do Casamento — Anna Carolina & Fernando

Rede social do casamento (19/12/2026, Espaço Tuá, Maceió/AL): quem fica onde, mural em tempo real, fotos tiradas na hora marcadas no mapa, "quem chega quando" e telão para a festa.

O plano completo e as decisões estão em [PLANO.md](PLANO.md).

## Stack

- **Client:** React 19 + Vite 7 + TypeScript + Tailwind 4, Leaflet (OpenStreetMap), Socket.IO client, Zustand. PWA (manifest + ícones).
- **Server:** Node 22 + Fastify 5 + Socket.IO, SQLite (better-sqlite3 + Drizzle ORM), sharp para fotos.
- **Deploy:** um único serviço no Railway com um volume em `/data` (banco + fotos). Dockerfile multi-stage.

## Rodar localmente

```bash
npm install
cp .env.example .env   # ajuste INVITE_CODE, ADMIN_PHONES, TELAO_CODE
npm run dev            # server em :3000 e client (Vite) em :5173
```

Abra <http://localhost:5173>. O Vite faz proxy de `/api`, `/uploads` e `/socket.io` para o servidor.

Outros comandos:

```bash
npm run build          # compila client (client/dist) e server (server/dist)
npm start              # roda o build de produção (serve o client em :3000)
npm run db:generate    # gera migração SQL após mudar server/src/db/schema.ts
npm run icons          # regenera os ícones do PWA a partir de client/public/monograma.svg
```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PORT` | não | Porta do servidor (o Railway injeta) |
| `DATA_DIR` | não | Pasta do banco (`galera.db`) e das fotos (`uploads/`). Local: `./data`. Railway: `/data` |
| `SESSION_SECRET` | **sim em produção** | Frase longa e aleatória que assina os cookies |
| `INVITE_CODE` | recomendado | Código que os convidados digitam na entrada. Vazio = sem código |
| `ADMIN_PHONES` | recomendado | Telefones (só dígitos, com 55) com acesso ao `/admin`, separados por vírgula |
| `TELAO_CODE` | recomendado | Código para abrir `/telao` sem login |
| `MAX_UPLOAD_MB` | não | Limite por foto (padrão 12) |
| `PUBLIC_URL` | recomendado | URL pública (usada no QR code do telão) |
| `MAP_TILE_URL` / `MAP_TILE_ATTRIBUTION` | não | Troca o provedor de tiles do mapa (padrão OpenStreetMap) |

## Deploy no Railway

### 1. Criar o serviço

1. No Railway, **New Project → Deploy from GitHub repo** e escolha `Ros1991/casamentocarolfernando`.
2. O Railway detecta o `Dockerfile` e o `railway.json` (healthcheck em `/health`).
3. Em **Variables**, cadastre as variáveis da tabela acima (pelo menos `SESSION_SECRET`, `INVITE_CODE`, `ADMIN_PHONES`, `TELAO_CODE`, `PUBLIC_URL`, `DATA_DIR=/data`).
4. Em **Volumes**, crie um volume e monte em **`/data`**. Sem isso, banco e fotos somem a cada deploy.
5. Em **Settings → Networking**, gere o domínio público (ou aponte um domínio próprio por CNAME). Coloque essa URL em `PUBLIC_URL`.

Com o repositório conectado, **todo push na `main` já faz deploy**. Nada mais é necessário.

### 2. (Opcional) Deploy pelo GitHub Actions

O workflow em `.github/workflows/deploy.yml` roda o build em todo push e PR. Se quiser que o deploy saia dele em vez da integração nativa do Railway:

1. Railway: projeto → **Settings → Tokens → Create token** (token de projeto, ambiente `production`).
2. GitHub: **Settings → Secrets and variables → Actions**:
   - Secret `RAILWAY_TOKEN` = token criado;
   - Variable `RAILWAY_SERVICE` = nome do serviço no Railway.
3. Desconecte o repositório do serviço no Railway (para não fazer dois deploys por push).

Sem o secret, o job de deploy é pulado e o workflow serve só como verificação de build.

### Observações

- Volume funciona com **uma réplica**; o redeploy tem alguns segundos de indisponibilidade.
- Backup: o admin baixa todas as fotos em `.zip` e a lista de convidados em `.csv` pela tela `/admin`. O banco é o arquivo `/data/galera.db`.
- O `.env` local **não** vai para o git (está no `.gitignore`).

## Rotas

| Rota | O que é |
|---|---|
| `/entrar` | Nome, WhatsApp, hospedagem, datas de chegada/saída, código do convite |
| `/` | Início: contagem regressiva, infos do casamento, atalhos |
| `/mural` | Chat em grupo em tempo real, com fotos |
| `/mapa` | Hospedagens com quem fica em cada uma + fotos geolocalizadas |
| `/fotos` | Galeria |
| `/chegadas` | Quem chega e vai embora em cada dia |
| `/perfil` | Editar dados, foto de perfil, sair |
| `/telao` | Slideshow em tela cheia para a festa (código do telão ou login) |
| `/admin` | Estatísticas, lista de convidados, CSV e ZIP (só `ADMIN_PHONES`) |

## Estrutura

```
client/           React + Vite
  src/pages/      uma página por rota
  src/components/ Avatar, PhotoCapture (câmera + GPS + prévia), PhotoViewer, mapa…
  src/lib/        api, socket, geo (GPS/EXIF), image (compressão), offlineQueue, format
  src/store.ts    estado global (Zustand) + eventos do Socket.IO
server/           Fastify + Socket.IO
  src/routes/     auth, guests, messages, photos, telao, admin
  src/db/         schema Drizzle + conexão SQLite
  drizzle/        migrações SQL geradas
scripts/          make-icons.mjs
Dockerfile, railway.json, .github/workflows/deploy.yml
```
