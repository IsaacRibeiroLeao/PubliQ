---
description: Diretrizes obrigatórias de arquitetura, qualidade de código e Git do projeto
globs: "**/*"
alwaysApply: true
---

# Diretrizes do Projeto React & Fullstack

Você é um assistente focado em manter o código limpo, modular, sem erros de tipagem e estritamente alinhado com o controle de versão e arquitetura limpa.

---

## 1. Padrões de Código & Arquitetura

### Estrutura de Pastas & Organização
- **Componentes:** Mantenha em `/src/components`.
- **Hooks Customizados:** Mantenha em `/src/hooks`.
- **Utilitários:** Mantenha em `/src/utils`.

### Componentes React
- **Functional Components:** Sempre use componentes funcionais com hooks.
- **Arquivo Único:** Apenas **um componente por arquivo**.
- **Nomenclatura:** O nome do arquivo deve corresponder exatamente ao nome do componente (ex: `UserProfile.tsx` exporta `UserProfile`).
- **Tipagem com TypeScript:** Sempre tipar explicitamente as *props* usando `interface` ou `type`.

### Gerenciamento de Estado
- **Estado Local:** Use `useState` para controle simples de estado local do componente.
- **Estado Compartilhado:** Use `useContext` para compartilhar estado entre múltiplos componentes sem *prop drilling*.
- **Estado Complexo:** Considere o uso de `useReducer` para gerenciar lógicas de estado mais complexas ou transições de estado acopladas.

### Otimização & Performance
- **React.memo:** Memorize componentes pesados para evitar re-renderizações desnecessárias quando as *props* não mudarem.
- **useCallback:** Envolva funções passadas como *props* para componentes filhos em `useCallback`.
- **useMemo:** Utilize `useMemo` para evitar o recálculo de operações custosas a cada renderização.

### Princípio DRY (Don't Repeat Yourself) & Abstração Inteligente
O objetivo central do DRY é garantir que **cada conhecimento, regra de negócio ou lógica no sistema possua uma representação única, não ambígua e autoritativa**.

#### 1. Identificação Ativa de Duplicidades
Antes de criar qualquer nova função, hook, componente ou tipo:
- **Busca por Padrões:** Pesquise na estrutura existente por termos ou lógicas equivalentes (ex: formatações de data/moeda, lógica de ordenação, validações de formulário, seletores de estado).
- **Mapeamento de Funções Semelhantes:** Se duas funções realizam ações parecidas (ex: uma formata CPF e outra CNPJ, ou dois blocos fazem chamadas HTTP com estruturas quase idênticas), **não crie uma terceira**. Unifique-as.

#### 2. Protocolo de Refatoração Dinâmica
Ao detectar código duplicado em arquivos diferentes:
1. **Extração:** Remova a lógica repetida dos arquivos de origem.
2. **Centralização:** Mova o código para um local apropriado segundo a arquitetura do projeto (`/src/utils`, `/src/hooks`, etc.).
3. **Parametrização & Generics:**
   - Converta valores hardcoded e comportamentos específicos em parâmetros flexíveis.
   - Utilize Generics em TypeScript (`<T>`) para lidar com estruturas de dados variadas sem perder a segurança de tipagem.
   - Forneça valores padrão (*default parameters*) para manter a retrocompatibilidade e evitar *breaking changes*.
4. **Revinculação:** Importe e aplique a nova função unificada nos arquivos originais onde a duplicidade existia.

#### 3. DRY no Contexto Fullstack / Arquitetura
- **Contratos Unificados (Front & Back):** Nunca duplique definições de interfaces ou schemas (ex: Zod/Yup/TypeBox). Mantenha os schemas no backend ou em uma pasta compartilhada (`@/shared`), exportando os tipos derivados (`z.infer<typeof schema>`) para o frontend.
- **Componentes de UI:** Se dois componentes visuais possuem a mesma estrutura com alterações pequenas de estilo ou conteúdo, refatore para um único componente parametrizado via *props* (ex: variação de cores, slots, tamanhos, `children`).

#### 4. Regra de Ouro: Evite Abstração Precoce (*AHA Programming*)
- **O Princípio da Terceira Ocorrência (Rule of Three):** Não abstraia código na primeira vez em que ver duas linhas parecidas se a lógica intrínseca for distinta ou puder mudar de rumo no futuro. Prefira duplicar levemente a criar uma abstração confusa que exija dezenas de `if/else` internos para tratar exceções.
- **Evite Funções "Deus":** Uma função unificada deve ser dinâmica, mas ter **uma única responsabilidade clara**. Se para tornar a função dinâmica for necessário adicionar parâmetros booleanos de controle complexos (ex: `isUserAdmin`, `skipFormatting`, `forceFallback`), divida em funções menores ou com composição.

### Isolamento de Responsabilidades (Front & Back)
- **Frontend:** Mantenha componentes focados na renderização/UI. Regras de negócio complexas, transformações de dados e chamadas de API devem ser isoladas em custom hooks (`/src/hooks`) ou arquivos de serviço/utilitários (`/src/utils`).
- **Backend / API (se aplicável):** Mantenha rotas enxutas. A lógica de negócio deve residir na camada de serviços/controllers e a validação de schemas deve ocorrer na entrada da requisição.

### Qualidade e Estilo
- Prefira composições simples e modulares a componentes gigantes ou monolíticos.
- Utilize nomes descritivos para variáveis, funções e componentes.
- Evite o uso de `any` no TypeScript; utilize tipos estritos, genéricos ou `unknown` quando aplicável.

---

## 2. Regras de Comentários e Documentação

- **Uso Pontual e Estritamente Informativo:**
  - Evite comentar o código no dia a dia; o código deve ser limpo e autoexplicativo por padrão.
  - Comentários devem ser usados raramente e **exclusivamente no nível de função/método/hook** quando for necessário fornecer um contexto informativo relevante.
  - Quando utilizar, escreva um bloco informativo claro (ex: JSDoc/TSDoc) detalhando o propósito da função, parâmetros não óbvios ou regras de negócio específicas atreladas a ela.
  - Não coloque comentários inline no meio de blocos de código nem adicione marcações do tipo `TODO` ou `FIXME`.

---

## 3. Boas Práticas e Padrões Git

### Boas Práticas de Repositório
- **Escopo Pequeno e Atômico:** Faça alterações focadas no problema solicitado. Não altere arquivos não relacionados à tarefa sem necessidade.
- **Atencioso com `.gitignore`:** Nunca sugira versionar arquivos de ambiente (`.env`), pastas de build (`dist`, `.next`) ou diretórios de dependências (`node_modules`).

---

## 4. Pós-processamento Obrigatório

Após realizar qualquer alteração, refatoração ou criação de arquivos no código, execute este checklist sequencial:

1. **Validação e Linting:**
   - Execute a verificação de tipos: `pnpm typecheck` (ou `yarn typecheck`).
   - Execute o linter: `yarn lint` (ou `pnpm lint`).
   - Se algum desses comandos retornar erros ou alertas, **corrija-os imediatamente** antes de responder ao usuário.

2. **Atualização da Documentação (`README.md`):**
   - Verifique se as alterações introduziram uma nova funcionalidade, uma nova rota, um novo componente/hook utilitário relevante ou alteraram variáveis de ambiente e dependências.
   - Se sim, **atualize o arquivo `README.md`** refletindo essas mudanças (ex: atualizando a lista de recursos, guias de uso ou instruções de instalação/configuração) antes de prosseguir com o commit.

3. **Verificação Git, Staging e Mensagem de Commit:**
   - Verifique se o diretório atual é um repositório Git (`git rev-parse --is-inside-work-tree`).
   - Se o repositório Git for detectado:
     - Execute `git status -s` para listar e agrupar todos os arquivos criados, modificados ou removidos (incluindo o `README.md` se foi alterado).
     - Prepare as alterações para staging (`git add <arquivos-alterados>`).
     - Sugira ao usuário a mensagem final no padrão **Conventional Commits**:
       - Formato: `<tipo>(<escopo>): <descrição curta em português ou inglês>`
       - Tipos comuns: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`.
       - *Exemplo:* `feat(auth): adiciona validação de schema no formulário de login`