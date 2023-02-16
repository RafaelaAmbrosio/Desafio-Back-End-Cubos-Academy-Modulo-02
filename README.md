![](https://i.imgur.com/xG74tOh.png)

# Desafio Módulo 2 - Back-end - Cubos Academy

Esse era o desafio do módulo 2 da Cubos, a tarefa era desenvolver uma API para um Banco Digital. Originalmente a persistência de dados deveria ser feita em memória, porém era opcional e um extra fazê-la em um arquivo `JSON`, no entanto decidi melhorar essa API com os conhecimentos de Banco de Dados adquiridos no Modulo 3 e implementar o PostgreSQL.

A API RESTful deveria:
-   Criar conta bancária
-   Listar contas bancárias
-   Atualizar os dados do usuário da conta bancária
-   Excluir uma conta bancária
-   Depósitar em uma conta bancária
-   Sacar de uma conta bancária
-   Transferir valores entre contas bancárias
-   Consultar saldo da conta bancária
-   Emitir extrato bancário
-   A API deveria seguir o padrão REST
-   Ter um código organizado, delimitando as responsabilidades de cada arquivo adequadamente. Ou seja, era esperado que ele ter, no mínimo:
    -   Um arquivo index.js
    -   Um arquivo de rotas
    -   Um pasta com controladores
-   Qualquer valor (dinheiro) deveria ser representado em centavos (Ex.: R$ 10,00 reais = 1000)
-   Evitar códigos duplicados.

## Como usar:
Após baixar a API você deve abrir um terminal no diretório `/Desafio-Back-End-Cubos-Academy-Modulo-02` e rodar o comando `npm install`, quando a instalação finalizar é só rodar o comando `npm run dev` para iniciar a API.

Você pode usar o insomnia ou outro framework de sua preferência para testar os seguintes endpoints na porta `https://localhost:3000`.

## Endpoints

### Listar contas bancárias

#### `GET` `/contas?senha_banco=Cubos123Bank`

Esse endpoint lista todas as contas bancárias existentes.

-   **Requisição** - query params (respeitando este nome)

    -   senha_banco
    

### Criar conta bancária

#### `POST` `/contas`

Esse endpoint criar uma conta bancária.

-   **Requisição** - O corpo (body) deverá possuir um objeto com as seguintes propriedades (respeitando estes nomes):

    -   nome
    -   cpf
    -   data_nascimento
    -   telefone
    -   email
    -   senha

#### Exemplo de Requisição

```javascript
// body
{
    "nome": "Foo Bar 2",
    "cpf": "00011122234",
    "data_nascimento": "2021-03-15",
    "telefone": "71999998888",
    "email": "foo@bar2.com",
    "senha": "12345"
}
```


### Atualizar usuário da conta bancária

#### `PUT` `/contas/:numeroConta/usuario`

Esse endpoint atualiza apenas os dados do usuário de uma conta bancária.

-   **Requisição** - O corpo (body) deverá possuir um objeto com todas as seguintes propriedades (respeitando estes nomes):

    -   nome
    -   cpf
    -   data_nascimento
    -   telefone
    -   email
    -   senha

#### Exemplo de Requisição
```javascript
// PUT /contas/:numeroConta/usuario
{
    "nome": "Foo Bar 3",
    "cpf": "99911122234",
    "data_nascimento": "2021-03-15",
    "telefone": "71999998888",
    "email": "foo@bar3.com",
    "senha": "12345"
{
```


### Excluir Conta

#### `DELETE` `/contas/:numeroConta`

Esse endpoint exclui uma conta bancária existente.

-   **Requisição**

    -   Numero da conta bancária (passado como parâmetro na rota)
    

### Depositar

#### `POST` `/transacoes/depositar`

Esse endpoint soma o valor do depósito ao saldo de uma conta válida e registra essa transação.

-   **Requisição** - O corpo (body) deverá possuir um objeto com as seguintes propriedades (respeitando estes nomes):

    -   numero_conta
    -   valor

#### Exemplo de Requisição
```javascript
// POST /transacoes/depositar
{
	"numero_conta": "1",
	"valor": 1900
}
```


### Sacar

#### `POST` `/transacoes/sacar`

Esse endpoint realiza o saque de um valor em uma determinada conta bancária e registra essa transação.

-   **Requisição** - O corpo (body) deverá possuir um objeto com as seguintes propriedades (respeitando estes nomes):

    -   numero_conta
    -   valor
    -   senha

#### Exemplo de Requisição
```javascript
// POST /transacoes/sacar
{
  "numero_conta": "1",
  "valor": 1900,
  "senha": "123456"
}
```


### Tranferir

#### `POST` `/transacoes/transferir`

Esse endpoint permite a transferência de recursos (dinheiro) de uma conta bancária para outra e registra essa transação.

-   **Requisição** - O corpo (body) deverá possuir um objeto com as seguintes propriedades (respeitando estes nomes):

    -   numero_conta_origem
    -   numero_conta_destino
    -   valor
    -   senha

#### Exemplo de Requisição
```javascript
// POST /transacoes/transferir
{
	"numero_conta_origem": "1",
	"numero_conta_destino": "2",
	"valor": 200,
	"senha": "123456"
}
```


### Saldo

#### `GET` `/contas/saldo?numero_conta=1&senha=12345`

Esse endpoint retorna o saldo de uma conta bancária.

-   **Requisição** - query params

    -   numero_conta
    -   senha


### Extrato

#### `GET` `/contas/extrato?numero_conta=1&senha=12345`

Esse endpoint lista as transações realizadas de uma conta específica.

-   **Requisição** - query params

    -   numero_conta
    -   senha


###### tags: `back-end` `módulo 2` `nodeJS` `API REST` `desafio`
