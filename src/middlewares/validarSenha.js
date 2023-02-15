const { validarSenha, encontrarContaPorId } = require('../controladores/auxiliares');
const pool = require('../dados/pool');

async function validarSenhaBanco(req, res, next) {
  const { senha_banco } = req.query;

  if (!senha_banco) {
    return res.status(401).json({
      mensagem: 'Informe uma senha!',
    });
  }

  try {
    const banco = await pool.query(`SELECT * FROM banco;`);
    const senhaBancoCorreta = banco.rows[0].senha;

    if (!validarSenha(senha_banco, senhaBancoCorreta)) {
      return res.status(401).json({
        mensagem: 'A senha do banco informada é inválida!',
      });
    }
  } catch (error) {
    return res.status(500).json({ mensagem: error });
  }

  next();
}

async function validarSenhaContaBody(req, res, next) {
  const { numero_conta, senha } = req.body;

  if (!numero_conta || !senha) {
    return res.status(401).json({
      mensagem: 'Informe o numero da conta e a senha!',
    });
  }

  const conta = await encontrarContaPorId(numero_conta);
  if (!conta) {
    return res.status(404).json({
      mensagem: 'Conta bancária não encontada!',
    });
  }

  if (!(await validarSenha(senha, conta.senha))) {
    return res.status(401).json({
      mensagem: 'Senha incorreta!',
    });
  }

  next();
}

async function validarSenhaContaQuery(req, res, next) {
  const { numero_conta, senha } = req.query;

  if (!numero_conta || !senha) {
    return res.status(401).json({
      mensagem: 'Informe o numero da conta e a senha!',
    });
  }

  const conta = await encontrarContaPorId(numero_conta);
  if (!conta) {
    return res.status(404).json({
      mensagem: 'Conta bancária não encontada!',
    });
  }

  if (!(await validarSenha(senha, conta.senha))) {
    return res.status(401).json({
      mensagem: 'Senha incorreta!',
    });
  }

  next();
}

module.exports = { validarSenhaBanco, validarSenhaContaBody, validarSenhaContaQuery };
