# Política de Segurança — Mercury Racing

## Versões Suportadas

Apenas a versão mais recente da aplicação (branch `main`) recebe suporte ativo e atualizações de segurança.

| Versão             | Suportada |
| ------------------ | --------- |
| `main` (Atual)     | ✅ Sim    |
| Versões Anteriores | ❌ Não    |

---

## Reportando uma Vulnerabilidade

A segurança dos dados da aplicação e da infraestrutura do Firebase é uma prioridade. Por favor, **não abra uma Issue pública** para relatar vulnerabilidades de segurança.

Isso inclui, mas não se limita a:

- Vazamento acidental de chaves sensíveis de infraestrutura.
- Falhas nas regras de segurança do **Firebase Authentication** que permitam o bypass das rotas protegidas (`/app/*`).
- Vulnerabilidades graves (ex: XSS, CSRF) encontradas em pacotes de dependências (`node_modules`).
- Manipulação indevida dos estados do **Zustand** que exponha dados analíticos privados de outros usuários.

### Como relatar

Se você descobrir qualquer vulnerabilidade de segurança, envie um e-mail diretamente para a manutenção do projeto.

Todas as vulnerabilidades relatadas de forma privada serão avaliadas, e nossa equipe entrará em contato em até **5 dias úteis** com um plano de mitigação e correção antes da divulgação pública do patch.
