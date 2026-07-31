# Como conectar ao Firebase — SAKUMA Agronegócios
### Checklist de Manutenção de Máquinas e Implementos

---

## O que o Firebase faz aqui

Quando configurado, o sistema:

- **Sincroniza automaticamente** entre todos os aparelhos em ≤ 2 segundos
- **Funciona sem internet** — preenche normalmente; sobe quando reconectar
- **Não perde dados** — antes de enviar ao servidor, salva no próprio aparelho
- **Rastreia quem alterou o quê** pelo campo "Registrado por" em cada inspeção

Os dados ficam numa conta Google **no banco Firestore** (Google Cloud). O plano gratuito cobre o uso da SAKUMA sem custo.

---

## Passo 1 — Criar a conta e o projeto Firebase

1. Acesse **https://console.firebase.google.com** e entre com a conta Google (pode ser conta pessoal, ex: `nome@gmail.com`).

2. Clique em **Criar projeto**.

3. Nome do projeto: `sakuma-manutencao` (ou qualquer nome).

4. **Desative o Google Analytics** (não é necessário).

5. Clique em **Criar projeto** e aguarde ~30 segundos.

---

## Passo 2 — Criar o banco Firestore

1. No menu lateral esquerdo, clique em **Compilação → Firestore Database**.

2. Clique em **Criar banco de dados**.

3. Na tela de regras de segurança, escolha **Iniciar no modo de produção**.

4. Localização: escolha **southamerica-east1 (São Paulo)** — mais próximo das fazendas.

5. Clique em **Ativar**.

---

## Passo 3 — Liberar o acesso (Regras do Firestore)

Por padrão o banco rejeita tudo. Você precisa liberar o acesso para os usuários do app.

1. No menu do Firestore, clique em **Regras**.

2. Substitua o conteúdo existente pelo texto abaixo e clique em **Publicar**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sakuma/manutencao {
      allow read, write: if true;
    }
  }
}
```

> **Nota de segurança:** esta regra permite acesso a qualquer pessoa que tenha as credenciais do app. Como o app já tem senha própria (Lais, Vinicius, Guilherme, Matheus, Fabio), isso é aceitável para uso interno. Quando quiser restringir ainda mais, é possível adicionar autenticação Firebase por e-mail — avise que configuro isso.

---

## Passo 4 — Obter as credenciais do app

1. Na tela inicial do projeto Firebase, clique no ícone **`</>`** (Web app).

2. Nome do app: `Checklist SAKUMA`.

3. **Não** marque "Firebase Hosting" (vai hospedar no Azure/Netlify).

4. Clique em **Registrar app**.

5. Na próxima tela aparece um bloco de código assim:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "sakuma-manutencao.firebaseapp.com",
  projectId: "sakuma-manutencao",
  storageBucket: "sakuma-manutencao.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

6. Copie esses valores — você vai precisar na próxima etapa.

---

## Passo 5 — Configurar o app

1. Abra o `index.html` no navegador (do Netlify, Azure, ou direto do disco).

2. No topo da tela há uma barra marrom que diz **"Banco não configurado"**.

3. Clique no botão **⚙ Banco** à direita dessa barra.

4. Cole cada valor do `firebaseConfig` no campo correspondente:
   - `apiKey` → campo **API Key**
   - `authDomain` → campo **Auth Domain**
   - `projectId` → campo **Project ID**
   - `storageBucket` → campo **Storage Bucket**
   - `messagingSenderId` → campo **Messaging Sender ID**
   - `appId` → campo **App ID**

5. Clique em **Salvar**.

6. A barra muda para verde e exibe **"Banco sincronizado · HH:MM"**.

> Esta configuração fica guardada naquele aparelho. **Repita o Passo 5 em cada celular, tablet e computador** que vai usar o app.

---

## Como fica o dia a dia

| Situação | O que acontece |
|---|---|
| Todos com sinal | Qualquer alteração aparece nos outros aparelhos em ≤ 2 segundos |
| Sem sinal no campo | Preenche normalmente; dados ficam salvos localmente |
| Volta o sinal | O app sobe automaticamente o que ficou pendente |
| Outro usuário alterou algo enquanto você estava offline | Você recebe um aviso "Dados atualizados por outro usuário" |

A **barra de status** no topo sempre mostra o estado:
- **Verde** → sincronizado
- **Âmbar piscando** → aguardando conexão para sincronizar (sem sinal)
- **Vermelho** → erro de conexão (credenciais erradas ou sem internet por muito tempo)

---

## Onde ficam os dados

No Firestore, tudo fica em um único documento:

```
Coleção: sakuma
  Documento: manutencao
    → implementos: [...]
    → itens: [...]
    → inspecoes: [...]
    → anomalias: [...]
```

Para ver os dados brutos: **Console Firebase → Firestore Database → sakuma → manutencao**.

---

## Limites do plano gratuito (Spark)

| O que conta | Limite gratuito | Estimativa da SAKUMA |
|---|---|---|
| Leituras por dia | 50.000 | ~200–500/dia |
| Gravações por dia | 20.000 | ~50–200/dia |
| Armazenamento | 1 GB | depende do volume de fotos |
| Transferência | 10 GB/mês | baixo uso |

**Atenção com fotos:** cada foto de celular em resolução padrão (~3–5 MB) vira ~4–7 MB no banco. Com 10 fotos por inspeção e 20 inspeções por mês, são ~1,4 GB/mês — que ultrapassa o plano gratuito. **Recomendação:** tire as fotos com qualidade média no celular (configuração da câmera), ou comprima antes de salvar. O app limita a 8 MB por foto, mas não comprime automaticamente.

Se o uso crescer, o plano pago (Blaze) cobra apenas pelo que usar: ~R$ 0,06 por GB armazenado, ~R$ 0,18 por 100k leituras.

---

## Hospedar o app (necessário para offline funcionar)

O Firebase foi configurado; agora o `index.html` precisa estar num endereço HTTPS. As opções mais rápidas:

**Netlify Drop** (mais rápido, gratuito):
1. Acesse `app.netlify.com/drop`
2. Arraste a **pasta inteira** (index.html + sw.js + manifest.json + ícones)
3. Pronto — endereço gerado em segundos

**Azure Static Web Apps** (combina com o M365 da empresa):
1. Portal Azure → criar recurso "Static Web App" → plano Free
2. Enviar os arquivos pelo portal

---

## Quando publicar uma versão nova

Ao baixar um `index.html` atualizado e colocar no servidor, o `sw.js` já está com a versão `v2`. Se você atualizar de novo no futuro, mude para `v3`, `v4` etc., senão os celulares ficam com a versão antiga em cache.
