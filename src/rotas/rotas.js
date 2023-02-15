const express = require('express');
const {
  listarContas,
  criarConta,
  atualizarUsuario,
  deletarConta,
  depositarValor,
  sacarValor,
  tranferirValor,
  mostrarSaldoDaConta,
  extratoDaConta,
} = require('../controladores/controladores');
const { validarSenhaBanco, validarSenhaContaBody, validarSenhaContaQuery } = require('../middlewares/validarSenha');
const roteador = express();

roteador.get('/contas', validarSenhaBanco, listarContas);
roteador.get('/contas/saldo', validarSenhaContaQuery, mostrarSaldoDaConta);
roteador.get('/contas/extrato', validarSenhaContaQuery, extratoDaConta);

roteador.post('/contas', criarConta);
roteador.post('/transacoes/depositar', depositarValor);
roteador.post('/transacoes/sacar', validarSenhaContaBody, sacarValor);
roteador.post('/transacoes/transferir', tranferirValor);

roteador.put('/contas/:numeroConta/usuario', atualizarUsuario);

roteador.delete('/contas/:numeroConta', deletarConta);

module.exports = roteador;
