import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────── INITIAL DATA ─────────────────────────── */
const INIT = {
  clientes: [
    { id: 1, nome: "João Carlos Souza", cpf: "123.456.789-00", email: "joao@email.com", telefone: "(28) 99999-1234", dataCadastro: "2024-01-10", status: "ativo", pedidos: 28 },
    { id: 2, nome: "Fernanda Costa", cpf: "987.654.321-00", email: "fernanda@email.com", telefone: "(28) 99888-5678", dataCadastro: "2024-03-15", status: "ativo", pedidos: 14 },
    { id: 3, nome: "Ricardo Melo", cpf: "111.222.333-44", email: "ricardo@email.com", telefone: "(28) 99777-9012", dataCadastro: "2024-05-20", status: "inativo", pedidos: 5 },
  ],
  entregadores: [
    { id: 1, nome: "Carlos Ferreira", cpf: "111.222.333-44", cnh: "ES 1234567", categoriaCnh: "A", validadeCnh: "2027-06-01", telefone: "(28) 99111-2222", email: "carlos@email.com", veiculoId: 1, status: "disponivel", avaliacao: 4.9, totalEntregas: 127 },
    { id: 2, nome: "Lucas Mendes", cpf: "222.333.444-55", cnh: "ES 7654321", categoriaCnh: "AB", validadeCnh: "2026-12-01", telefone: "(28) 99333-4444", email: "lucas@email.com", veiculoId: 2, status: "em_entrega", avaliacao: 4.7, totalEntregas: 89 },
    { id: 3, nome: "Fernando Santos", cpf: "555.666.777-88", cnh: "ES 5544332", categoriaCnh: "A", validadeCnh: "2025-08-01", telefone: "(28) 99999-0000", email: "fernando@email.com", veiculoId: 3, status: "inativo", avaliacao: 1.8, totalEntregas: 61 },
  ],
  veiculos: [
    { id: 1, modelo: "Honda CG 160", placa: "ABC-1234", ano: 2022, tipo: "Moto", cor: "Vermelho", entregadorId: 1 },
    { id: 2, modelo: "Honda Biz 125", placa: "DEF-5678", ano: 2021, tipo: "Moto", cor: "Preto", entregadorId: 2 },
    { id: 3, modelo: "Titan 160", placa: "MNO-7890", ano: 2020, tipo: "Moto", cor: "Branco", entregadorId: 3 },
    { id: 4, modelo: "Honda PCX 150", placa: "JKL-3456", ano: 2023, tipo: "Scooter", cor: "Cinza", entregadorId: null },
  ],
  categorias: [
    { id: 1, nome: "Pizzas", icone: "🍕", ativa: true },
    { id: 2, nome: "Lanches", icone: "🍔", ativa: true },
    { id: 3, nome: "Bebidas", icone: "🥤", ativa: true },
    { id: 4, nome: "Sobremesas", icone: "🍰", ativa: true },
  ],
  produtos: [
    { id: 1, nome: "Pizza Calabresa G", categoriaId: 1, preco: 44.90, estoque: 20, status: "ativo", emoji: "🍕" },
    { id: 2, nome: "TurboSmash Burger", categoriaId: 2, preco: 32.90, estoque: 15, status: "ativo", emoji: "🍔" },
    { id: 3, nome: "Coca-Cola 2L", categoriaId: 3, preco: 12.00, estoque: 50, status: "ativo", emoji: "🥤" },
    { id: 4, nome: "Petit Gâteau", categoriaId: 4, preco: 22.00, estoque: 10, status: "ativo", emoji: "🍰" },
    { id: 5, nome: "Pizza Frango G", categoriaId: 1, preco: 42.90, estoque: 0, status: "inativo", emoji: "🍕" },
    { id: 6, nome: "Água Mineral 500ml", categoriaId: 3, preco: 5.00, estoque: 80, status: "ativo", emoji: "💧" },
  ],
  pedidos: [
    { id: 47, clienteId: 1, status: "aguardando", pagamentoStatus: "aprovado", pagamentoMetodo: "pix", total: 90.90, taxa: 5.00, endereco: "Rua das Flores, 123 – Centro", bairro: "Centro", observacoes: "", dataPedido: "2026-06-25T14:00:00", itens: [{ produtoId: 1, qtd: 1, preco: 44.90 }, { produtoId: 3, qtd: 2, preco: 12.00 }, { produtoId: 4, qtd: 1, preco: 22.00 }] },
    { id: 48, clienteId: 2, status: "preparando", pagamentoStatus: "aprovado", pagamentoMetodo: "credito", total: 65.80, taxa: 7.00, endereco: "Av. Vargas, 456 – Bairro Novo", bairro: "Bairro Novo", observacoes: "Sem cebola", dataPedido: "2026-06-25T13:45:00", itens: [{ produtoId: 2, qtd: 2, preco: 32.90 }, { produtoId: 6, qtd: 2, preco: 5.00 }] },
    { id: 49, clienteId: 3, status: "pronto", pagamentoStatus: "pendente", pagamentoMetodo: "debito", total: 47.90, taxa: 5.00, endereco: "Rua XV, 77 – São José", bairro: "São José", observacoes: "", dataPedido: "2026-06-25T13:30:00", itens: [{ produtoId: 1, qtd: 1, preco: 44.90 }] },
    { id: 50, clienteId: 1, status: "em_entrega", pagamentoStatus: "aprovado", pagamentoMetodo: "pix", total: 39.90, taxa: 5.00, endereco: "Rua das Flores, 123 – Centro", bairro: "Centro", observacoes: "", dataPedido: "2026-06-25T13:00:00", itens: [{ produtoId: 2, qtd: 1, preco: 32.90 }, { produtoId: 6, qtd: 1, preco: 5.00 }] },
  ],
  entregas: [
    { id: 1, pedidoId: 50, entregadorId: 1, status: "em_andamento", dataInicio: "2026-06-25T13:15:00", dataFim: null },
  ],
  avaliacoes: [
    { id: 1, clienteId: 1, pedidoId: 47, entregadorId: 1, notaComida: 5, notaEntrega: 5, comentario: "Perfeito! Pizza chegou quentinha.", data: "2026-06-20T10:00:00" },
    { id: 2, clienteId: 2, pedidoId: 48, entregadorId: 2, notaComida: 4, notaEntrega: 5, comentario: "Muito bom!", data: "2026-06-21T11:00:00" },
  ],
};

/* ─────────────────────────── CSS ─────────────────────────── */
const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --primary:#ff6b35;--primary-bg:#fff4f0;--primary-dark:#e55a24;
    --success:#10b981;--success-light:#d1fae5;
    --danger:#ef4444;--danger-light:#fee2e2;
    --warning:#f59e0b;--warning-light:#fef3c7;
    --info:#3b82f6;--info-light:#dbeafe;
    --text:#111827;--text-secondary:#6b7280;--text-muted:#9ca3af;
    --bg:#f9fafb;--card:#fff;--border:#e5e7eb;
    --radius:10px;--radius-sm:6px;--radius-full:9999px;
    --shadow:0 1px 3px rgba(0,0,0,0.1),0 1px 2px rgba(0,0,0,0.06);
    --shadow-md:0 4px 6px rgba(0,0,0,0.07),0 2px 4px rgba(0,0,0,0.06);
    --sidebar-w:240px;
    --font:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  }
  body{font-family:var(--font);background:var(--bg);color:var(--text);font-size:14px;line-height:1.5}
  /* LAYOUT */
  .app-layout{display:flex;height:100vh;overflow:hidden}
  .sidebar{width:var(--sidebar-w);background:#fff;border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto}
  .main{flex:1;overflow-y:auto;display:flex;flex-direction:column}
  /* SIDEBAR */
  .s-logo{display:flex;align-items:center;gap:10px;padding:18px 16px 12px;border-bottom:1px solid var(--border)}
  .s-logo-icon{width:34px;height:34px;background:linear-gradient(135deg,var(--primary),#ff9a6c);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem;color:#fff}
  .s-logo-name{font-weight:800;font-size:1rem;color:var(--text)}
  .s-logo-sub{font-size:0.7rem;color:var(--text-muted)}
  .s-section{font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);padding:14px 16px 4px}
  .s-link{display:flex;align-items:center;gap:8px;padding:8px 16px;color:var(--text-secondary);text-decoration:none;cursor:pointer;border-radius:0;font-size:0.82rem;font-weight:500;transition:all .15s;user-select:none;border:none;background:none;width:100%;text-align:left}
  .s-link:hover{background:var(--bg);color:var(--text)}
  .s-link.active{background:var(--primary-bg);color:var(--primary);font-weight:600}
  .s-link .badge{margin-left:auto;background:var(--primary);color:#fff;font-size:0.65rem;padding:1px 6px;border-radius:var(--radius-full)}
  .s-footer{margin-top:auto;border-top:1px solid var(--border);padding:12px 16px;display:flex;align-items:center;gap:8px}
  .s-avatar{width:32px;height:32px;border-radius:50%;background:var(--primary-bg);color:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;flex-shrink:0}
  .s-user-name{font-weight:600;font-size:0.8rem}
  .s-user-role{font-size:0.7rem;color:var(--text-muted)}
  .s-logout{margin-left:auto;background:none;border:none;cursor:pointer;font-size:1rem;padding:4px;border-radius:4px;color:var(--text-muted)}
  .s-logout:hover{background:var(--bg);color:var(--danger)}
  /* TOPBAR */
  .topbar{background:#fff;border-bottom:1px solid var(--border);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
  .topbar h1{font-size:1.1rem;font-weight:700}
  .topbar p{font-size:0.78rem;color:var(--text-muted)}
  .topbar-right{display:flex;align-items:center;gap:8px}
  /* CONTENT */
  .content{padding:20px 24px;flex:1}
  /* CARDS */
  .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
  .card-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border)}
  .card-title{font-weight:600;font-size:0.9rem}
  .card-body{padding:16px}
  /* STATS GRID */
  .stats-grid{display:grid;gap:14px;margin-bottom:20px}
  .stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;display:flex;align-items:center;gap:14px}
  .stat-icon{width:40px;height:40px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
  .si-green{background:var(--success-light);}.si-blue{background:var(--info-light);}.si-yellow{background:var(--warning-light);}.si-orange{background:#fff4f0;}.si-red{background:var(--danger-light);}
  .stat-value{font-size:1.4rem;font-weight:800;line-height:1.1}
  .stat-label{font-size:0.72rem;color:var(--text-muted);margin-top:1px}
  /* BUTTONS */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--radius-sm);font-size:0.8rem;font-weight:600;cursor:pointer;border:1.5px solid transparent;transition:all .15s;white-space:nowrap}
  .btn-primary{background:var(--primary);color:#fff;border-color:var(--primary)}.btn-primary:hover{background:var(--primary-dark);border-color:var(--primary-dark)}
  .btn-secondary{background:#f3f4f6;color:var(--text);border-color:var(--border)}.btn-secondary:hover{background:#e5e7eb}
  .btn-ghost{background:none;border-color:transparent;color:var(--text-secondary)}.btn-ghost:hover{background:var(--bg)}
  .btn-danger{background:var(--danger);color:#fff;border-color:var(--danger)}.btn-danger:hover{background:#dc2626}
  .btn-success{background:var(--success);color:#fff;border-color:var(--success)}.btn-success:hover{background:#059669}
  .btn-warning{background:var(--warning);color:#fff;border-color:var(--warning)}
  .btn-sm{padding:4px 10px;font-size:0.75rem}
  .btn-lg{padding:10px 20px;font-size:0.9rem}
  .btn-xl{padding:12px 24px;font-size:0.95rem}
  .btn-full{width:100%;justify-content:center}
  .btn:disabled{opacity:0.5;cursor:not-allowed}
  .icon-btn{background:none;border:1px solid var(--border);border-radius:var(--radius-sm);width:34px;height:34px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;position:relative;color:var(--text)}
  .icon-btn .dot{position:absolute;top:2px;right:2px;width:16px;height:16px;background:var(--danger);border-radius:50%;font-size:0.6rem;color:#fff;display:flex;align-items:center;justify-content:center}
  /* TABLE */
  .table-wrap{overflow-x:auto}
  table{width:100%;border-collapse:collapse}
  th{padding:9px 12px;text-align:left;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);border-bottom:1.5px solid var(--border);background:#fafafa}
  td{padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:middle;font-size:0.82rem}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:#fafafa}
  .table-actions{display:flex;gap:4px}
  /* BADGES */
  .badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:var(--radius-full);font-size:0.72rem;font-weight:600;white-space:nowrap}
  .badge-success{background:var(--success-light);color:#065f46}
  .badge-danger{background:var(--danger-light);color:#991b1b}
  .badge-warning{background:var(--warning-light);color:#92400e}
  .badge-info{background:var(--info-light);color:#1e40af}
  .badge-secondary{background:#f3f4f6;color:#374151}
  .badge-primary{background:var(--primary-bg);color:var(--primary)}
  /* FORMS */
  .form-group{display:flex;flex-direction:column;gap:4px}
  .form-label{font-size:0.78rem;font-weight:600;color:var(--text)}
  .form-label.req::after{content:" *";color:var(--danger)}
  .form-control{padding:7px 10px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.82rem;font-family:inherit;width:100%;transition:border-color .15s;background:#fff}
  .form-control:focus{outline:none;border-color:var(--primary)}
  textarea.form-control{resize:vertical;min-height:80px}
  .form-grid{display:grid;gap:12px}
  .form-grid-2{grid-template-columns:1fr 1fr}
  .span-2{grid-column:1/-1}
  /* MODAL */
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .15s}
  .modal{background:#fff;border-radius:var(--radius);width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 50px rgba(0,0,0,0.2)}
  .modal-lg{max-width:680px}
  .modal-sm{max-width:420px}
  .modal-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border);position:sticky;top:0;background:#fff;z-index:1}
  .modal-title{font-weight:700;font-size:0.95rem;display:flex;align-items:center;gap:6px}
  .modal-close{background:none;border:none;cursor:pointer;font-size:1.1rem;color:var(--text-muted);padding:4px;border-radius:4px}.modal-close:hover{background:var(--bg)}
  .modal-body{padding:18px}
  .modal-footer{padding:14px 18px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;background:#fafafa}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  /* TOOLBAR */
  .toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px;flex-wrap:wrap}
  .toolbar-left{display:flex;align-items:center;gap:8px;flex:1;flex-wrap:wrap}
  .toolbar-right{display:flex;align-items:center;gap:8px}
  .search-box{display:flex;align-items:center;gap:6px;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:6px 10px;background:#fff;min-width:200px}
  .search-box input{border:none;outline:none;font-size:0.82rem;font-family:inherit;width:100%;background:transparent}
  /* AVATAR */
  .avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0}
  .av-sm{width:28px;height:28px;font-size:0.7rem}
  .av-orange{background:rgba(255,107,53,0.15);color:var(--primary)}
  .av-blue{background:rgba(59,130,246,0.15);color:var(--info)}
  .av-green{background:rgba(16,185,129,0.15);color:var(--success)}
  .av-purple{background:rgba(139,92,246,0.15);color:#7c3aed}
  .av-red{background:rgba(239,68,68,0.15);color:var(--danger)}
  /* ALERTS */
  .alert{padding:10px 14px;border-radius:var(--radius-sm);display:flex;align-items:flex-start;gap:8px;font-size:0.82rem;margin-bottom:14px}
  .alert-info{background:var(--info-light);color:#1e40af;border:1px solid #bfdbfe}
  .alert-warning{background:var(--warning-light);color:#92400e;border:1px solid #fde68a}
  .alert-success{background:var(--success-light);color:#065f46;border:1px solid #a7f3d0}
  .alert-danger{background:var(--danger-light);color:#991b1b;border:1px solid #fca5a5}
  /* TABS */
  .tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:16px}
  .tab-btn{padding:5px 12px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:#f3f4f6;cursor:pointer;font-size:0.78rem;font-weight:600;transition:all .15s}
  .tab-btn.active{background:var(--primary);color:#fff;border-color:var(--primary)}
  /* PAGINATION */
  .pagination{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-top:1px solid var(--border)}
  .pag-info{font-size:0.78rem;color:var(--text-muted)}
  .pag-btns{display:flex;gap:4px}
  .pag-btn{width:28px;height:28px;border:1.5px solid var(--border);border-radius:var(--radius-sm);background:#fff;cursor:pointer;font-size:0.78rem;display:flex;align-items:center;justify-content:center}
  .pag-btn.active{background:var(--primary);color:#fff;border-color:var(--primary)}
  .pag-btn:disabled{opacity:0.4;cursor:not-allowed}
  /* TOGGLE */
  .toggle-row{display:flex;align-items:center;gap:8px}
  .toggle{position:relative;display:inline-block;width:36px;height:20px;cursor:pointer}
  .toggle input{opacity:0;width:0;height:0}
  .toggle-slider{position:absolute;inset:0;background:#d1d5db;border-radius:var(--radius-full);transition:.2s}
  .toggle-slider::before{content:"";position:absolute;width:14px;height:14px;border-radius:50%;background:#fff;left:3px;bottom:3px;transition:.2s}
  .toggle input:checked ~ .toggle-slider{background:var(--success)}
  .toggle input:checked ~ .toggle-slider::before{transform:translateX(16px)}
  /* KITCHEN */
  .kitchen-layout{background:#0f1117;min-height:100vh;color:#fff}
  .kitchen-nav{background:#1a1d26;border-bottom:1px solid rgba(255,255,255,0.08);padding:12px 20px;display:flex;align-items:center;justify-content:space-between}
  .kitchen-board{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:16px 20px}
  .kitchen-col{background:#1a1d26;border-radius:var(--radius);overflow:hidden;border:1px solid rgba(255,255,255,0.07)}
  .kitchen-col-hdr{padding:10px 14px;font-size:0.8rem;font-weight:700;display:flex;align-items:center;justify-content:space-between}
  .kch-new{background:rgba(245,158,11,0.15);color:#fbbf24}
  .kch-prep{background:rgba(139,92,246,0.15);color:#a78bfa}
  .kch-ready{background:rgba(52,211,153,0.15);color:#34d399}
  .kch-done{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.5)}
  .k-card{margin:8px;background:#242733;border-radius:var(--radius-sm);padding:12px;border:1px solid rgba(255,255,255,0.06)}
  .k-id{font-size:0.7rem;font-weight:700;color:var(--text-muted);margin-bottom:4px}
  .k-client{font-size:0.85rem;font-weight:600;color:#fff;margin-bottom:6px}
  .k-items{font-size:0.75rem;color:rgba(255,255,255,0.6);margin-bottom:8px;display:flex;flex-direction:column;gap:2px}
  .k-time{font-size:0.72rem;padding:4px 8px;border-radius:var(--radius-sm);margin-bottom:8px}
  .k-urgent{background:rgba(239,68,68,0.2);color:#fca5a5}
  .k-normal{background:rgba(245,158,11,0.15);color:#fbbf24}
  .k-ok{background:rgba(52,211,153,0.1);color:#34d399}
  /* CUSTOMER AREA */
  .cust-nav{background:#fff;border-bottom:1px solid var(--border);padding:12px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
  .nav-logo{display:flex;align-items:center;gap:8px;font-weight:800;font-size:1.1rem;text-decoration:none;color:var(--text)}
  .nav-logo span{color:var(--primary)}
  .menu-wrap{max-width:1100px;margin:0 auto;padding:20px}
  .menu-cats{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
  .cat-btn{padding:6px 14px;border-radius:var(--radius-full);border:1.5px solid var(--border);background:#fff;cursor:pointer;font-size:0.8rem;font-weight:600;transition:all .15s}
  .cat-btn.active{background:var(--primary);color:#fff;border-color:var(--primary)}
  .menu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
  .menu-card{background:#fff;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;display:flex;flex-direction:column}
  .menu-card-img{height:100px;background:var(--primary-bg);display:flex;align-items:center;justify-content:center;font-size:3rem}
  .menu-card-body{padding:12px;flex:1;display:flex;flex-direction:column;gap:4px}
  .menu-card-name{font-weight:700;font-size:0.9rem}
  .menu-card-price{color:var(--primary);font-weight:800;font-size:1rem}
  .menu-card-footer{padding:10px 12px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px}
  .qty-ctrl{display:flex;align-items:center;gap:6px;background:var(--bg);border-radius:var(--radius-sm);padding:2px 4px}
  .qty-btn{width:24px;height:24px;border:none;background:none;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--text)}
  .qty-val{font-weight:700;font-size:0.85rem;min-width:18px;text-align:center}
  .cart-count{position:fixed;bottom:20px;right:20px;background:var(--primary);color:#fff;border:none;border-radius:var(--radius-full);padding:12px 20px;font-size:0.9rem;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(255,107,53,0.4);z-index:20}
  /* STEPS */
  .steps{display:flex;align-items:center;gap:0;margin-bottom:20px;overflow-x:auto}
  .step{display:flex;align-items:center;gap:6px;flex-shrink:0}
  .step-num{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0}
  .step-num.done{background:var(--primary);color:#fff}
  .step-num.pending{background:var(--border);color:var(--text-muted)}
  .step-label.done{color:var(--primary);font-weight:600;font-size:0.8rem}
  .step-label.pending{color:var(--text-muted);font-size:0.8rem}
  .step-line{width:40px;height:2px;flex-shrink:0}
  .step-line.done{background:var(--primary)}
  .step-line.pending{background:var(--border)}
  /* DELIVERY PANEL */
  .del-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
  .del-stat{background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:14px;text-align:center}
  .del-stat-val{font-size:1.6rem;font-weight:800}
  .del-stat-lbl{font-size:0.72rem;color:var(--text-muted);margin-top:2px}
  /* RATING STARS */
  .stars{display:flex;gap:2px}
  .star-btn{background:none;border:none;cursor:pointer;font-size:1.4rem;transition:transform .1s}
  .star-btn:hover{transform:scale(1.2)}
  /* TOAST */
  .toast-container{position:fixed;top:20px;right:20px;z-index:999;display:flex;flex-direction:column;gap:8px}
  .toast{background:#1f2937;color:#fff;padding:10px 16px;border-radius:var(--radius-sm);font-size:0.82rem;font-weight:500;box-shadow:var(--shadow-md);animation:slideIn .2s;display:flex;align-items:center;gap:8px;min-width:200px}
  @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
  /* UTILS */
  .flex{display:flex}.items-center{align-items:center}.justify-between{justify-content:space-between}.gap-2{gap:8px}.gap-3{gap:12px}.mb-2{margin-bottom:8px}.mb-4{margin-bottom:16px}.mt-2{margin-top:8px}.mt-4{margin-top:16px}
  .text-sm{font-size:0.8rem}.text-xs{font-size:0.72rem}.text-muted{color:var(--text-muted)}.text-primary{color:var(--primary)}.text-success{color:var(--success)}.text-danger{color:var(--danger)}
  .font-bold{font-weight:700}.font-semibold{font-weight:600}.font-extrabold{font-weight:800}
  .w-full{width:100%}.hr{border:none;border-top:1px solid var(--border);margin:14px 0}
  select.form-control option{padding:4px}
  .empty-state{text-align:center;padding:40px 20px;color:var(--text-muted)}
  .empty-state .icon{font-size:2.5rem;margin-bottom:10px}
  /* Confirmation screen */
  .confirm-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;text-align:center;gap:12px}
  .confirm-icon{font-size:4rem}
`;

/* ─────────────────────────── HELPERS ─────────────────────────── */
const uid = () => Date.now() + Math.floor(Math.random() * 1000);
const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const initials = (name) => name ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "??";
const avColors = ["av-orange", "av-blue", "av-green", "av-purple", "av-red"];
const avColor = (id) => avColors[id % avColors.length];

const STATUS_PEDIDO = {
  aguardando: { label: "Aguardando", cls: "badge-warning", emoji: "⏳" },
  confirmado: { label: "Confirmado", cls: "badge-info", emoji: "✓" },
  preparando: { label: "Preparando", cls: "badge-secondary", emoji: "🍳" },
  pronto: { label: "Pronto", cls: "badge-primary", emoji: "✅" },
  em_entrega: { label: "Em Entrega", cls: "badge-info", emoji: "🛵" },
  entregue: { label: "Entregue", cls: "badge-success", emoji: "📦" },
  cancelado: { label: "Cancelado", cls: "badge-danger", emoji: "❌" },
};
const STATUS_PGTO = {
  pendente: { label: "Pendente", cls: "badge-warning" },
  aprovado: { label: "Aprovado", cls: "badge-success" },
  recusado: { label: "Recusado", cls: "badge-danger" },
};
const STATUS_ENTREGADOR = {
  disponivel: { label: "Disponível", cls: "badge-success" },
  em_entrega: { label: "Em Entrega", cls: "badge-info" },
  inativo: { label: "Inativo", cls: "badge-warning" },
};
const STATUS_PRODUTO = {
  ativo: { label: "Ativo", cls: "badge-success" },
  inativo: { label: "Inativo", cls: "badge-danger" },
};

/* ─────────────────────────── MODAL WRAPPER ─────────────────────────── */
function Modal({ title, onClose, children, footer, size = "" }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function ConfirmModal({ msg, onConfirm, onClose }) {
  return (
    <Modal title="⚠️ Confirmar" onClose={onClose} size="modal-sm"
      footer={<><button className="btn btn-secondary" onClick={onClose}>Cancelar</button><button className="btn btn-danger" onClick={onConfirm}>Confirmar</button></>}>
      <p className="text-sm">{msg}</p>
    </Modal>
  );
}

/* ─────────────────────────── TOAST ─────────────────────────── */
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span>{t.emoji || "ℹ️"}</span> {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── SIDEBAR ─────────────────────────── */
function Sidebar({ role, page, setPage, user, onLogout }) {
  const adminLinks = [
    { section: "Principal" },
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "pedidos", icon: "📋", label: "Pedidos" },
    { id: "pagamentos", icon: "💳", label: "Pagamentos" },
    { id: "entregas", icon: "🚚", label: "Entregas" },
    { section: "Cadastros" },
    { id: "categorias", icon: "🏷️", label: "Categorias" },
    { id: "produtos", icon: "🍕", label: "Produtos" },
    { id: "clientes", icon: "👥", label: "Clientes" },
    { id: "entregadores", icon: "🛵", label: "Entregadores" },
    { id: "veiculos", icon: "🚗", label: "Veículos" },
    { section: "Relatórios" },
    { id: "avaliacoes", icon: "⭐", label: "Avaliações" },
    { id: "relatorios", icon: "📊", label: "Relatórios" },
  ];
  const entregadorLinks = [
    { section: "Menu" },
    { id: "del-painel", icon: "🏠", label: "Painel" },
    { id: "del-disponíveis", icon: "📦", label: "Entregas Disponíveis" },
    { id: "del-minhas", icon: "🛵", label: "Minhas Entregas" },
    { id: "del-historico", icon: "📋", label: "Histórico" },
  ];
  const links = role === "entregador" ? entregadorLinks : adminLinks;
  const roleName = role === "admin" ? "Administrador" : role === "entregador" ? "Entregador" : "Sistema";

  return (
    <aside className="sidebar">
      <div className="s-logo">
        <div className="s-logo-icon">⚡</div>
        <div><div className="s-logo-name">TurboFood</div><div className="s-logo-sub">{roleName}</div></div>
      </div>
      <nav style={{ flex: 1 }}>
        {links.map((l, i) =>
          l.section
            ? <div key={i} className="s-section">{l.section}</div>
            : <button key={l.id} className={`s-link${page === l.id ? " active" : ""}`} onClick={() => setPage(l.id)}>
                <span>{l.icon}</span> {l.label}
              </button>
        )}
      </nav>
      <div className="s-footer">
        <div className={`s-avatar ${avColor(0)}`}>{initials(user)}</div>
        <div><div className="s-user-name" style={{ fontSize: "0.78rem" }}>{user}</div><div className="s-user-role">{roleName}</div></div>
        <button className="s-logout" onClick={onLogout} title="Sair">🚪</button>
      </div>
    </aside>
  );
}

/* ─────────────────────────── LOGIN ─────────────────────────── */
function Login({ onLogin }) {
  const [role, setRole] = useState("admin");
  const roles = [
    { id: "admin", icon: "👨‍💼", label: "Administrador" },
    { id: "cliente", icon: "👤", label: "Cliente" },
    { id: "cozinha", icon: "👨‍🍳", label: "Cozinha" },
    { id: "entregador", icon: "🛵", label: "Entregador" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fff4f0,#fff)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.1)", border: "1px solid var(--border)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "52px", height: "52px", background: "linear-gradient(135deg,var(--primary),#ff9a6c)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", margin: "0 auto 12px" }}>⚡</div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>TurboFood</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>Sistema de Gestão de Pedidos e Delivery</p>
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "12px", textAlign: "center" }}>Selecione seu perfil de acesso:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
          {roles.map(r => (
            <button key={r.id} onClick={() => setRole(r.id)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "12px", borderRadius: "var(--radius)", border: role === r.id ? "2px solid var(--primary)" : "1.5px solid var(--border)", background: role === r.id ? "var(--primary-bg)" : "#fff", cursor: "pointer", transition: "all .15s" }}>
              <span style={{ fontSize: "1.5rem" }}>{r.icon}</span>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: role === r.id ? "var(--primary)" : "var(--text)" }}>{r.label}</span>
            </button>
          ))}
        </div>
        <div className="form-group mb-4">
          <label className="form-label">E-mail</label>
          <input className="form-control" type="email" defaultValue="admin@turbofood.com" />
        </div>
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label className="form-label">Senha</label>
          <input className="form-control" type="password" defaultValue="12345678" />
        </div>
        <button className="btn btn-primary btn-xl btn-full" onClick={() => onLogin(role)}>⚡ Entrar no Sistema</button>
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "16px" }}>Não tem conta? <span style={{ color: "var(--primary)", cursor: "pointer" }}>Solicite ao administrador</span></p>
      </div>
    </div>
  );
}

/* ─────────────────────────── DASHBOARD ─────────────────────────── */
function Dashboard({ data }) {
  const stats = [
    { icon: "📋", label: "Pedidos Hoje", value: data.pedidos.length, cls: "si-blue" },
    { icon: "💰", label: "Receita Hoje", value: fmt(data.pedidos.reduce((s, p) => s + p.total, 0)), cls: "si-green" },
    { icon: "🛵", label: "Entregadores Ativos", value: data.entregadores.filter(e => e.status !== "inativo").length, cls: "si-orange" },
    { icon: "👥", label: "Clientes Cadastrados", value: data.clientes.length, cls: "si-blue" },
  ];
  const ultimosPedidos = [...data.pedidos].slice(-5).reverse();
  return (
    <div className="content">
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">📋 Últimos Pedidos</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Cliente</th><th>Total</th><th>Pagamento</th><th>Status</th></tr></thead>
            <tbody>
              {ultimosPedidos.map(p => {
                const cli = data.clientes.find(c => c.id === p.clienteId);
                const st = STATUS_PEDIDO[p.status] || {};
                const pg = STATUS_PGTO[p.pagamentoStatus] || {};
                return (
                  <tr key={p.id}>
                    <td className="font-semibold text-primary">#{p.id}</td>
                    <td>{cli?.nome || "–"}</td>
                    <td className="font-bold">{fmt(p.total)}</td>
                    <td><span className={`badge ${pg.cls}`}>{pg.label}</span></td>
                    <td><span className={`badge ${st.cls}`}>{st.emoji} {st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── PEDIDOS ─────────────────────────── */
function Pedidos({ data, setData, toast }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirm, setConfirm] = useState(null);
  const [detailPedido, setDetailPedido] = useState(null);

  const filtered = data.pedidos.filter(p => {
    const cli = data.clientes.find(c => c.id === p.clienteId);
    const text = `#${p.id} ${cli?.nome || ""} ${p.bairro}`.toLowerCase();
    return (statusFilter === "all" || p.status === statusFilter) && (!search || text.includes(search.toLowerCase()));
  });

  const updateStatus = (id, status) => {
    setData(d => ({ ...d, pedidos: d.pedidos.map(p => p.id === id ? { ...p, status } : p) }));
    toast("✅ Status do pedido atualizado!");
  };
  const deletePedido = (id) => {
    setData(d => ({ ...d, pedidos: d.pedidos.filter(p => p.id !== id) }));
    toast("🗑️ Pedido excluído!");
    setConfirm(null);
  };

  const statusKeys = Object.keys(STATUS_PEDIDO);

  return (
    <div className="content">
      {confirm && <ConfirmModal msg={`Excluir pedido #${confirm}?`} onConfirm={() => deletePedido(confirm)} onClose={() => setConfirm(null)} />}
      {detailPedido && (
        <Modal title={`📋 Pedido #${detailPedido.id}`} onClose={() => setDetailPedido(null)}
          footer={<button className="btn btn-secondary" onClick={() => setDetailPedido(null)}>Fechar</button>}>
          <div className="form-grid form-grid-2 mb-4">
            <div><div className="text-xs text-muted">Cliente</div><div className="font-semibold">{data.clientes.find(c => c.id === detailPedido.clienteId)?.nome}</div></div>
            <div><div className="text-xs text-muted">Status</div><span className={`badge ${STATUS_PEDIDO[detailPedido.status]?.cls}`}>{STATUS_PEDIDO[detailPedido.status]?.emoji} {STATUS_PEDIDO[detailPedido.status]?.label}</span></div>
            <div><div className="text-xs text-muted">Endereço</div><div className="font-semibold text-sm">{detailPedido.endereco}</div></div>
            <div><div className="text-xs text-muted">Pagamento</div><span className={`badge ${STATUS_PGTO[detailPedido.pagamentoStatus]?.cls}`}>{STATUS_PGTO[detailPedido.pagamentoStatus]?.label}</span></div>
          </div>
          <div className="card mb-3">
            <div className="card-header"><span className="card-title">Itens</span></div>
            <div className="table-wrap">
              <table><thead><tr><th>Produto</th><th>Qtd</th><th>Preço Un.</th><th>Total</th></tr></thead>
                <tbody>{detailPedido.itens.map((it, i) => {
                  const prod = data.produtos.find(p => p.id === it.produtoId);
                  return <tr key={i}><td>{prod?.emoji} {prod?.nome}</td><td>{it.qtd}</td><td>{fmt(it.preco)}</td><td className="font-bold">{fmt(it.preco * it.qtd)}</td></tr>;
                })}</tbody>
              </table>
            </div>
            <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", textAlign: "right" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Taxa: {fmt(detailPedido.taxa)} | </span>
              <strong>Total: {fmt(detailPedido.total + detailPedido.taxa)}</strong>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Alterar Status</label>
            <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
              {statusKeys.map(s => (
                <button key={s} className={`btn btn-sm ${detailPedido.status === s ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => { updateStatus(detailPedido.id, s); setDetailPedido(p => ({ ...p, status: s })); }}>
                  {STATUS_PEDIDO[s].emoji} {STATUS_PEDIDO[s].label}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
      <div className="tabs">
        <button className={`tab-btn${statusFilter === "all" ? " active" : ""}`} onClick={() => setStatusFilter("all")}>Todos ({data.pedidos.length})</button>
        {statusKeys.map(s => {
          const cnt = data.pedidos.filter(p => p.status === s).length;
          return cnt > 0 ? <button key={s} className={`tab-btn${statusFilter === s ? " active" : ""}`} onClick={() => setStatusFilter(s)}>{STATUS_PEDIDO[s].emoji} {STATUS_PEDIDO[s].label} ({cnt})</button> : null;
        })}
      </div>
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box"><span>🔍</span><input placeholder="Buscar pedido..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Cliente</th><th>Bairro</th><th>Total</th><th>Pgto</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={7}><div className="empty-state"><div className="icon">📋</div>Nenhum pedido encontrado</div></td></tr> : null}
              {filtered.map(p => {
                const cli = data.clientes.find(c => c.id === p.clienteId);
                const st = STATUS_PEDIDO[p.status] || {};
                const pg = STATUS_PGTO[p.pagamentoStatus] || {};
                return (
                  <tr key={p.id}>
                    <td className="font-semibold text-primary">#{p.id}</td>
                    <td>{cli?.nome || "–"}</td>
                    <td className="text-sm">{p.bairro}</td>
                    <td className="font-bold">{fmt(p.total)}</td>
                    <td><span className={`badge ${pg.cls}`}>{pg.label}</span></td>
                    <td><span className={`badge ${st.cls}`}>{st.emoji} {st.label}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => setDetailPedido(p)} title="Ver detalhes">👁️</button>
                        <button className="btn btn-sm btn-ghost" style={{ color: "var(--danger)" }} onClick={() => setConfirm(p.id)} title="Excluir">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── PAGAMENTOS ─────────────────────────── */
function Pagamentos({ data, setData, toast }) {
  const updatePgto = (id, status) => {
    setData(d => ({ ...d, pedidos: d.pedidos.map(p => p.id === id ? { ...p, pagamentoStatus: status } : p) }));
    toast(status === "aprovado" ? "✅ Pagamento aprovado!" : "❌ Pagamento recusado!");
  };
  const pendentes = data.pedidos.filter(p => p.pagamentoStatus === "pendente");
  const total = data.pedidos.reduce((s, p) => s + (p.pagamentoStatus === "aprovado" ? p.total : 0), 0);

  return (
    <div className="content">
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <div className="stat-card"><div className="stat-icon si-green">✅</div><div><div className="stat-value">{fmt(total)}</div><div className="stat-label">Total Aprovado</div></div></div>
        <div className="stat-card"><div className="stat-icon si-yellow">⏳</div><div><div className="stat-value">{pendentes.length}</div><div className="stat-label">Aguardando Confirmação</div></div></div>
        <div className="stat-card"><div className="stat-icon si-blue">💳</div><div><div className="stat-value">{data.pedidos.length}</div><div className="stat-label">Transações Total</div></div></div>
        <div className="stat-card"><div className="stat-icon si-orange">🧾</div><div><div className="stat-value">{data.pedidos.length > 0 ? fmt(total / data.pedidos.filter(p => p.pagamentoStatus === "aprovado").length || 0) : "R$ 0,00"}</div><div className="stat-label">Ticket Médio</div></div></div>
      </div>
      {pendentes.length > 0 && <div className="alert alert-warning">⚠️ <div><strong>{pendentes.length} pagamentos aguardando confirmação manual.</strong> Aprovação necessária para ir para a cozinha.</div></div>}
      <div className="card">
        <div className="card-header"><span className="card-title">💳 Todos os Pagamentos</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Método</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {data.pedidos.map(p => {
                const cli = data.clientes.find(c => c.id === p.clienteId);
                const pg = STATUS_PGTO[p.pagamentoStatus] || {};
                return (
                  <tr key={p.id}>
                    <td className="font-semibold text-primary">#{p.id}</td>
                    <td>{cli?.nome || "–"}</td>
                    <td className="text-sm">{p.pagamentoMetodo === "pix" ? "⚡ PIX" : p.pagamentoMetodo === "credito" ? "💳 Crédito" : "💳 Débito"}</td>
                    <td className="font-bold">{fmt(p.total)}</td>
                    <td><span className={`badge ${pg.cls}`}>{pg.label}</span></td>
                    <td>
                      <div className="table-actions">
                        {p.pagamentoStatus === "pendente" && <>
                          <button className="btn btn-sm btn-success" onClick={() => updatePgto(p.id, "aprovado")}>✅ Aprovar</button>
                          <button className="btn btn-sm btn-danger" onClick={() => updatePgto(p.id, "recusado")}>❌ Recusar</button>
                        </>}
                        {p.pagamentoStatus !== "pendente" && (
                          <button className="btn btn-sm btn-secondary" onClick={() => updatePgto(p.id, "pendente")}>↩️ Reset</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── ENTREGAS ─────────────────────────── */
function Entregas({ data, setData, toast }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ pedidoId: "", entregadorId: "" });

  const saveEntrega = () => {
    if (!form.pedidoId || !form.entregadorId) return;
    const nova = { id: uid(), pedidoId: Number(form.pedidoId), entregadorId: Number(form.entregadorId), status: "em_andamento", dataInicio: new Date().toISOString(), dataFim: null };
    setData(d => ({
      ...d,
      entregas: [...d.entregas, nova],
      pedidos: d.pedidos.map(p => p.id === Number(form.pedidoId) ? { ...p, status: "em_entrega" } : p),
      entregadores: d.entregadores.map(e => e.id === Number(form.entregadorId) ? { ...e, status: "em_entrega" } : e),
    }));
    toast("🚚 Entrega cadastrada!");
    setModal(null);
    setForm({ pedidoId: "", entregadorId: "" });
  };

  const confirmarEntrega = (entregaId) => {
    const entrega = data.entregas.find(e => e.id === entregaId);
    setData(d => ({
      ...d,
      entregas: d.entregas.map(e => e.id === entregaId ? { ...e, status: "concluida", dataFim: new Date().toISOString() } : e),
      pedidos: d.pedidos.map(p => p.id === entrega.pedidoId ? { ...p, status: "entregue" } : p),
      entregadores: d.entregadores.map(e => e.id === entrega.entregadorId ? { ...e, status: "disponivel", totalEntregas: e.totalEntregas + 1 } : e),
    }));
    toast("✅ Entrega confirmada!");
  };

  const pedidosProntos = data.pedidos.filter(p => p.status === "pronto" && !data.entregas.find(e => e.pedidoId === p.id && e.status === "em_andamento"));
  const entregadoresDisp = data.entregadores.filter(e => e.status === "disponivel");

  return (
    <div className="content">
      {modal && (
        <Modal title="🚚 Nova Entrega" onClose={() => setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-primary" onClick={saveEntrega}>💾 Salvar</button></>}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label req">Pedido (Prontos)</label>
              <select className="form-control" value={form.pedidoId} onChange={e => setForm(f => ({ ...f, pedidoId: e.target.value }))}>
                <option value="">Selecione...</option>
                {pedidosProntos.map(p => <option key={p.id} value={p.id}>#{p.id} – {data.clientes.find(c => c.id === p.clienteId)?.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label req">Entregador</label>
              <select className="form-control" value={form.entregadorId} onChange={e => setForm(f => ({ ...f, entregadorId: e.target.value }))}>
                <option value="">Selecione...</option>
                {entregadoresDisp.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Nova Entrega</button>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">🚚 Entregas</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Entregador</th><th>Início</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {data.entregas.length === 0 && <tr><td colSpan={6}><div className="empty-state"><div className="icon">🚚</div>Nenhuma entrega cadastrada</div></td></tr>}
              {data.entregas.map(e => {
                const pedido = data.pedidos.find(p => p.id === e.pedidoId);
                const entregador = data.entregadores.find(en => en.id === e.entregadorId);
                const cli = data.clientes.find(c => c.id === pedido?.clienteId);
                return (
                  <tr key={e.id}>
                    <td className="font-semibold text-primary">#{e.pedidoId}</td>
                    <td>{cli?.nome || "–"}</td>
                    <td>{entregador?.nome || "–"}</td>
                    <td className="text-sm text-muted">{new Date(e.dataInicio).toLocaleTimeString("pt-BR")}</td>
                    <td><span className={`badge ${e.status === "concluida" ? "badge-success" : "badge-info"}`}>{e.status === "concluida" ? "✅ Concluída" : "🛵 Em Andamento"}</span></td>
                    <td>
                      {e.status === "em_andamento" && <button className="btn btn-sm btn-success" onClick={() => confirmarEntrega(e.id)}>✅ Confirmar Entrega</button>}
                      {e.status === "concluida" && e.dataFim && <span className="text-xs text-muted">{new Date(e.dataFim).toLocaleTimeString("pt-BR")}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── CLIENTES ─────────────────────────── */
function Clientes({ data, setData, toast }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);

  const openNew = () => { setForm({ nome: "", cpf: "", email: "", telefone: "", status: "ativo" }); setModal("new"); };
  const openEdit = (c) => { setForm({ ...c }); setModal("edit"); };

  const save = () => {
    if (!form.nome || !form.email) return;
    if (modal === "new") {
      setData(d => ({ ...d, clientes: [...d.clientes, { ...form, id: uid(), dataCadastro: new Date().toISOString().split("T")[0], pedidos: 0 }] }));
      toast("✅ Cliente cadastrado!");
    } else {
      setData(d => ({ ...d, clientes: d.clientes.map(c => c.id === form.id ? form : c) }));
      toast("✅ Cliente atualizado!");
    }
    setModal(null);
  };
  const del = (id) => {
    setData(d => ({ ...d, clientes: d.clientes.filter(c => c.id !== id) }));
    toast("🗑️ Cliente excluído!"); setConfirm(null);
  };
  const filtered = data.clientes.filter(c => !search || `${c.nome} ${c.cpf} ${c.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="content">
      {confirm && <ConfirmModal msg="Excluir este cliente?" onConfirm={() => del(confirm)} onClose={() => setConfirm(null)} />}
      {modal && (
        <Modal title={modal === "new" ? "👤 Novo Cliente" : "✏️ Editar Cliente"} onClose={() => setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-primary" onClick={save}>💾 Salvar</button></>}>
          <div className="form-grid form-grid-2">
            <div className="form-group span-2"><label className="form-label req">Nome Completo</label><input className="form-control" value={form.nome || ""} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label req">CPF</label><input className="form-control" placeholder="000.000.000-00" value={form.cpf || ""} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label req">E-mail</label><input className="form-control" type="email" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Telefone</label><input className="form-control" value={form.telefone || ""} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-control" value={form.status || "ativo"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="ativo">Ativo</option><option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
      <div className="toolbar">
        <div className="toolbar-left"><div className="search-box"><span>🔍</span><input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        <div className="toolbar-right"><button className="btn btn-primary" onClick={openNew}>+ Novo Cliente</button></div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Cliente</th><th>CPF</th><th>E-mail</th><th>Telefone</th><th>Pedidos</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><div className="flex items-center gap-2"><div className={`avatar ${avColor(c.id)}`}>{initials(c.nome)}</div><div><div className="font-semibold">{c.nome}</div><div className="text-xs text-muted">Desde {c.dataCadastro}</div></div></div></td>
                  <td className="text-sm">{c.cpf}</td>
                  <td className="text-sm">{c.email}</td>
                  <td className="text-sm">{c.telefone}</td>
                  <td><span className="badge badge-info">{c.pedidos} pedidos</span></td>
                  <td><span className={`badge ${c.status === "ativo" ? "badge-success" : "badge-warning"}`}>{c.status === "ativo" ? "✓ Ativo" : "⏸ Inativo"}</span></td>
                  <td><div className="table-actions">
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}>✏️</button>
                    <button className="btn btn-sm btn-ghost" style={{ color: "var(--danger)" }} onClick={() => setConfirm(c.id)}>🗑️</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── ENTREGADORES ─────────────────────────── */
function Entregadores({ data, setData, toast }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);

  const openNew = () => setForm({ nome: "", cpf: "", cnh: "", categoriaCnh: "A", validadeCnh: "", telefone: "", email: "", veiculoId: null, status: "disponivel" }) || setModal("new");
  const openEdit = (e) => setForm({ ...e }) || setModal("edit");

  const save = () => {
    if (!form.nome || !form.cpf) return;
    if (modal === "new") {
      setData(d => ({ ...d, entregadores: [...d.entregadores, { ...form, id: uid(), avaliacao: 0, totalEntregas: 0 }] }));
      toast("✅ Entregador cadastrado!");
    } else {
      setData(d => ({ ...d, entregadores: d.entregadores.map(e => e.id === form.id ? form : e) }));
      toast("✅ Entregador atualizado!");
    }
    setModal(null);
  };
  const del = (id) => { setData(d => ({ ...d, entregadores: d.entregadores.filter(e => e.id !== id) })); toast("🗑️ Entregador excluído!"); setConfirm(null); };
  const filtered = data.entregadores.filter(e => !search || e.nome.toLowerCase().includes(search.toLowerCase()));

  const EntregadorForm = () => (
    <div className="form-grid form-grid-2">
      <div className="form-group span-2"><label className="form-label req">Nome Completo</label><input className="form-control" value={form.nome || ""} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
      <div className="form-group"><label className="form-label req">CPF</label><input className="form-control" placeholder="000.000.000-00" value={form.cpf || ""} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} /></div>
      <div className="form-group"><label className="form-label req">CNH</label><input className="form-control" placeholder="ES 0000000" value={form.cnh || ""} onChange={e => setForm(f => ({ ...f, cnh: e.target.value }))} /></div>
      <div className="form-group"><label className="form-label req">Categoria CNH</label>
        <select className="form-control" value={form.categoriaCnh || "A"} onChange={e => setForm(f => ({ ...f, categoriaCnh: e.target.value }))}>
          <option>A</option><option>AB</option><option>B</option>
        </select>
      </div>
      <div className="form-group"><label className="form-label">Validade CNH</label><input type="date" className="form-control" value={form.validadeCnh || ""} onChange={e => setForm(f => ({ ...f, validadeCnh: e.target.value }))} /></div>
      <div className="form-group"><label className="form-label req">Telefone</label><input className="form-control" value={form.telefone || ""} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} /></div>
      <div className="form-group"><label className="form-label req">E-mail</label><input className="form-control" type="email" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
      <div className="form-group"><label className="form-label">Veículo</label>
        <select className="form-control" value={form.veiculoId || ""} onChange={e => setForm(f => ({ ...f, veiculoId: e.target.value ? Number(e.target.value) : null }))}>
          <option value="">Nenhum</option>
          {data.veiculos.map(v => <option key={v.id} value={v.id}>{v.modelo} – {v.placa}</option>)}
        </select>
      </div>
      <div className="form-group"><label className="form-label">Status</label>
        <select className="form-control" value={form.status || "disponivel"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
          <option value="disponivel">Disponível</option><option value="em_entrega">Em Entrega</option><option value="inativo">Inativo</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="content">
      {confirm && <ConfirmModal msg="Excluir este entregador?" onConfirm={() => del(confirm)} onClose={() => setConfirm(null)} />}
      {modal && (
        <Modal title={modal === "new" ? "🛵 Novo Entregador" : "✏️ Editar Entregador"} size="modal-lg" onClose={() => setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-primary" onClick={save}>💾 Salvar</button></>}>
          <EntregadorForm />
        </Modal>
      )}
      <div className="toolbar">
        <div className="toolbar-left"><div className="search-box"><span>🔍</span><input placeholder="Buscar entregador..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        <div className="toolbar-right"><button className="btn btn-primary" onClick={openNew}>+ Novo Entregador</button></div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Entregador</th><th>CPF</th><th>CNH</th><th>Veículo</th><th>Avaliação</th><th>Entregas</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {filtered.map(e => {
                const veiculo = data.veiculos.find(v => v.id === e.veiculoId);
                const st = STATUS_ENTREGADOR[e.status] || {};
                return (
                  <tr key={e.id}>
                    <td><div className="flex items-center gap-2"><div className={`avatar ${avColor(e.id)}`}>{initials(e.nome)}</div><div><div className="font-semibold">{e.nome}</div><div className="text-xs text-muted">📞 {e.telefone}</div></div></div></td>
                    <td className="text-sm">{e.cpf}</td>
                    <td className="text-sm">{e.cnh}</td>
                    <td className="text-sm">{veiculo ? `${veiculo.modelo} • ${veiculo.placa}` : "–"}</td>
                    <td><div className="flex items-center gap-1"><span>⭐</span><strong className="text-sm">{e.avaliacao || "–"}</strong><span className="text-xs text-muted">({e.totalEntregas})</span>{e.avaliacao > 0 && e.avaliacao < 2 && <span className="badge badge-danger" style={{ fontSize: "0.65rem" }}>⚠ Alerta</span>}</div></td>
                    <td><span className="badge badge-info">{e.totalEntregas}</span></td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                    <td><div className="table-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(e)}>✏️</button>
                      <button className="btn btn-sm btn-ghost" style={{ color: "var(--danger)" }} onClick={() => setConfirm(e.id)}>🗑️</button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── VEICULOS ─────────────────────────── */
function Veiculos({ data, setData, toast }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [confirm, setConfirm] = useState(null);

  const openNew = () => setForm({ modelo: "", placa: "", ano: "", tipo: "Moto", cor: "", entregadorId: null }) || setModal("new");
  const openEdit = (v) => setForm({ ...v }) || setModal("edit");
  const save = () => {
    if (!form.modelo || !form.placa) return;
    if (modal === "new") {
      setData(d => ({ ...d, veiculos: [...d.veiculos, { ...form, id: uid() }] }));
      toast("✅ Veículo cadastrado!");
    } else {
      setData(d => ({ ...d, veiculos: d.veiculos.map(v => v.id === form.id ? form : v) }));
      toast("✅ Veículo atualizado!");
    }
    setModal(null);
  };
  const del = (id) => { setData(d => ({ ...d, veiculos: d.veiculos.filter(v => v.id !== id) })); toast("🗑️ Veículo excluído!"); setConfirm(null); };

  return (
    <div className="content">
      {confirm && <ConfirmModal msg="Excluir este veículo?" onConfirm={() => del(confirm)} onClose={() => setConfirm(null)} />}
      {modal && (
        <Modal title={modal === "new" ? "🚗 Novo Veículo" : "✏️ Editar Veículo"} onClose={() => setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-primary" onClick={save}>💾 Salvar</button></>}>
          <div className="form-grid form-grid-2">
            <div className="form-group span-2"><label className="form-label req">Modelo</label><input className="form-control" value={form.modelo || ""} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label req">Placa</label><input className="form-control" placeholder="AAA-0000" value={form.placa || ""} onChange={e => setForm(f => ({ ...f, placa: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Ano</label><input type="number" className="form-control" value={form.ano || ""} onChange={e => setForm(f => ({ ...f, ano: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Tipo</label>
              <select className="form-control" value={form.tipo || "Moto"} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                <option>Moto</option><option>Carro</option><option>Bicicleta</option><option>Scooter</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Cor</label><input className="form-control" value={form.cor || ""} onChange={e => setForm(f => ({ ...f, cor: e.target.value }))} /></div>
            <div className="form-group span-2"><label className="form-label">Entregador Vinculado</label>
              <select className="form-control" value={form.entregadorId || ""} onChange={e => setForm(f => ({ ...f, entregadorId: e.target.value ? Number(e.target.value) : null }))}>
                <option value="">Nenhum</option>
                {data.entregadores.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
        <button className="btn btn-primary" onClick={openNew}>+ Novo Veículo</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Veículo</th><th>Placa</th><th>Tipo</th><th>Ano</th><th>Cor</th><th>Entregador</th><th>Ações</th></tr></thead>
            <tbody>
              {data.veiculos.map(v => {
                const entregador = data.entregadores.find(e => e.id === v.entregadorId);
                return (
                  <tr key={v.id}>
                    <td className="font-semibold">{v.modelo}</td>
                    <td><span className="badge badge-secondary">{v.placa}</span></td>
                    <td>{v.tipo}</td>
                    <td className="text-sm">{v.ano}</td>
                    <td className="text-sm">{v.cor}</td>
                    <td className="text-sm">{entregador?.nome || <span className="text-muted">Sem entregador</span>}</td>
                    <td><div className="table-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(v)}>✏️</button>
                      <button className="btn btn-sm btn-ghost" style={{ color: "var(--danger)" }} onClick={() => setConfirm(v.id)}>🗑️</button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── PRODUTOS ─────────────────────────── */
function Produtos({ data, setData, toast }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);

  const openNew = () => setForm({ nome: "", categoriaId: 1, preco: "", estoque: "", status: "ativo", emoji: "🍽️" }) || setModal("new");
  const openEdit = (p) => setForm({ ...p }) || setModal("edit");
  const save = () => {
    if (!form.nome) return;
    if (modal === "new") {
      setData(d => ({ ...d, produtos: [...d.produtos, { ...form, id: uid(), preco: Number(form.preco), estoque: Number(form.estoque) }] }));
      toast("✅ Produto cadastrado!");
    } else {
      setData(d => ({ ...d, produtos: d.produtos.map(p => p.id === form.id ? { ...form, preco: Number(form.preco), estoque: Number(form.estoque) } : p) }));
      toast("✅ Produto atualizado!");
    }
    setModal(null);
  };
  const del = (id) => { setData(d => ({ ...d, produtos: d.produtos.filter(p => p.id !== id) })); toast("🗑️ Produto excluído!"); setConfirm(null); };
  const toggleStatus = (id) => {
    setData(d => ({ ...d, produtos: d.produtos.map(p => p.id === id ? { ...p, status: p.status === "ativo" ? "inativo" : "ativo" } : p) }));
    toast("✅ Status do produto alterado!");
  };
  const filtered = data.produtos.filter(p => !search || p.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="content">
      {confirm && <ConfirmModal msg="Excluir este produto?" onConfirm={() => del(confirm)} onClose={() => setConfirm(null)} />}
      {modal && (
        <Modal title={modal === "new" ? "🍕 Novo Produto" : "✏️ Editar Produto"} onClose={() => setModal(null)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-primary" onClick={save}>💾 Salvar</button></>}>
          <div className="form-grid form-grid-2">
            <div className="form-group span-2"><label className="form-label req">Nome</label><input className="form-control" value={form.nome || ""} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Emoji</label><input className="form-control" value={form.emoji || ""} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label req">Categoria</label>
              <select className="form-control" value={form.categoriaId || ""} onChange={e => setForm(f => ({ ...f, categoriaId: Number(e.target.value) }))}>
                {data.categorias.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label req">Preço (R$)</label><input type="number" step="0.01" className="form-control" value={form.preco || ""} onChange={e => setForm(f => ({ ...f, preco: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Estoque</label><input type="number" className="form-control" value={form.estoque || ""} onChange={e => setForm(f => ({ ...f, estoque: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-control" value={form.status || "ativo"} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="ativo">Ativo</option><option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
      <div className="toolbar">
        <div className="toolbar-left"><div className="search-box"><span>🔍</span><input placeholder="Buscar produto..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        <div className="toolbar-right"><button className="btn btn-primary" onClick={openNew}>+ Novo Produto</button></div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {filtered.map(p => {
                const cat = data.categorias.find(c => c.id === p.categoriaId);
                const st = STATUS_PRODUTO[p.status] || {};
                return (
                  <tr key={p.id}>
                    <td><div className="flex items-center gap-2"><span style={{ fontSize: "1.4rem" }}>{p.emoji}</span><span className="font-semibold">{p.nome}</span></div></td>
                    <td className="text-sm">{cat?.icone} {cat?.nome}</td>
                    <td className="font-bold text-primary">{fmt(p.preco)}</td>
                    <td>{p.estoque > 0 ? <span className="badge badge-success">{p.estoque}</span> : <span className="badge badge-danger">Sem estoque</span>}</td>
                    <td>
                      <button className={`badge ${st.cls}`} style={{ border: "none", cursor: "pointer" }} onClick={() => toggleStatus(p.id)} title="Clique para alternar">
                        {st.label} 🔄
                      </button>
                    </td>
                    <td><div className="table-actions">
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}>✏️</button>
                      <button className="btn btn-sm btn-ghost" style={{ color: "var(--danger)" }} onClick={() => setConfirm(p.id)}>🗑️</button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── CATEGORIAS ─────────────────────────── */
function Categorias({ data, setData, toast }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [confirm, setConfirm] = useState(null);
  const openNew = () => setForm({ nome: "", icone: "🏷️", ativa: true }) || setModal("new");
  const openEdit = (c) => setForm({ ...c }) || setModal("edit");
  const save = () => {
    if (modal === "new") setData(d => ({ ...d, categorias: [...d.categorias, { ...form, id: uid() }] }));
    else setData(d => ({ ...d, categorias: d.categorias.map(c => c.id === form.id ? form : c) }));
    toast("✅ Categoria salva!"); setModal(null);
  };
  const del = (id) => { setData(d => ({ ...d, categorias: d.categorias.filter(c => c.id !== id) })); toast("🗑️ Categoria excluída!"); setConfirm(null); };

  return (
    <div className="content">
      {confirm && <ConfirmModal msg="Excluir esta categoria?" onConfirm={() => del(confirm)} onClose={() => setConfirm(null)} />}
      {modal && (
        <Modal title={modal === "new" ? "🏷️ Nova Categoria" : "✏️ Editar Categoria"} onClose={() => setModal(null)} size="modal-sm"
          footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-primary" onClick={save}>💾 Salvar</button></>}>
          <div className="form-grid">
            <div className="form-group"><label className="form-label req">Nome</label><input className="form-control" value={form.nome || ""} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Ícone (emoji)</label><input className="form-control" value={form.icone || ""} onChange={e => setForm(f => ({ ...f, icone: e.target.value }))} /></div>
            <div className="form-group"><div className="toggle-row"><label className="toggle"><input type="checkbox" checked={form.ativa !== false} onChange={e => setForm(f => ({ ...f, ativa: e.target.checked }))} /><span className="toggle-slider" /></label><span className="text-sm">Ativa</span></div></div>
          </div>
        </Modal>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
        <button className="btn btn-primary" onClick={openNew}>+ Nova Categoria</button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Categoria</th><th>Ícone</th><th>Produtos</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {data.categorias.map(c => (
                <tr key={c.id}>
                  <td className="font-semibold">{c.nome}</td>
                  <td style={{ fontSize: "1.4rem" }}>{c.icone}</td>
                  <td><span className="badge badge-info">{data.produtos.filter(p => p.categoriaId === c.id).length} produtos</span></td>
                  <td><span className={`badge ${c.ativa ? "badge-success" : "badge-warning"}`}>{c.ativa ? "✓ Ativa" : "⏸ Inativa"}</span></td>
                  <td><div className="table-actions">
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}>✏️</button>
                    <button className="btn btn-sm btn-ghost" style={{ color: "var(--danger)" }} onClick={() => setConfirm(c.id)}>🗑️</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── AVALIACOES ─────────────────────────── */
function Avaliacoes({ data, setData, toast }) {
  const [confirm, setConfirm] = useState(null);
  const del = (id) => { setData(d => ({ ...d, avaliacoes: d.avaliacoes.filter(a => a.id !== id) })); toast("🗑️ Avaliação excluída!"); setConfirm(null); };

  return (
    <div className="content">
      {confirm && <ConfirmModal msg="Excluir esta avaliação?" onConfirm={() => del(confirm)} onClose={() => setConfirm(null)} />}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <div className="stat-card"><div className="stat-icon si-yellow">⭐</div><div><div className="stat-value">{data.avaliacoes.length > 0 ? (data.avaliacoes.reduce((s, a) => s + a.notaComida, 0) / data.avaliacoes.length).toFixed(1) : "–"}</div><div className="stat-label">Média Comida</div></div></div>
        <div className="stat-card"><div className="stat-icon si-blue">🛵</div><div><div className="stat-value">{data.avaliacoes.length > 0 ? (data.avaliacoes.reduce((s, a) => s + a.notaEntrega, 0) / data.avaliacoes.length).toFixed(1) : "–"}</div><div className="stat-label">Média Entrega</div></div></div>
        <div className="stat-card"><div className="stat-icon si-green">📊</div><div><div className="stat-value">{data.avaliacoes.length}</div><div className="stat-label">Total</div></div></div>
        <div className="stat-card"><div className="stat-icon si-orange">💬</div><div><div className="stat-value">{data.avaliacoes.filter(a => a.comentario).length}</div><div className="stat-label">Com comentários</div></div></div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Cliente</th><th>Pedido</th><th>Nota Comida</th><th>Nota Entrega</th><th>Comentário</th><th>Entregador</th><th>Data</th><th>Ações</th></tr></thead>
            <tbody>
              {data.avaliacoes.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="icon">⭐</div>Nenhuma avaliação ainda</div></td></tr>}
              {data.avaliacoes.map(a => {
                const cli = data.clientes.find(c => c.id === a.clienteId);
                const ent = data.entregadores.find(e => e.id === a.entregadorId);
                return (
                  <tr key={a.id}>
                    <td><div className="flex items-center gap-2"><div className={`avatar av-sm ${avColor(a.clienteId)}`}>{initials(cli?.nome || "?")}</div><span className="text-sm">{cli?.nome || <span className="text-muted">Cliente #{a.clienteId}</span>}</span></div></td>
                    <td className="font-semibold text-primary">#{a.pedidoId}</td>
                    <td>{"⭐".repeat(a.notaComida)} <span className="text-xs text-muted">{a.notaComida}/5</span></td>
                    <td>{"⭐".repeat(a.notaEntrega)} <span className="text-xs text-muted">{a.notaEntrega}/5</span></td>
                    <td className="text-sm" style={{ maxWidth: "200px" }}>{a.comentario || <span className="text-muted">–</span>}</td>
                    <td className="text-sm">{ent?.nome || "–"}</td>
                    <td className="text-xs text-muted">{new Date(a.data).toLocaleDateString("pt-BR")}</td>
                    <td><button className="btn btn-sm btn-ghost" style={{ color: "var(--danger)" }} onClick={() => setConfirm(a.id)}>🗑️</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── RELATORIOS ─────────────────────────── */
function Relatorios({ data }) {
  const byBairro = data.pedidos.reduce((acc, p) => { acc[p.bairro] = (acc[p.bairro] || 0) + 1; return acc; }, {});
  const topEntregadores = [...data.entregadores].sort((a, b) => b.avaliacao - a.avaliacao).slice(0, 5);
  return (
    <div className="content">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="card">
          <div className="card-header"><span className="card-title">📍 Pedidos por Bairro</span></div>
          <div className="card-body">
            {Object.entries(byBairro).map(([bairro, total]) => (
              <div key={bairro} className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">{bairro}</span>
                <div className="flex items-center gap-2">
                  <div style={{ width: `${(total / Math.max(...Object.values(byBairro))) * 100}px`, height: "6px", background: "var(--primary)", borderRadius: "3px" }} />
                  <span className="badge badge-info">{total}</span>
                </div>
              </div>
            ))}
            {Object.keys(byBairro).length === 0 && <p className="text-muted text-sm">Sem dados</p>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">🏆 Top Entregadores</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Entregador</th><th>Avaliação</th><th>Entregas</th></tr></thead>
              <tbody>
                {topEntregadores.map((e, i) => (
                  <tr key={e.id}>
                    <td className="font-bold text-primary">{i + 1}º</td>
                    <td className="font-semibold">{e.nome}</td>
                    <td>⭐ {e.avaliacao}</td>
                    <td><span className="badge badge-info">{e.totalEntregas}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── KITCHEN ─────────────────────────── */
function Kitchen({ data, setData, toast, onLogout }) {
  const [clock, setClock] = useState(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  useEffect(() => { const t = setInterval(() => setClock(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })), 10000); return () => clearInterval(t); }, []);

  const changeStatus = (id, status) => {
    setData(d => ({ ...d, pedidos: d.pedidos.map(p => p.id === id ? { ...p, status } : p) }));
    toast(`✅ Pedido #${id} → ${STATUS_PEDIDO[status]?.label}`);
  };

  const groups = { aguardando: [], preparando: [], pronto: [], entregue: [] };
  data.pedidos.forEach(p => { if (groups[p.status]) groups[p.status].push(p); });

  const KitchenCard = ({ pedido }) => {
    const cli = data.clientes.find(c => c.id === pedido.clienteId);
    const mins = Math.floor((Date.now() - new Date(pedido.dataPedido).getTime()) / 60000);
    const timeClass = mins > 30 ? "k-urgent" : mins > 15 ? "k-normal" : "k-ok";
    return (
      <div className="k-card">
        <div className="k-id">#{pedido.id}</div>
        <div className="k-client">{cli?.nome || "Cliente"}</div>
        <div className="k-items">
          {pedido.itens.map((it, i) => {
            const prod = data.produtos.find(p => p.id === it.produtoId);
            return <div key={i}>{prod?.emoji} {prod?.nome} × {it.qtd}</div>;
          })}
        </div>
        {pedido.observacoes && <div style={{ fontSize: "0.72rem", color: "#f59e0b", marginBottom: "6px" }}>💬 {pedido.observacoes}</div>}
        <div className={`k-time ${timeClass}`}>⏰ {mins} min atrás</div>
        <div style={{ display: "flex", gap: "4px" }}>
          {pedido.status === "aguardando" && <button className="btn btn-sm btn-primary btn-full" onClick={() => changeStatus(pedido.id, "preparando")}>▶ Iniciar</button>}
          {pedido.status === "preparando" && <button className="btn btn-sm btn-success btn-full" onClick={() => changeStatus(pedido.id, "pronto")}>✅ Pronto</button>}
          {pedido.status === "pronto" && <button className="btn btn-sm btn-secondary btn-full" style={{ cursor: "default" }}>🛵 Aguardando Entregador</button>}
        </div>
      </div>
    );
  };

  const cols = [
    { key: "aguardando", label: "⏳ Novos Pedidos", cls: "kch-new" },
    { key: "preparando", label: "🍳 Em Preparo", cls: "kch-prep" },
    { key: "pronto", label: "✅ Prontos", cls: "kch-ready" },
    { key: "entregue", label: "📦 Entregues", cls: "kch-done" },
  ];

  return (
    <div className="kitchen-layout">
      <div className="kitchen-nav">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "1rem", color: "#fff" }}>
          <span>⚡</span> TurboFood <span style={{ color: "rgba(255,255,255,0.4)", margin: "0 4px" }}>|</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 400, fontSize: "0.85rem" }}>🍳 Painel da Cozinha</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.3rem", color: "#fff" }}>{clock}</span>
          <span style={{ background: "rgba(245,158,11,0.25)", color: "#fbbf24", padding: "4px 12px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 700 }}>
            {groups.aguardando.length} novos pedidos
          </span>
          <button className="btn btn-sm" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none" }} onClick={onLogout}>Sair 🚪</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", padding: "16px 20px 0" }}>
        {[
          { label: "Novos", value: groups.aguardando.length, color: "#fbbf24" },
          { label: "Preparando", value: groups.preparando.length, color: "#a78bfa" },
          { label: "Prontos", value: groups.pronto.length, color: "#34d399" },
          { label: "Entregues Hoje", value: groups.entregue.length, color: "#fff" },
        ].map(s => (
          <div key={s.label} style={{ background: "#1a1d26", borderRadius: "var(--radius)", padding: "14px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="kitchen-board">
        {cols.map(col => (
          <div key={col.key} className="kitchen-col">
            <div className={`kitchen-col-hdr ${col.cls}`}>
              <span>{col.label}</span>
              <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "999px", fontSize: "0.75rem" }}>{groups[col.key].length}</span>
            </div>
            <div style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
              {groups[col.key].length === 0 && <div style={{ textAlign: "center", padding: "20px", color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>Nenhum pedido</div>}
              {groups[col.key].map(p => <KitchenCard key={p.id} pedido={p} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── CUSTOMER AREA ─────────────────────────── */
function CustomerArea({ data, setData, toast, onLogout }) {
  const [view, setView] = useState("cardapio"); // cardapio | carrinho | pedidos | confirmado | avaliar
  const [cart, setCart] = useState([]);
  const [catFilter, setCatFilter] = useState(null);
  const [address, setAddress] = useState("Rua das Flores, 123 – Centro");
  const [payMethod, setPayMethod] = useState("pix");
  const [obs, setObs] = useState("");
  const [avaliarPedido, setAvaliarPedido] = useState(null);
  const [avalForm, setAvalForm] = useState({ notaComida: 5, notaEntrega: 5, comentario: "" });

  const ME = data.clientes[0]; // simula cliente logado
  const meusPedidos = data.pedidos.filter(p => p.clienteId === ME.id);

  const addToCart = (prod) => {
    setCart(c => {
      const ex = c.find(i => i.produtoId === prod.id);
      return ex ? c.map(i => i.produtoId === prod.id ? { ...i, qtd: i.qtd + 1 } : i) : [...c, { produtoId: prod.id, qtd: 1, preco: prod.preco }];
    });
    toast(`🛒 ${prod.nome} adicionado!`);
  };
  const removeFromCart = (produtoId) => setCart(c => c.filter(i => i.produtoId !== produtoId));
  const changeQty = (produtoId, delta) => {
    setCart(c => c.map(i => i.produtoId === produtoId ? { ...i, qtd: Math.max(0, i.qtd + delta) } : i).filter(i => i.qtd > 0));
  };
  const cartTotal = cart.reduce((s, i) => s + i.preco * i.qtd, 0);
  const cartCount = cart.reduce((s, i) => s + i.qtd, 0);

  const confirmarPedido = () => {
    if (cart.length === 0) return;
    const novo = {
      id: uid(), clienteId: ME.id, status: "aguardando", pagamentoStatus: payMethod === "pix" ? "aprovado" : "pendente",
      pagamentoMetodo: payMethod, total: cartTotal, taxa: 5, endereco: address, bairro: "Centro", observacoes: obs,
      dataPedido: new Date().toISOString(), itens: cart.map(i => ({ ...i })),
    };
    setData(d => ({ ...d, pedidos: [...d.pedidos, novo] }));
    setCart([]);
    setObs("");
    setView("confirmado");
  };

  const enviarAvaliacao = () => {
    const aval = { id: uid(), clienteId: ME.id, pedidoId: avaliarPedido.id, entregadorId: null, ...avalForm, data: new Date().toISOString() };
    setData(d => ({ ...d, avaliacoes: [...d.avaliacoes, aval] }));
    toast("⭐ Avaliação enviada!");
    setAvaliarPedido(null);
  };

  const produtos = data.produtos.filter(p => p.status === "ativo" && (!catFilter || p.categoriaId === catFilter));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav className="cust-nav">
        <a className="nav-logo" onClick={() => setView("cardapio")} style={{ cursor: "pointer" }}>
          <div style={{ width: "28px", height: "28px", background: "var(--primary)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>⚡</div>
          Turbo<span>Food</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button className={`btn btn-sm ${view === "cardapio" ? "btn-primary" : "btn-ghost"}`} onClick={() => setView("cardapio")}>🍕 Cardápio</button>
          <button className={`btn btn-sm ${view === "pedidos" ? "btn-primary" : "btn-ghost"}`} onClick={() => setView("pedidos")}>📋 Meus Pedidos</button>
          <div className={`s-avatar ${avColor(ME.id)}`} style={{ cursor: "pointer" }} title={ME.nome}>{initials(ME.nome)}</div>
          <button className="btn btn-sm btn-ghost" onClick={onLogout}>🚪</button>
        </div>
      </nav>

      {/* CARDÁPIO */}
      {view === "cardapio" && (
        <div className="menu-wrap">
          <h2 className="font-extrabold" style={{ fontSize: "1.3rem", marginBottom: "4px" }}>🍕 Cardápio</h2>
          <p className="text-muted text-sm mb-4">Escolha seus itens favoritos</p>
          <div className="menu-cats">
            <button className={`cat-btn${catFilter === null ? " active" : ""}`} onClick={() => setCatFilter(null)}>Todos</button>
            {data.categorias.filter(c => c.ativa).map(c => (
              <button key={c.id} className={`cat-btn${catFilter === c.id ? " active" : ""}`} onClick={() => setCatFilter(c.id)}>{c.icone} {c.nome}</button>
            ))}
          </div>
          <div className="menu-grid">
            {produtos.map(p => {
              const inCart = cart.find(i => i.produtoId === p.id);
              return (
                <div key={p.id} className="menu-card">
                  <div className="menu-card-img">{p.emoji}</div>
                  <div className="menu-card-body">
                    <div className="menu-card-name">{p.nome}</div>
                    <div className="menu-card-price">{fmt(p.preco)}</div>
                  </div>
                  <div className="menu-card-footer">
                    {!inCart
                      ? <button className="btn btn-primary btn-sm btn-full" onClick={() => addToCart(p)}>+ Adicionar</button>
                      : <div className="flex items-center gap-2 w-full justify-between">
                          <div className="qty-ctrl">
                            <button className="qty-btn" onClick={() => changeQty(p.id, -1)}>−</button>
                            <span className="qty-val">{inCart.qtd}</span>
                            <button className="qty-btn" onClick={() => changeQty(p.id, 1)}>+</button>
                          </div>
                          <span className="font-bold text-primary text-sm">{fmt(inCart.preco * inCart.qtd)}</span>
                        </div>
                    }
                  </div>
                </div>
              );
            })}
          </div>
          {cartCount > 0 && (
            <button className="cart-count" onClick={() => setView("carrinho")}>
              🛒 Ver Carrinho ({cartCount}) · {fmt(cartTotal)}
            </button>
          )}
        </div>
      )}

      {/* CARRINHO */}
      {view === "carrinho" && (
        <div className="menu-wrap">
          <div className="steps mb-4">
            {["Itens", "Endereço", "Pagamento", "Confirmado"].map((s, i) => (
              <div key={s} className="step">
                {i > 0 && <div className={`step-line ${i < 3 ? "done" : "pending"}`} />}
                <div className={`step-num ${i < 3 ? "done" : "pending"}`}>{i + 1}</div>
                <span className={`step-label ${i < 3 ? "done" : "pending"}`}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Itens */}
              <div className="card">
                <div className="card-header"><span className="card-title">🛒 Itens do Pedido</span><button className="btn btn-sm btn-ghost text-primary" onClick={() => setView("cardapio")}>+ Adicionar</button></div>
                <div>
                  {cart.length === 0 && <div className="empty-state" style={{ padding: "20px" }}><div className="icon">🛒</div>Carrinho vazio</div>}
                  {cart.map(item => {
                    const prod = data.produtos.find(p => p.id === item.produtoId);
                    return prod ? (
                      <div key={item.produtoId} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "1.8rem" }}>{prod.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div className="font-semibold text-sm">{prod.nome}</div>
                          <div className="text-xs text-muted">{fmt(item.preco)} cada</div>
                        </div>
                        <div className="qty-ctrl">
                          <button className="qty-btn" onClick={() => changeQty(item.produtoId, -1)}>−</button>
                          <span className="qty-val">{item.qtd}</span>
                          <button className="qty-btn" onClick={() => changeQty(item.produtoId, 1)}>+</button>
                        </div>
                        <div className="font-bold text-sm" style={{ minWidth: "60px", textAlign: "right" }}>{fmt(item.preco * item.qtd)}</div>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => removeFromCart(item.produtoId)}>✕</button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              {/* Endereço */}
              <div className="card">
                <div className="card-header"><span className="card-title">📍 Endereço de Entrega</span></div>
                <div className="card-body">
                  <input className="form-control" value={address} onChange={e => setAddress(e.target.value)} placeholder="Endereço completo" />
                </div>
              </div>
              {/* Pagamento */}
              <div className="card">
                <div className="card-header"><span className="card-title">💳 Forma de Pagamento</span></div>
                <div className="card-body flex" style={{ flexDirection: "column", gap: "8px" }}>
                  {[{ id: "pix", label: "PIX", icon: "⚡", sub: "Aprovação imediata" }, { id: "credito", label: "Cartão de Crédito", icon: "💳", sub: "Confirmação manual" }, { id: "debito", label: "Cartão de Débito", icon: "💳", sub: "Confirmação manual" }].map(pm => (
                    <label key={pm.id} style={{ display: "flex", gap: "10px", padding: "10px", border: `2px solid ${payMethod === pm.id ? "var(--primary)" : "var(--border)"}`, borderRadius: "var(--radius-sm)", cursor: "pointer", background: payMethod === pm.id ? "var(--primary-bg)" : "#fff", alignItems: "center" }}>
                      <input type="radio" name="pay" checked={payMethod === pm.id} onChange={() => setPayMethod(pm.id)} style={{ accentColor: "var(--primary)" }} />
                      <span style={{ fontSize: "1.2rem" }}>{pm.icon}</span>
                      <div><div className="font-semibold text-sm">{pm.label}</div><div className="text-xs text-muted">{pm.sub}</div></div>
                    </label>
                  ))}
                </div>
              </div>
              {/* Obs */}
              <div className="card">
                <div className="card-header"><span className="card-title">💬 Observações</span></div>
                <div className="card-body"><textarea className="form-control" rows={3} placeholder="Ex: sem cebola, ponto da carne..." value={obs} onChange={e => setObs(e.target.value)} /></div>
              </div>
            </div>
            {/* Resumo */}
            <div className="card" style={{ position: "sticky", top: "70px" }}>
              <div className="card-header"><span className="card-title">🧾 Resumo</span></div>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {cart.map(item => {
                  const prod = data.produtos.find(p => p.id === item.produtoId);
                  return prod ? <div key={item.produtoId} className="flex justify-between text-sm"><span>{prod.nome} ×{item.qtd}</span><span>{fmt(item.preco * item.qtd)}</span></div> : null;
                })}
                <hr className="hr" />
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
                <div className="flex justify-between text-sm"><span>Taxa entrega</span><span>R$ 5,00</span></div>
                <div style={{ background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "12px", marginTop: "6px" }}>
                  <div className="flex justify-between"><span className="font-bold">Total</span><span className="font-extrabold text-primary" style={{ fontSize: "1.1rem" }}>{fmt(cartTotal + 5)}</span></div>
                </div>
                <button className="btn btn-primary btn-xl btn-full mt-2" onClick={confirmarPedido} disabled={cart.length === 0}>🚀 Confirmar Pedido</button>
                <button className="btn btn-ghost btn-full" onClick={() => setView("cardapio")}>← Voltar ao cardápio</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMADO */}
      {view === "confirmado" && (
        <div className="menu-wrap">
          <div className="confirm-screen">
            <div className="confirm-icon">🎉</div>
            <h2 className="font-extrabold" style={{ fontSize: "1.5rem" }}>Pedido Realizado!</h2>
            <p className="text-muted">Seu pedido foi enviado para a cozinha. Acompanhe pelo painel.</p>
            <div className="alert alert-info" style={{ marginTop: "8px" }}>⏱️ Estimativa: <strong>35–50 minutos</strong></div>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button className="btn btn-primary btn-lg" onClick={() => setView("pedidos")}>📋 Ver Meus Pedidos</button>
              <button className="btn btn-secondary btn-lg" onClick={() => setView("cardapio")}>🍕 Voltar ao Cardápio</button>
            </div>
          </div>
        </div>
      )}

      {/* MEUS PEDIDOS */}
      {view === "pedidos" && (
        <div className="menu-wrap">
          {avaliarPedido && (
            <Modal title="⭐ Avaliar Pedido" onClose={() => setAvaliarPedido(null)} size="modal-sm"
              footer={<><button className="btn btn-secondary" onClick={() => setAvaliarPedido(null)}>Cancelar</button><button className="btn btn-primary" onClick={enviarAvaliacao}>⭐ Enviar</button></>}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label className="form-label mb-2">Nota para a comida</label>
                  <div className="stars">{[1,2,3,4,5].map(n => <button key={n} className="star-btn" onClick={() => setAvalForm(f => ({ ...f, notaComida: n }))}>{n <= avalForm.notaComida ? "⭐" : "☆"}</button>)}</div>
                </div>
                <div>
                  <label className="form-label mb-2">Nota para a entrega</label>
                  <div className="stars">{[1,2,3,4,5].map(n => <button key={n} className="star-btn" onClick={() => setAvalForm(f => ({ ...f, notaEntrega: n }))}>{n <= avalForm.notaEntrega ? "⭐" : "☆"}</button>)}</div>
                </div>
                <div className="form-group"><label className="form-label">Comentário</label><textarea className="form-control" rows={3} value={avalForm.comentario} onChange={e => setAvalForm(f => ({ ...f, comentario: e.target.value }))} placeholder="Diga o que achou..." /></div>
              </div>
            </Modal>
          )}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold" style={{ fontSize: "1.2rem" }}>📋 Meus Pedidos</h2>
            <button className="btn btn-primary" onClick={() => setView("cardapio")}>🍕 Fazer Novo Pedido</button>
          </div>
          {meusPedidos.length === 0 && <div className="empty-state card" style={{ padding: "40px" }}><div className="icon">📋</div><p>Você ainda não fez nenhum pedido.</p><button className="btn btn-primary mt-4" onClick={() => setView("cardapio")}>Ver Cardápio</button></div>}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[...meusPedidos].reverse().map(p => {
              const st = STATUS_PEDIDO[p.status] || {};
              const jaCriticou = data.avaliacoes.find(a => a.pedidoId === p.id && a.clienteId === ME.id);
              const podeAvaliar = p.status === "entregue" && !jaCriticou;
              return (
                <div key={p.id} className="card">
                  <div className="card-header">
                    <span className="font-bold">Pedido #{p.id}</span>
                    <span className={`badge ${st.cls}`}>{st.emoji} {st.label}</span>
                  </div>
                  <div className="card-body">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted">{p.itens.length} {p.itens.length === 1 ? "item" : "itens"} · {p.pagamentoMetodo?.toUpperCase()} · {new Date(p.dataPedido).toLocaleDateString("pt-BR")}</div>
                        <div className="font-bold text-primary mt-1">{fmt(p.total + p.taxa)}</div>
                      </div>
                      {podeAvaliar && (
                        <button className="btn btn-warning btn-sm" onClick={() => { setAvaliarPedido(p); setAvalForm({ notaComida: 5, notaEntrega: 5, comentario: "" }); }}>⭐ Avaliar</button>
                      )}
                      {jaCriticou && <span className="badge badge-success">✅ Avaliado</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── DELIVERY PANEL ─────────────────────────── */
function DeliveryPanel({ data, setData, toast, onLogout }) {
  const [page, setPage] = useState("del-painel");
  const ME = data.entregadores[0]; // simula entregador logado
  const minhasEntregas = data.entregas.filter(e => e.entregadorId === ME.id && e.status === "em_andamento");
  const disponíveis = data.pedidos.filter(p => p.status === "pronto" && !data.entregas.find(e => e.pedidoId === p.id && e.status === "em_andamento"));

  const pegarEntrega = (pedidoId) => {
    const nova = { id: uid(), pedidoId, entregadorId: ME.id, status: "em_andamento", dataInicio: new Date().toISOString(), dataFim: null };
    setData(d => ({
      ...d,
      entregas: [...d.entregas, nova],
      pedidos: d.pedidos.map(p => p.id === pedidoId ? { ...p, status: "em_entrega" } : p),
      entregadores: d.entregadores.map(e => e.id === ME.id ? { ...e, status: "em_entrega" } : e),
    }));
    toast("🛵 Entrega aceita!");
  };

  const confirmarEntrega = (entregaId) => {
    const entrega = data.entregas.find(e => e.id === entregaId);
    setData(d => ({
      ...d,
      entregas: d.entregas.map(e => e.id === entregaId ? { ...e, status: "concluida", dataFim: new Date().toISOString() } : e),
      pedidos: d.pedidos.map(p => p.id === entrega.pedidoId ? { ...p, status: "entregue" } : p),
      entregadores: d.entregadores.map(e => e.id === ME.id ? { ...e, status: "disponivel", totalEntregas: e.totalEntregas + 1 } : e),
    }));
    toast("✅ Entrega confirmada!");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="s-logo">
          <div className="s-logo-icon">⚡</div>
          <div><div className="s-logo-name">TurboFood</div><div className="s-logo-sub">Entregador</div></div>
        </div>
        <nav style={{ flex: 1 }}>
          <div className="s-section">Menu</div>
          {[
            { id: "del-painel", icon: "🏠", label: "Painel" },
            { id: "del-disponíveis", icon: "📦", label: "Disponíveis", badge: disponíveis.length },
            { id: "del-minhas", icon: "🛵", label: "Minhas Entregas", badge: minhasEntregas.length },
            { id: "del-historico", icon: "📋", label: "Histórico" },
          ].map(l => (
            <button key={l.id} className={`s-link${page === l.id ? " active" : ""}`} onClick={() => setPage(l.id)}>
              <span>{l.icon}</span> {l.label}
              {l.badge > 0 && <span className="badge">{l.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="s-footer">
          <div className={`s-avatar ${avColor(ME.id)}`}>{initials(ME.nome)}</div>
          <div><div className="s-user-name" style={{ fontSize: "0.78rem" }}>{ME.nome}</div><div className="s-user-role">Entregador</div></div>
          <button className="s-logout" onClick={onLogout}>🚪</button>
        </div>
      </aside>
      <div className="main">
        <div className="topbar">
          <div><h1 style={{ fontSize: "1rem", fontWeight: 700 }}>
            {page === "del-painel" ? "🏠 Painel" : page === "del-disponíveis" ? "📦 Entregas Disponíveis" : page === "del-minhas" ? "🛵 Minhas Entregas" : "📋 Histórico"}
          </h1></div>
          <div className="topbar-right">
            <span className={`badge ${ME.status === "disponivel" ? "badge-success" : ME.status === "em_entrega" ? "badge-info" : "badge-warning"}`}>
              {STATUS_ENTREGADOR[ME.status]?.label}
            </span>
          </div>
        </div>
        <div className="content">
          {page === "del-painel" && (
            <>
              <div className="del-stats">
                <div className="del-stat"><div className="del-stat-val">🛵</div><div className="del-stat-val">{ME.totalEntregas}</div><div className="del-stat-lbl">Total de Entregas</div></div>
                <div className="del-stat"><div className="del-stat-val">⭐</div><div className="del-stat-val">{ME.avaliacao || "–"}</div><div className="del-stat-lbl">Avaliação Média</div></div>
                <div className="del-stat"><div className="del-stat-val">📦</div><div className="del-stat-val">{disponíveis.length}</div><div className="del-stat-lbl">Disponíveis</div></div>
                <div className="del-stat"><div className="del-stat-val">🚚</div><div className="del-stat-val">{minhasEntregas.length}</div><div className="del-stat-lbl">Em Andamento</div></div>
              </div>
              {ME.avaliacao > 0 && ME.avaliacao < 2 && ME.totalEntregas >= 50 && (
                <div className="alert alert-danger">⚠️ Sua avaliação está abaixo de 2,0 com mais de 50 entregas. Risco de desligamento automático (RN01).</div>
              )}
              {minhasEntregas.length > 0 && (
                <div className="card">
                  <div className="card-header"><span className="card-title">🛵 Entregas em Andamento</span></div>
                  {minhasEntregas.map(e => {
                    const pedido = data.pedidos.find(p => p.id === e.pedidoId);
                    const cli = data.clientes.find(c => c.id === pedido?.clienteId);
                    return (
                      <div key={e.id} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                        <div className="flex justify-between items-center">
                          <div><div className="font-bold">Pedido #{e.pedidoId}</div><div className="text-sm text-muted">{cli?.nome} · {pedido?.endereco}</div></div>
                          <button className="btn btn-success" onClick={() => confirmarEntrega(e.id)}>✅ Confirmar Entrega</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
          {page === "del-disponíveis" && (
            <div className="card">
              <div className="card-header"><span className="card-title">📦 Pedidos Prontos para Entrega</span><span className="badge badge-info">{disponíveis.length}</span></div>
              {disponíveis.length === 0 && <div className="empty-state" style={{ padding: "30px" }}><div className="icon">📦</div>Nenhum pedido pronto no momento</div>}
              {disponíveis.map(p => {
                const cli = data.clientes.find(c => c.id === p.clienteId);
                return (
                  <div key={p.id} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">Pedido #{p.id}</div>
                        <div className="text-sm text-muted">{cli?.nome}</div>
                        <div className="text-sm">📍 {p.endereco}</div>
                        <div className="text-xs text-muted">{p.itens.length} itens · {fmt(p.total)}</div>
                      </div>
                      <button className="btn btn-primary" onClick={() => pegarEntrega(p.id)}>🛵 Aceitar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {page === "del-minhas" && (
            <div className="card">
              <div className="card-header"><span className="card-title">🛵 Minhas Entregas Ativas</span></div>
              {minhasEntregas.length === 0 && <div className="empty-state" style={{ padding: "30px" }}><div className="icon">🛵</div>Nenhuma entrega ativa</div>}
              {minhasEntregas.map(e => {
                const pedido = data.pedidos.find(p => p.id === e.pedidoId);
                const cli = data.clientes.find(c => c.id === pedido?.clienteId);
                return (
                  <div key={e.id} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">Pedido #{e.pedidoId}</div>
                        <div className="text-sm">{cli?.nome}</div>
                        <div className="text-sm text-muted">📍 {pedido?.endereco}</div>
                        <div className="text-xs text-muted">Saiu: {new Date(e.dataInicio).toLocaleTimeString("pt-BR")}</div>
                      </div>
                      <button className="btn btn-success btn-lg" onClick={() => confirmarEntrega(e.id)}>✅ Confirmar Entrega</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {page === "del-historico" && (
            <div className="card">
              <div className="card-header"><span className="card-title">📋 Histórico de Entregas</span></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Pedido</th><th>Início</th><th>Fim</th><th>Status</th></tr></thead>
                  <tbody>
                    {data.entregas.filter(e => e.entregadorId === ME.id).length === 0 && <tr><td colSpan={4}><div className="empty-state">Sem entregas no histórico</div></td></tr>}
                    {data.entregas.filter(e => e.entregadorId === ME.id).map(e => (
                      <tr key={e.id}>
                        <td className="font-semibold text-primary">#{e.pedidoId}</td>
                        <td className="text-sm">{new Date(e.dataInicio).toLocaleString("pt-BR")}</td>
                        <td className="text-sm">{e.dataFim ? new Date(e.dataFim).toLocaleString("pt-BR") : "–"}</td>
                        <td><span className={`badge ${e.status === "concluida" ? "badge-success" : "badge-info"}`}>{e.status === "concluida" ? "✅ Concluída" : "🛵 Em Andamento"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── ADMIN LAYOUT ─────────────────────────── */
function AdminLayout({ data, setData, toast, onLogout }) {
  const [page, setPage] = useState("dashboard");

  const pages = {
    dashboard: <Dashboard data={data} />,
    pedidos: <Pedidos data={data} setData={setData} toast={toast} />,
    pagamentos: <Pagamentos data={data} setData={setData} toast={toast} />,
    entregas: <Entregas data={data} setData={setData} toast={toast} />,
    clientes: <Clientes data={data} setData={setData} toast={toast} />,
    entregadores: <Entregadores data={data} setData={setData} toast={toast} />,
    veiculos: <Veiculos data={data} setData={setData} toast={toast} />,
    produtos: <Produtos data={data} setData={setData} toast={toast} />,
    categorias: <Categorias data={data} setData={setData} toast={toast} />,
    avaliacoes: <Avaliacoes data={data} setData={setData} toast={toast} />,
    relatorios: <Relatorios data={data} />,
  };

  const titles = {
    dashboard: ["🏠 Dashboard", "Visão geral do sistema"],
    pedidos: ["📋 Pedidos", "Gerencie todos os pedidos"],
    pagamentos: ["💳 Pagamentos", "Confirme e gerencie os pagamentos"],
    entregas: ["🚚 Entregas", "Cadastre e gerencie as entregas"],
    clientes: ["👥 Clientes", "Gerencie os clientes cadastrados"],
    entregadores: ["🛵 Entregadores", "Gerencie a equipe de entrega"],
    veiculos: ["🚗 Veículos", "Frota de veículos cadastrada"],
    produtos: ["🍕 Produtos", "Gerencie os itens do cardápio"],
    categorias: ["🏷️ Categorias", "Categorias do cardápio"],
    avaliacoes: ["⭐ Avaliações", "Feedback dos clientes"],
    relatorios: ["📊 Relatórios", "Análise e desempenho"],
  };

  const [tit, sub] = titles[page] || ["", ""];

  return (
    <div className="app-layout">
      <Sidebar role="admin" page={page} setPage={setPage} user="Roni Herculano" onLogout={onLogout} />
      <div className="main">
        <div className="topbar">
          <div><h1>{tit}</h1><p>{sub}</p></div>
          <div className="topbar-right"><button className="icon-btn">🔔<span className="dot">3</span></button></div>
        </div>
        {pages[page] || <div className="content"><p className="text-muted">Selecione uma opção no menu.</p></div>}
      </div>
    </div>
  );
}

/* ─────────────────────────── APP ROOT ─────────────────────────── */
export default function App() {
  const [role, setRole] = useState(null);
  const [data, setData] = useState(INIT);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, emoji) => {
    const id = uid();
    setToasts(t => [...t, { id, msg, emoji }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  const login = (r) => setRole(r);
  const logout = () => setRole(null);

  return (
    <>
      <style>{CSS}</style>
      <ToastContainer toasts={toasts} />
      {!role && <Login onLogin={login} />}
      {role === "admin" && <AdminLayout data={data} setData={setData} toast={toast} onLogout={logout} />}
      {role === "cliente" && <CustomerArea data={data} setData={setData} toast={toast} onLogout={logout} />}
      {role === "cozinha" && <Kitchen data={data} setData={setData} toast={toast} onLogout={logout} />}
      {role === "entregador" && <DeliveryPanel data={data} setData={setData} toast={toast} onLogout={logout} />}
    </>
  );
}
