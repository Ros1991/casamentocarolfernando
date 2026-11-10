# Galera do Casamento — Anna Carolina & Fernando

Rede social do casamento (19/12/2026, Espaço Tuá, Maceió/AL): quem fica onde, mural em tempo real, fotos tiradas na hora marcadas no mapae "quem chega quando".

O plano completo e as decisões estão em [PLANO.md](PLANO.md).

## Stack

- **Client:** React 19 + Vite 7 + TypeScript + Tailwind 4, Leaflet (OpenStreetMap), Socket.IO client, Zustand. PWA (manifest + ícones).
- **Server:** Node 22 + Fastify 5 + Socket.IO, SQLite (better-sqlite3 + Drizzle ORM), sharp para fotos.
- **Deploy:** um único serviço no Railway com um volume em `/data` (banco + fotos). Dockerfile multi-stage.

## Rodar localmente

```bash
npm install
cp .env.example .env   # ajuste ADMIN_PHONES
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
| `INVITE_CODE` | não | Código que os convidados digitam na entrada. **Está vazio (sem código)** por decisão dos noivos; defina uma palavra para passar a exigir |
| `ADMIN_PHONES` | recomendado | Telefones (só dígitos, com 55) com acesso ao `/admin`, separados por vírgula |
| `MAX_UPLOAD_MB` | não | Limite por foto (padrão 12) |
| `PUBLIC_URL` | recomendado | URL pública (usada nos avisos e links) |
| `MAP_TILE_URL` / `MAP_TILE_ATTRIBUTION` | não | Troca o provedor de tiles do mapa (padrão OpenStreetMap) |
| `PIX_KEY` / `PIX_HOLDER` | não | Chave Pix dos noivos e o que aparece embaixo dela (ex.: `CPF · Nome`). Só vai para quem já entrou; vazia = card de presentes sem Pix |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | para avisos | Chaves do Web Push (avisos de novas mensagens). Sem elas, os avisos ficam desligados |

## Mural

- Mensagens e fotos em tempo real, com reações, **respostas com citação** e **menções com @** (quem é marcado ou respondido recebe aviso próprio), além de paleta de emojis.
- No `/admin`, "Limpar mural" apaga as mensagens de texto (as fotos ficam).
- O app aberto ou instalado **se atualiza sozinho** quando sai versão nova.

## Combinados (Agenda)

- Admins criam **combinados dos noivos** (ex.: Jangaday em 21/12): ficam em destaque na Agenda, no Início, no mapa (se tiverem ponto), entram como mensagem no mural e disparam aviso no celular de todos que ativaram notificações.
- Qualquer convidado pode **propor um combinado da galera** (mesmo fluxo, sem o aviso geral).
- Cada convidado responde **Vou / Talvez / Não vou** e, se tiver acompanhantes, diz quantos da sua turma vão. A lista de quem vai fica em "Ver quem vai"; no `/admin` há a contagem e um CSV por combinado.

## Domínio

`app.annacarolinaefernando.com` é um CNAME (`app` → `vdx2u7zy.up.railway.app`) criado no DNS do domínio dos noivos, que fica no Canva (Configurações → Domínios da web → domínio → Configurações avançadas → Gerenciar → Registros DNS). O Railway emite e renova o certificado HTTPS sozinho. `PUBLIC_URL` e `VAPID_SUBJECT` apontam para esse domínio.

## App instalável e avisos

- O site é um PWA: no Android/Chrome aparece um convite "Instalar o app" no Início (diálogo nativo); no iPhone o Safari não oferece esse botão, então o Início mostra o passo a passo (Compartilhar → Adicionar à Tela de Início). Instalado, abre em tela cheia pelo ícone.
- **Avisos de mensagens** (Web Push): o convidado ativa no Início ou no Perfil. Quem está com o app fechado recebe um aviso quando alguém posta no mural, no máximo um a cada 2 minutos por aparelho; quem está com o app aberto em segundo plano recebe um aviso local. No iPhone, só funciona com o app instalado na tela inicial (regra da Apple, iOS 16.4+).
- O service worker (`client/public/sw.js`) não intercepta `/api`, `/uploads` nem `/socket.io`; guarda em cache só os assets com hash e a casca do app.

## Deploy no Railway

O projeto já está no ar: **projeto `galera-casamento`**, serviço **`galera`**, ligado ao repositório `Ros1991/casamentocarolfernando` (branch `main`). **Todo push na `main` faz deploy automaticamente.**

- URL oficial: <https://app.annacarolinaefernando.com> (o endereço <https://galera-production.up.railway.app> continua funcionando)
- Região `us-east4` (Virgínia, a de menor latência para o Brasil entre as disponíveis).
- Volume `galera-data` montado em `/data` (banco `galera.db` + `uploads/`).
- Variáveis cadastradas no serviço (ver tabela acima). `ADMIN_PHONES` tem os noivos e o Rodrigo; `INVITE_CODE` está desligado.

### Infraestrutura como código (`.railway/railway.ts`)

O `railway.json` foi aposentado pelo Railway (deixa de ser lido em 01/12/2026). A configuração do projeto vive em [`.railway/railway.ts`](.railway/railway.ts): serviço, fonte GitHub, volume, região, healthcheck e as variáveis (valores secretos ficam só no Railway, marcados com `preserve()`).

```bash
npm install                 # instala o SDK "railway" (devDependency)
railway link                # uma vez por máquina: projeto galera-casamento, ambiente production
railway config plan         # mostra o que mudaria no Railway
railway config apply        # aplica (pede confirmação)
```

### Workflow do GitHub Actions

`.github/workflows/deploy.yml` compila o projeto em todo push e PR (verificação). O deploy em si é feito pela integração GitHub do Railway. Se um dia quiser que o deploy saia do Actions, cadastre o secret `RAILWAY_TOKEN` e a variable `RAILWAY_SERVICE=galera` no GitHub e desconecte o repositório no Railway, para não ter dois deploys por push.

### Observações

- Volume funciona com **uma réplica**; o redeploy tem alguns segundos de indisponibilidade.
- O container roda como root porque o volume é montado como root (rodar como `node` dava `EACCES` em `/data`).
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
| `/agenda` | Combinados (dos noivos e da galera) com confirmação de presença; aba "Quem chega quando" |
| `/perfil` | Editar dados, foto de perfil, sair |
| `/admin` | Estatísticas, lista de convidados, CSV e ZIP (só `ADMIN_PHONES`) |

## Estrutura

```
client/           React + Vite
  src/pages/      uma página por rota
  src/components/ Avatar, PhotoCapture (câmera + GPS + prévia), PhotoViewer, mapa…
  src/lib/        api, socket, geo (GPS/EXIF), image (compressão), offlineQueue, format
  src/store.ts    estado global (Zustand) + eventos do Socket.IO
server/           Fastify + Socket.IO
  src/routes/     auth, guests, messages, photos, events, push, admin
  src/db/         schema Drizzle + conexão SQLite
  drizzle/        migrações SQL geradas
scripts/          make-icons.mjs
Dockerfile, railway.json, .github/workflows/deploy.yml
```
