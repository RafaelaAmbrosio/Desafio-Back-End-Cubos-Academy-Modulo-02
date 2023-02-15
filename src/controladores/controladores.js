const {
  validarSenha,
  validarInformacoesDaConta,
  encontrarCPFOuEmail,
  encontrarContaPorId,
  validarNumeroeValor,
  criarExtrato,
  mudarSaldoDaConta,
  consultarExtrato,
} = require('./auxiliares');
const pool = require('../dados/pool');
const bcrypt = require('bcrypt');

async function listarContas(req, res) {
  try {
    const contas = await pool.query(`SELECT * FROM contas;`);
    return res.status(200).json(contas.rows);
  } catch (error) {
    return res.status(500).json({ mensagem: error });
  }
}

async function criarConta(req, res) {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  if (!validarInformacoesDaConta(nome, cpf, data_nascimento, telefone, email, senha)) {
    return res.status(400).json({
      mensagem: 'Todos os campos são obrigatórios!',
    });
  }

  try {
    if (await encontrarCPFOuEmail(cpf, email)) {
      return res.status(400).json({
        mensagem: 'Já existe uma conta com o cpf ou e-mail informado!',
      });
    }

    const senhaCryptografada = await bcrypt.hash(senha, 10);

    const query = `INSERT INTO contas
                  (nome, cpf, data_nascimento, telefone, email, senha)
                  VALUES
                  ($1, $2, $3, $4, $5, $6)
                  `;
    const params = [nome, cpf, data_nascimento, telefone, email, senhaCryptografada];

    await pool.query(query, params);

    return res.status(201).json();
  } catch (error) {
    return res.status(500).json({ mensagem: error });
  }
}

async function atualizarUsuario(req, res) {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
  const { numeroConta } = req.params;

  if (!validarInformacoesDaConta(nome, cpf, data_nascimento, telefone, email, senha)) {
    return res.status(400).json({
      mensagem: 'Todos os campos são obrigatórios!',
    });
  }

  try {
    if (await encontrarCPFOuEmail(cpf, email)) {
      return res.status(400).json({
        mensagem: 'Já existe uma conta com o cpf ou e-mail informado!',
      });
    }

    if (!(await encontrarContaPorId(numeroConta))) {
      return res.status(404).json({
        mensagem: 'Conta não encontrada!',
      });
    }

    const senhaCryptografada = await bcrypt.hash(senha, 10);

    const query = `UPDATE contas
                   SET nome = $1, cpf = $2, data_nascimento = $3,
                   telefone = $4, email = $5, senha = $6
                   WHERE id = $7
                   `;
    const params = [nome, cpf, data_nascimento, telefone, email, senhaCryptografada, Number(numeroConta)];

    await pool.query(query, params);

    return res.status(201).json();
  } catch (error) {
    return res.status(500).json({ mensagem: error });
  }
}

async function deletarConta(req, res) {
  const { numeroConta } = req.params;

  try {
    const conta = await encontrarContaPorId(numeroConta);
    if (!conta) {
      return res.status(404).json({
        mensagem: 'Conta não encontrada!',
      });
    }

    if (conta.saldo !== 0) {
      return res.status(403).json({
        mensagem: 'A conta só pode ser removida se o saldo for zero!',
      });
    }

    await pool.query(
      `DELETE FROM contas
       WHERE id = $1`,
      [Number(numeroConta)]
    );

    return res.status(200).json();
  } catch (error) {
    return res.status(500).json({ mensagem: error });
  }
}

async function depositarValor(req, res) {
  const { numero_conta, valor } = req.body;

  if (!validarNumeroeValor(numero_conta, valor)) {
    return res.status(400).json({
      mensagem: 'O número da conta e o valor são obrigatórios!',
    });
  }

  if (valor <= 0) {
    return res.status(400).json({
      mensagem: 'O valor não pode ser igual ou menor que zero!',
    });
  }

  try {
    const conta = await encontrarContaPorId(numero_conta);
    if (!conta) {
      return res.status(404).json({
        mensagem: 'Conta não encontrada!',
      });
    }

    await criarExtrato('depositos', numero_conta, valor);

    const novoSaldo = (conta.saldo += valor);
    await mudarSaldoDaConta(numero_conta, novoSaldo);

    return res.status(201).json();
  } catch (error) {
    return res.status(500).json({ mensagem: error });
  }
}

async function sacarValor(req, res) {
  const { numero_conta, valor, senha } = req.body;

  if (!validarNumeroeValor(numero_conta, valor) || !senha) {
    return res.status(400).json({
      mensagem: 'O número da conta, valor e senha são obrigatórios!',
    });
  }

  if (valor <= 0) {
    return res.status(400).json({
      mensagem: 'O valor não pode ser igual ou menor que zero!',
    });
  }

  try {
    const conta = await encontrarContaPorId(numero_conta);

    if (!conta) {
      return res.status(404).json({
        mensagem: 'Conta não encontrada!',
      });
    }

    if (conta.saldo < valor) {
      return res.status(401).json({
        mensagem: 'Saldo insuficiente!',
      });
    }

    await criarExtrato('saques', numero_conta, valor);

    const novoSaldo = (conta.saldo -= valor);
    await mudarSaldoDaConta(numero_conta, novoSaldo);

    return res.status(201).json();
  } catch (error) {
    return res.status(500).json({ mensagem: error });
  }
}

async function tranferirValor(req, res) {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  if (!validarNumeroeValor(numero_conta_origem, valor) || !senha || !numero_conta_destino) {
    return res.status(400).json({
      mensagem: 'O todos os campos são obrigatórios!',
    });
  }

  if (valor <= 0) {
    return res.status(400).json({
      mensagem: 'O valor não pode ser igual ou menor que zero!',
    });
  }

  try {
    const contaOrigem = await encontrarContaPorId(numero_conta_origem);
    if (!contaOrigem) {
      return res.status(404).json({
        mensagem: 'Conta de origem não encontrada!',
      });
    }

    if (!(await validarSenha(senha, contaOrigem.senha))) {
      return res.status(401).json({
        mensagem: 'Senha incorreta!',
      });
    }

    if (contaOrigem.saldo < valor) {
      return res.status(401).json({
        mensagem: 'Saldo insuficiente!',
      });
    }

    const contaDestino = await encontrarContaPorId(numero_conta_destino);
    if (!contaDestino) {
      return res.status(404).json({
        mensagem: 'Conta de destino não encontrada!',
      });
    }

    await criarExtrato('transferencias', numero_conta_origem, valor, numero_conta_destino);

    const novoSaldoContaDeOrigem = (contaOrigem.saldo -= valor);
    await mudarSaldoDaConta(numero_conta_origem, novoSaldoContaDeOrigem);

    const novoSaldoContaDeDestino = (contaDestino.saldo += valor);
    await mudarSaldoDaConta(numero_conta_destino, novoSaldoContaDeDestino);

    return res.status(201).json();
  } catch (error) {
    return res.status(500).json({ mensagem: error });
  }
}

async function mostrarSaldoDaConta(req, res) {
  const { numero_conta } = req.query;

  try {
    const conta = await encontrarContaPorId(numero_conta);

    if (!conta) {
      return res.status(404).json({
        mensagem: 'Conta não encontrada!',
      });
    }

    const saldo = conta.saldo;
    return res.status(200).json({
      saldo,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: error });
  }
}

async function extratoDaConta(req, res) {
  const { numero_conta } = req.query;

  return res.status(200).json({
    depositos: await consultarExtrato('depositos', 'numero_conta', numero_conta),
    saques: await consultarExtrato('saques', 'numero_conta', numero_conta),
    transferenciasEnviadas: await consultarExtrato('transferencias', 'numero_conta_origem', numero_conta),
    transferenciasRecebidas: await consultarExtrato('transferencias', 'numero_conta_destino', numero_conta),
  });
}

module.exports = {
  listarContas,
  criarConta,
  atualizarUsuario,
  deletarConta,
  depositarValor,
  sacarValor,
  tranferirValor,
  mostrarSaldoDaConta,
  extratoDaConta,
};
