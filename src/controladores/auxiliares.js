const { format } = require('date-fns');
const bcrypt = require('bcrypt');
const pool = require('../dados/pool');

async function validarSenha(senhaInformada, senhaCorreta) {
  const validarSenha = await bcrypt.compare(senhaInformada, senhaCorreta);
  return validarSenha;
}

function validarInformacoesDaConta(nome, cpf, data_nascimento, telefone, email, senha) {
  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return false;
  }
  return true;
}

async function encontrarCPFOuEmail(cpf, email) {
  try {
    const resultado = await pool.query(
      `SELECT * FROM contas
       WHERE cpf = $1 OR email = $2;`,
      [cpf, email]
    );

    if (!resultado.rowCount) {
      return false;
    }
    return true;
  } catch (error) {
    console.log({ mensagem: error });
  }
}

async function encontrarContaPorId(id) {
  try {
    const resultado = await pool.query(
      `SELECT * FROM contas
       WHERE id = $1;`,
      [Number(id)]
    );

    if (!resultado.rowCount) {
      return false;
    }
    return resultado.rows[0];
  } catch (error) {
    console.log({ mensagem: error });
  }
}

function validarNumeroeValor(numero_conta, valor) {
  if (!numero_conta || !valor) {
    return false;
  }
  return true;
}

async function criarExtrato(tipo, numero_conta, valor, numero_conta_destino) {
  const data = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  let query = ``;
  let params = [];

  if (numero_conta_destino && tipo === 'transferencias') {
    params = [data, Number(numero_conta), Number(numero_conta_destino), valor];

    query = `INSERT INTO transferencias
             (data, numero_conta_origem, numero_conta_destino, valor)
             VALUES
             ($1, $2, $3, $4);`;
  } else {
    params = [data, Number(numero_conta), valor];

    if (tipo === 'saques') {
      query = `INSERT INTO saques
               (data, numero_conta, valor)
               VALUES
               ($1, $2, $3);`;
    } else if (tipo === 'depositos') {
      query = `INSERT INTO depositos
               (data, numero_conta, valor)
               VALUES
               ($1, $2, $3);`;
    }
  }

  try {
    await pool.query(query, params);
    return;
  } catch (error) {
    return error;
  }
}

async function mudarSaldoDaConta(id, valor) {
  try {
    await pool.query(
      `UPDATE contas
       SET saldo = $1
       WHERE id = $2
    `,
      [Number(valor), Number(id)]
    );
    return 'Ok';
  } catch (error) {
    return error;
  }
}

async function consultarExtrato(tipo, tipoConta, numero_conta) {
  let query = ``;
  if (tipo === 'transferencias') {
    if (tipoConta === 'numero_conta_origem') {
      query = `SELECT * FROM transferencias
               WHERE numero_conta_origem = $1
               `;
    } else if (tipoConta === 'numero_conta_destino') {
      query = `SELECT * FROM transferencias
               WHERE numero_conta_destino = $1
                 `;
    }
  } else if (tipo === 'saques') {
    query = `SELECT * FROM saques
             WHERE numero_conta = $1`;
  } else if (tipo === 'depositos') {
    query = `SELECT * FROM depositos
             WHERE numero_conta = $1`;
  }

  try {
    const resultado = await pool.query(query, [Number(numero_conta)]);
    return resultado.rows;
  } catch (error) {
    return error;
  }
}

function validarConta(conta, valor) {
  if (!conta) {
    return {
      status: 404,
      mensagem: { mensagem: 'Conta não encontrada!' },
    };
  }

  if (conta.saldo < valor) {
    return {
      status: 401,
      mensagem: { mensagem: 'Saldo insuficiente!' },
    };
  }

  return false;
}

module.exports = {
  validarSenha,
  validarInformacoesDaConta,
  encontrarCPFOuEmail,
  encontrarContaPorId,
  validarNumeroeValor,
  criarExtrato,
  mudarSaldoDaConta,
  consultarExtrato,
  validarConta,
};
