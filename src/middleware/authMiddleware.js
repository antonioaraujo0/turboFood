/**
 * authMiddleware.js
 * Casos de uso: RF25 Inserir Login | RF26 Alterar | RF27 Remover | RF28 Visualizar
 *
 * Regras de Negócio:
 *  RN01 – Bloqueio após 5 tentativas sem sucesso (in-memory; em produção usar Redis/DB)
 *  RN02 – Diferenciação de níveis de acesso: ADM | cliente | funcionário
 *         (cozinha e entregador são subtipos de funcionário)
 *
 * Implementação simplificada usando JWT.
 * Para produção: substituir o secret por variável de ambiente e usar Redis para tentativas.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'turbofood_secret_dev';

// RN01 – Controle de tentativas falhas (in-memory)
const tentativasFalhas = {};
const LIMITE_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000; // 15 minutos

function registrarTentativaFalha(identificador) {
  if (!tentativasFalhas[identificador]) {
    tentativasFalhas[identificador] = { count: 0, bloqueadoAte: null };
  }
  tentativasFalhas[identificador].count += 1;

  if (tentativasFalhas[identificador].count >= LIMITE_TENTATIVAS) {
    tentativasFalhas[identificador].bloqueadoAte = Date.now() + BLOQUEIO_MS;
  }
}

function estaBloqueado(identificador) {
  const registro = tentativasFalhas[identificador];
  if (!registro || !registro.bloqueadoAte) return false;
  if (Date.now() > registro.bloqueadoAte) {
    // Desbloqueio automático após o período
    delete tentativasFalhas[identificador];
    return false;
  }
  return true;
}

function limparTentativas(identificador) {
  delete tentativasFalhas[identificador];
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware: verificar JWT e extrair perfil
// ─────────────────────────────────────────────────────────────────────────────
function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload; // { id, perfil: 'admin' | 'cliente' | 'cozinha' | 'entregador' }
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware: RN02 – Autorização por perfil
// Uso: autorizarPerfil('admin', 'cozinha')
// ─────────────────────────────────────────────────────────────────────────────
function autorizarPerfil(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Não autenticado.' });
    }
    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({
        erro: `Acesso negado. Perfil "${req.usuario.perfil}" não tem permissão para esta ação.`,
      });
    }
    next();
  };
}

module.exports = {
  autenticar,
  autorizarPerfil,
  registrarTentativaFalha,
  estaBloqueado,
  limparTentativas,
  JWT_SECRET,
};
