# SeniorEase

Plataforma Mobile criada para facilitar a organização de atividades acadêmicas, profissionais e pessoais de pessoas idosas. O objetivo é oferecer uma experiência digital simples, acessível, previsível e segura, promovendo autonomia, confiança e inclusão digital.

## Firebase

O SeniorEase usa Firebase (Firestore Database + Authentication) como backend.

### 1. Criar o projeto

1. Acesse https://console.firebase.google.com e clique em **Criar projeto**
2. Siga o assistente (pode desabilitar o Google Analytics se preferir)

### 2. Ativar Firestore Database

1. No console do Firebase, vá em **Firestore Database > Criar banco de dados**
2. Escolha **Modo de teste** (as regras de segurança serão atualizadas depois)
3. Selecione a região mais próxima (ex: `southamerica-east1`)

### 3. Registrar o app Web

1. No console, clique no ícone **Web** (`</>`) para adicionar um app
2. Dê um nome (ex: "seniorease-web") e registre
3. Copie os valores de configuração exibidos

### 4. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com os valores do seu projeto:

```bash
cp .env.example .env
```

```env

EXPO_PUBLIC_FIREBASE_API_KEY=seu-valor
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-valor
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-valor
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-valor
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-valor
EXPO_PUBLIC_FIREBASE_APP_ID=seu-valor
EXPO_PUBLIC_USE_FIREBASE_EMULATOR=false
```

### 5. Regras do Firestore

As regras de segurança estão em `firestore.rules`. Para publicá-las:

```bash
npx firebase-tools deploy --only firestore:rules
```

### 6. Índices compostos

O arquivo `firestore.indexes.json` contém os índices necessários para as consultas do dashboard e da listagem de atividades. Para publicá-los:

```bash
npx firebase-tools init firestore     # apenas na primeira vez (responda "não" para sobrescrever firestore.rules)
npx firebase-tools deploy --only firestore:indexes
```

Os índices levam alguns minutos para ficarem ativos (status verde no console).

### 7. Autenticação

Para ativar login por email/senha:

1. No console, vá em **Authentication > Sign-in method**
2. Ative o provedor **Email/Senha**

## Instalação

```bash
pnpm install
```

## Execução

```bash
# Iniciar o Metro Bundler
pnpm start

# Abrir no Android
pnpm android

# Abrir no iOS
pnpm ios

# Abrir no navegador
pnpm web
```

No terminal do Expo, também é possível escolher a plataforma usando os atalhos exibidos pelo Metro Bundler.

## Exportação

```bash
npx expo export
```

## Testes

```bash
pnpm test              # Executa a suíte uma vez
pnpm test -- --watch   # Executa em modo watch
```

## Validação

```bash
pnpm lint                 # ESLint via Expo
pnpm exec tsc --noEmit    # Verificação de tipos
```
