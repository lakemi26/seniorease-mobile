# Arquitetura, Performance e Segurança

Este documento mapeia os requisitos de refatoração, performance e segurança para evidências concretas do código do SeniorEase Mobile.

## Arquitetura Front-end Moderna

### Arquitetura modular

O projeto está organizado por módulos de negócio em `src/modules`:

- `src/modules/activities`: atividades, execução, calendário, histórico e lembretes.
- `src/modules/authentication`: autenticação, perfil e preferências.
- `src/modules/onboarding`: primeiro acesso e configuração inicial.
- `src/modules/help`: conteúdo da central de ajuda.

Cada módulo principal separa responsabilidades em camadas:

- `domain`: entidades, contratos e regras de domínio.
- `application`: casos de uso, schemas e serviços de aplicação.
- `infrastructure`: implementações Firebase e mapeadores externos.

### Clean Architecture

A apresentação não acessa Firestore diretamente. As telas e hooks consomem casos de uso, e a ligação com Firebase fica centralizada na camada de composição:

- `src/infrastructure/composition/activity-service.ts`
- `src/infrastructure/composition/auth-service.ts`
- `src/infrastructure/composition/onboarding-service.ts`

Exemplos de fluxo:

- Tela de atividades -> `useActivitiesList` -> `getActivityUseCases()` -> `IActivityRepository` -> Firebase repository.
- Perfil -> `getAuthUseCases()` -> `IAuthRepository` -> Firebase Auth/Firestore repository.
- Primeiro acesso -> `getOnboardingUseCases()` -> `IOnboardingRepository` -> Firestore repository.

Contratos relevantes:

- `src/modules/activities/domain/repositories.ts`
- `src/modules/authentication/domain/repositories.ts`
- `src/modules/onboarding/domain/repositories.ts`

Casos de uso relevantes:

- `src/modules/activities/application/use-cases.ts`
- `src/modules/authentication/application/use-cases.ts`
- `src/modules/onboarding/application/use-cases.ts`

## State Management Patterns

O app usa gerenciamento de estado dividido por responsabilidade:

- `src/contexts/auth-context.tsx`: estado global de autenticação e perfil.
- `src/contexts/preferences-context.tsx`: preferências, preview e salvamento otimista.
- `src/contexts/theme-context.tsx`: tema derivado das preferências do usuário.
- Hooks por feature em `src/screens/**/hook`: estado local, estados derivados e ações da tela.

Padrões aplicados:

- Estado global via Context para autenticação, preferências e tema.
- Estado derivado com `useMemo` para listas, agrupamentos, progresso e tema.
- Ações estáveis com `useCallback` para eventos e operações assíncronas.
- Controle de concorrência com `useRef` para evitar race conditions em carregamentos e timers.
- Atualização otimista em preferências com rollback em caso de falha.
- `useDeferredValue` na busca de atividades para manter a interface responsiva durante filtragens locais.

## Performance e Otimização

### Paginação real

A lista principal de atividades usa paginação real no Firestore com cursor:

- Contrato: `IActivityRepository.fetchActivitiesPage` em `src/modules/activities/domain/repositories.ts`.
- Implementação Firebase: `fetchActivitiesPage` em `src/modules/activities/infrastructure/repositories/firebase-activity.repository.ts`.
- Consumo pela tela: `src/screens/activities/hook/use-activities-list.ts`.

A consulta usa `limit(pageSize)` e `startAfter(cursor)`, evitando carregar listas grandes de uma só vez.

### Cache

A primeira página da lista de atividades usa cache em memória com estratégia stale-while-revalidate:

- `src/modules/activities/application/activities-list-cache.ts`
- `src/screens/activities/hook/use-activities-list.ts`

Quando há cache válido, a tela mostra os dados imediatamente e revalida em segundo plano. Isso reduz skeletons e melhora a percepção de velocidade.

O perfil do usuário também usa cache local seguro:

- `src/shared/security/secure-profile-cache.ts`
- `src/contexts/auth-context.tsx`

### Pré-carregamento

Após autenticação, o app pré-carrega a primeira página de atividades:

- `preloadActivitiesList` em `src/modules/activities/application/activities-list-cache.ts`.
- Chamada em `src/contexts/auth-context.tsx` após carregar o perfil.

Isso antecipa a navegação para a aba de atividades e melhora o tempo de resposta percebido.

### Lazy loading

As abas usam carregamento preguiçoso para evitar inicializar telas antes de serem acessadas:

- `lazy: true` em `src/app/(private)/(tabs)/_layout.tsx`.

O roteamento por arquivos do Expo Router também mantém as telas separadas por rota, reduzindo acoplamento e facilitando carregamento sob demanda.

## Programação Reativa

O app usa programação reativa com listeners do Firebase e atualizações automáticas da UI:

- `onAuthStateChanged` via `subscribeToAuthState` no módulo de autenticação.
- `onSnapshot` para perfil e preferências em `firebase-auth.repository.ts`.
- `onSnapshot` para atividades do dashboard, calendário, lembretes e listas específicas em `firebase-activity.repository.ts`.

Com isso, alterações no backend são refletidas automaticamente na interface sem refresh manual.

## Segurança no Desenvolvimento

### Autenticação segura

O app usa Firebase Auth para cadastro, login, logout e recuperação de senha:

- `src/modules/authentication/infrastructure/firebase-auth.repository.ts`
- `src/modules/authentication/application/use-cases.ts`
- `src/contexts/auth-context.tsx`

Rotas públicas e privadas são protegidas com Expo Router:

- `Stack.Protected` em `src/app/_layout.tsx`.

Validação de entrada é feita com schemas Zod:

- `src/modules/authentication/application/schemas/login.schema.ts`
- `src/modules/authentication/application/schemas/cadastro.schema.ts`
- `src/modules/authentication/application/schemas/profile.schema.ts`
- `src/modules/activities/application/schemas/activity.schema.ts`

A regra de senha no cadastro exige no mínimo 8 caracteres, uma letra e um número.

### Criptografia de dados sensíveis

O cache local do perfil usa `expo-secure-store`, que no Android armazena valores em `SharedPreferences` criptografado pelo Android Keystore e, no iOS, usa Keychain:

- Dependência: `expo-secure-store` em `package.json`.
- Plugin Expo: `expo-secure-store` em `app.json`.
- Implementação: `src/shared/security/secure-profile-cache.ts`.

O cache seguro é usado apenas para dados de perfil. Senhas não são armazenadas pelo app.

### Regras do Firestore

As regras de segurança foram versionadas no repositório:

- `firestore.rules`
- `firebase.json`

As regras restringem acesso a:

- `users/{userId}` somente pelo próprio usuário autenticado.
- `userPreferences/{userId}` somente pelo próprio usuário autenticado.
- `activities/{activityId}` somente quando `userId` do documento pertence ao usuário autenticado.

## Evidências de Qualidade

Validações executadas durante a implementação:

- `pnpm exec tsc --noEmit`
- `pnpm test`

Resultado atual: 39 suítes e 274 testes passando. Existem avisos antigos de `act(...)` nos testes, mas eles não bloqueiam a suíte.
