# Diretrizes de Contribuição — Mercury Racing

## Sumário

- [Diretrizes de Contribuição — Mercury Racing](#diretrizes-de-contribuição--mercury-racing)
    - [Sumário](#sumário)
    - [Estratégia de Branches](#estratégia-de-branches)
    - [Fluxo de Trabalho](#fluxo-de-trabalho)
    - [Exemplos de Commits](#exemplos-de-commits)
    - [Setup de Desenvolvimento](#setup-de-desenvolvimento)
        - [Pré-requisitos](#pré-requisitos)
        - [Configuração do Ambiente](#configuração-do-ambiente)
    - [Padrões de Código](#padrões-de-código)
    - [Diretrizes Específicas](#diretrizes-específicas)
        - [Consumo da API (OpenF1)](#consumo-da-api-openf1)
        - [Autenticação (Firebase)](#autenticação-firebase)
    - [Testes e Mocks](#testes-e-mocks)
        - [Dados de Fallback (Mocks)](#dados-de-fallback-mocks)
        - [Responsividade](#responsividade)

---

## Estratégia de Branches

A branch `main` é protegida. **Commits diretos são proibidos** — todo código deve ser testado localmente e aprovado antes de ir para produção.

Todas as alterações devem ser enviadas via **Pull Request (PR)** apontando para a branch `main`.

Utilize o padrão **GitFlow** para nomenclatura de branches:

| Prefixo     | Uso                                                       | Exemplo                      |
| ----------- | --------------------------------------------------------- | ---------------------------- |
| `feature/`  | Novas implementações (ex: nova página, novo componente)   | `feature/driver-profile`     |
| `bugfix/`   | Correção de falhas lógicas, de interface ou de API        | `bugfix/table-overflow`      |
| `docs/`     | Atualizações na documentação                              | `docs/atualiza-readme`       |
| `style/`    | Alterações puramente visuais (SCSS, cores, tipografia)    | `style/dark-mode-colors`     |
| `refactor/` | Refatoração de código sem adição de novas funcionalidades | `refactor/standings-service` |

---

## Fluxo de Trabalho

**1. Atualize sua `main` local:**

```bash
git checkout main
git pull origin main
```

**2. Crie sua branch de trabalho:**

```bash
git checkout -b <tipo>/<descricao>
```

**3. Faça commits lógicos seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/):**

```bash
git add <arquivos>
git commit -m "<tipo>(<escopo>): <descricao>"
```

> Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`.

**4. Envie sua branch e abra o Pull Request:**

```bash
git push -u origin <tipo>/<descricao>
```

---

## Exemplos de Commits

```
feat(api): consome rota de standings da OpenF1
fix(ui): corrige sobreposição de texto no mobile
style(theme): adiciona variáveis de cor da Ferrari e McLaren
docs(readme): atualiza instruções de setup local
refactor(auth): move lógica do Firebase para hook customizado
```

---

## Setup de Desenvolvimento

### Pré-requisitos

- Node.js (v18 ou superior)
- Gerenciador de pacotes `npm` (ou `yarn`)
- Conta no Firebase com projeto web criado (para chaves de autenticação)

### Configuração do Ambiente

**1. Clone o repositório:**

```bash
git clone https://github.com/franssoares/mercury-racing.git
```

**2. Instale as dependências:**

```bash
cd mercury-racing
npm install
```

**3. Configure as variáveis de ambiente:**

Copie o arquivo de exemplo para criar o seu arquivo de ambiente local:

```bash
cp .env.example .env.local
```

Edite o `.env.local` com as suas chaves da API do Firebase.

> ⚠️ **NUNCA comite o arquivo `.env.local`.** Ele contém credenciais sensíveis e já está listado no `.gitignore`.

**4. Inicie o servidor de desenvolvimento (Vite):**

```bash
npm run dev
```

---

## Padrões de Código

O projeto utiliza **React 18+** com **TypeScript**. Siga as diretrizes abaixo para manter a estabilidade e a manutenibilidade da base de código:

- **Tipagem Rigorosa:** Não utilize `any`. Tipifique todas as respostas da API OpenF1 (Pilotos, Construtores, Sessões) utilizando `Interfaces` ou `Types` do TypeScript.

- **Componentes Funcionais:** Utilize apenas componentes funcionais e React Hooks. Evite componentes de classe.

- **Gerenciamento de Estado:**
    - Para estados globais simples (ex: Tema Escuro), utilize a store do **Zustand**.
    - Para dados em cache de requisições, isole a lógica em `services` com **Axios**.

- **Estilização com SCSS:** Utilize variáveis globais para manter a consistência do design system (ex: `$color-ferrari-red`, `$color-carbon-black`).

```typescript
// ✅ Correto — Tipado e componentizado
interface DriverProps {
  driverId: string;
  points: number;
}

export const DriverRow = ({ driverId, points }: DriverProps) => {
  return <div>{driverId}: {points} pts</div>;
};
```

---

## Diretrizes Específicas

### Consumo da API (OpenF1)

- **Tratamento de Erros:** Todas as chamadas Axios devem possuir blocos `try/catch`. Mostre um feedback visual amigável (UI State) caso os servidores da FIA estejam indisponíveis.
- **Loading States:** Sempre implemente skeletons ou spinners enquanto os dados da telemetria ou classificação estiverem sendo carregados.

### Autenticação (Firebase)

A verificação de rotas protegidas (ex: `/app/realtime`) deve ocorrer a nível de roteador (React Router), redirecionando usuários não autenticados para `/login`.

---

## Testes e Mocks

### Dados de Fallback (Mocks)

Como a API da Fórmula 1 pode sofrer bloqueios (rate limit) ou instabilidades fora de finais de semana de corrida:

- Toda tela nova dependente de API deve ser testada inicialmente com os arquivos `.json` estáticos localizados na pasta `src/mocks/`.
- Certifique-se de que a interface lida graciosamente com arrays vazios ou estruturas de dados ausentes.

### Responsividade

Teste toda modificação visual no DevTools do navegador simulando dispositivos móveis antes de abrir o Pull Request. A tabela de telemetria deve permitir scroll horizontal no mobile sem quebrar o layout da página.

---

_Diretrizes de contribuição para o Mercury Racing — UFRN_
