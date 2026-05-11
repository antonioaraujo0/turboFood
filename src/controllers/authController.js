/**
 * authController.js
 * Casos de uso: RF25 Inserir Login | RF26 Alterar | RF27 Remover | RF28 Visualizar
 *
 * Atores: Gerente (admin), Entregador e Cliente
 *
 * Regras de Negócio:
 *  RN01 – Bloqueio após 5 tentativas sem sucesso
 *  RN02 – Diferenciação de níveis de acesso por perfil
 */

const jwt = require('jsonwebtoken');
const { Cliente, Entregador } = require('../models');
const {
  JWT_SECRET,
  registrarTentativaFalha,
  estaBloqueado,
  limparTentativas,
} = require('../middleware/authMiddleware');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@turbofood.com';
const ADMIN_SENHA = process.env.ADMIN_SENHA || 'admin123';

// POST /auth/login  — RF25: Inserir Login
const login = async (req, res) => {
  try {
    const { email, senha, perfil } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const chave = email.toLowerCase();

    // RN01 – Verificar bloqueio por tentativas
    if (estaBloqueado(chave)) {
      return res.status(429).json({
        erro: 'Conta temporariamente bloqueada após 5 tentativas incorretas. Tente novamente em 15 minutos.',
      });
    }

    let usuarioAutenticado = null;
    let perfilFinal = perfil;

    // ── Admin (Gerente) ───────────────────────────────────────────────────────
    if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
      usuarioAutenticado = { id: 0, nomeCompleto: 'Administrador TurboFood' };
      perfilFinal = 'admin';

    // ── Cliente ───────────────────────────────────────────────────────────────
    } else if (!perfil || perfil === 'cliente') {
      const cliente = await Cliente.findOne({ where: { email } });
      if (cliente && (await cliente.verificarSenha(senha))) {
        usuarioAutenticado = { id: cliente.id, nomeCompleto: cliente.nomeCompleto };
        perfilFinal = 'cliente';
      }

    // ── Cozinha / Entregador (funcionários) ──────────────────────────────────
    } else if (perfil === 'entregador') {
      const entregador = await Entregador.findOne({ where: { email } });
      if (entregador) {
        const bcrypt = require('bcryptjs');
        const senhaOk = await bcrypt.compare(senha, entregador.senha);
        if (senhaOk) {
          usuarioAutenticado = { id: entregador.id, nomeCompleto: entregador.nomeCompleto };
          perfilFinal = perfil;
        }
      }
    }

    if (!usuarioAutenticado) {
      // RN01 – Registrar falha
      registrarTentativaFalha(chave);
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    // Login bem-sucedido: limpar tentativas e emitir token
    limparTentativas(chave);

    const token = jwt.sign(
      { id: usuarioAutenticado.id, perfil: perfilFinal, nome: usuarioAutenticado.nomeCompleto },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      perfil: perfilFinal,
      usuario: { id: usuarioAutenticado.id, nome: usuarioAutenticado.nomeCompleto },
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro no login', detalhe: error.message });
  }
};

module.exports = { login };
