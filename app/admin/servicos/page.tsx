"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { getServicos, salvarServicos } from "@/lib/store";
import { Servico } from "@/lib/types";

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deletarId, setDeletarId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    duracao: '',
    preco: '',
    precoNumerico: 0,
    ativo: true,
    descricao: ''
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setServicos(getServicos());
  }, []);

  const handleSalvar = (novaLista: Servico[]) => {
    setServicos(novaLista);
    salvarServicos(novaLista);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.preco) return;
    
    let novaLista = [...servicos];
    if (editId) {
      novaLista = novaLista.map(s => s.id === editId ? { ...formData, id: editId } : s);
    } else {
      novaLista.push({ ...formData, id: Date.now() });
    }
    
    handleSalvar(novaLista);
    setShowForm(false);
    setEditId(null);
    setFormData({ nome: '', duracao: '', preco: '', precoNumerico: 0, ativo: true, descricao: '' });
  };

  const iniciarEdicao = (svc: Servico) => {
    setFormData({
      nome: svc.nome,
      duracao: svc.duracao,
      preco: svc.preco,
      precoNumerico: svc.precoNumerico,
      ativo: svc.ativo,
      descricao: svc.descricao || ''
    });
    setEditId(svc.id);
    setShowForm(false);
  };

  const cancelarEdicao = () => {
    setEditId(null);
    setFormData({ nome: '', duracao: '', preco: '', precoNumerico: 0, ativo: true, descricao: '' });
  };

  const remover = (id: number) => {
    handleSalvar(servicos.filter(s => s.id !== id));
    setDeletarId(null);
  };

  const toggleAtivo = (id: number) => {
    const novaLista = servicos.map(s => s.id === id ? { ...s, ativo: !s.ativo } : s);
    handleSalvar(novaLista);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-500 font-bold">Catálogo</p>
          <h1 className="font-serif text-4xl md:text-5xl text-white tracking-tight">Serviços</h1>
        </div>
        <button 
          onClick={() => {
            setFormData({ nome: '', duracao: '', preco: '', precoNumerico: 0, ativo: true, descricao: '' });
            setEditId(null);
            setShowForm(true);
          }} 
          className="flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] touch-manipulation bg-gold-500 text-black border border-gold-500 text-[10px] uppercase font-bold tracking-tighter hover:bg-gold-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      </div>

      <div className="bg-[#0F0F0F] border border-[#222]">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-[#888]">
            <thead className="bg-[#0A0A0A] text-[#666] border-b border-[#222]">
              <tr>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest">Serviço</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest">Duração</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest">Preço</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {servicos.map((svc) => (
                editId === svc.id ? (
                  <tr key={svc.id} className="bg-[#111]">
                    <td className="px-6 py-4">
                      <input type="text" placeholder="Nome do Serviço" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#222] text-xs px-2 py-1 text-white focus:border-gold-500 outline-none mb-2" />
                      <input type="text" placeholder="Descrição (ex: Corte clássico)" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#222] text-xs px-2 py-1 text-white focus:border-gold-500 outline-none" />
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" placeholder="Duração (ex: 45 min)" value={formData.duracao} onChange={e => setFormData({...formData, duracao: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#222] text-xs px-2 py-1 text-white focus:border-gold-500 outline-none" />
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" placeholder="Preço (ex: R$ 60)" value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#222] text-xs px-2 py-1 text-white focus:border-gold-500 outline-none mb-2" />
                      <input type="number" placeholder="Preço Numérico (ex: 60)" value={formData.precoNumerico || ''} onChange={e => setFormData({...formData, precoNumerico: Number(e.target.value)})} className="w-full bg-[#0A0A0A] border border-[#222] text-xs px-2 py-1 text-white focus:border-gold-500 outline-none" />
                    </td>
                    <td className="px-6 py-4">
                      <select value={formData.ativo ? 'true' : 'false'} onChange={e => setFormData({...formData, ativo: e.target.value === 'true'})} className="w-full bg-[#0A0A0A] border border-[#222] text-xs px-2 py-1 text-white focus:border-gold-500 outline-none">
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={submitForm} className="text-green-500 hover:text-green-400 font-bold uppercase text-[10px]">Salvar</button>
                        <button onClick={cancelarEdicao} className="text-red-500 hover:text-red-400 font-bold uppercase text-[10px]">Cancelar</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={svc.id} className="hover:bg-[#111] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold uppercase tracking-tight text-white">{svc.nome}</div>
                      <div className="text-[10px] text-[#666] font-mono mt-1">{svc.descricao}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{svc.duracao}</td>
                    <td className="px-6 py-4 font-serif text-white">{svc.preco}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleAtivo(svc.id)} className={`text-[9px] px-2 py-0.5 border font-bold uppercase ${
                        svc.ativo ? 'bg-gold-500/10 text-gold-500 border-gold-500/20' : 'bg-[#222] text-[#888] border-[#333]'
                      }`}>
                        {svc.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {deletarId === svc.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[10px] uppercase text-white mr-2">Tem certeza?</span>
                          <button onClick={() => remover(svc.id)} className="px-2 py-1 bg-red-600 text-white text-[10px] uppercase font-bold">Sim</button>
                          <button onClick={() => setDeletarId(null)} className="px-2 py-1 bg-[#222] text-white text-[10px] uppercase font-bold">Não</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => iniciarEdicao(svc)} className="text-[#666] hover:text-gold-500 transition-colors" title="Editar">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletarId(svc.id)} className="text-[#666] hover:text-red-500 transition-colors" title="Remover">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile */}
        <div className="md:hidden divide-y divide-[#222]">
          {servicos.map(svc => (
            <div key={svc.id} className="p-4 space-y-2">
              {editId === svc.id ? (
                <div className="space-y-3">
                   <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#222] text-xs px-2 py-2 text-white focus:border-gold-500 outline-none" />
                   <input type="text" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full bg-[#0A0A0A] border border-[#222] text-xs px-2 py-2 text-white focus:border-gold-500 outline-none" />
                   <div className="flex gap-2">
                     <input type="text" value={formData.duracao} onChange={e => setFormData({...formData, duracao: e.target.value})} className="w-1/2 bg-[#0A0A0A] border border-[#222] text-xs px-2 py-2 text-white focus:border-gold-500 outline-none" />
                     <input type="text" value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} className="w-1/2 bg-[#0A0A0A] border border-[#222] text-xs px-2 py-2 text-white focus:border-gold-500 outline-none" />
                   </div>
                   <input type="number" value={formData.precoNumerico || ''} onChange={e => setFormData({...formData, precoNumerico: Number(e.target.value)})} className="w-full bg-[#0A0A0A] border border-[#222] text-xs px-2 py-2 text-white focus:border-gold-500 outline-none" />
                   <select value={formData.ativo ? 'true' : 'false'} onChange={e => setFormData({...formData, ativo: e.target.value === 'true'})} className="w-full bg-[#0A0A0A] border border-[#222] text-xs px-2 py-2 text-white focus:border-gold-500 outline-none">
                     <option value="true">Ativo</option>
                     <option value="false">Inativo</option>
                   </select>
                   <div className="flex gap-2 pt-2">
                     <button onClick={submitForm} className="flex-1 min-h-[44px] bg-green-900/20 text-green-500 border border-green-900/40 font-bold uppercase text-[10px] touch-manipulation">Salvar</button>
                     <button onClick={cancelarEdicao} className="flex-1 min-h-[44px] bg-[#222] text-[#888] font-bold uppercase text-[10px] touch-manipulation">Cancelar</button>
                   </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-sm uppercase">{svc.nome}</p>
                      <p className="text-[10px] text-[#555] font-mono mt-0.5">{svc.duracao} · {svc.preco}</p>
                    </div>
                    <button onClick={() => toggleAtivo(svc.id)} className={`text-[9px] px-3 min-h-[44px] flex items-center justify-center border font-bold uppercase touch-manipulation ${
                      svc.ativo ? 'bg-gold-500/10 text-gold-500 border-gold-500/20' : 'bg-[#222] text-[#888] border-[#333]'
                    }`}>
                      {svc.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {deletarId === svc.id ? (
                      <div className="flex flex-col gap-2 w-full">
                        <span className="text-[10px] uppercase text-white font-bold text-center">Tem certeza?</span>
                        <div className="flex gap-2 w-full">
                           <button onClick={() => remover(svc.id)} className="flex-1 min-h-[44px] bg-red-600 text-white text-[10px] uppercase font-bold touch-manipulation">Sim</button>
                           <button onClick={() => setDeletarId(null)} className="flex-1 min-h-[44px] bg-[#222] text-white text-[10px] uppercase font-bold touch-manipulation">Não</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => iniciarEdicao(svc)} className="flex-1 min-h-[44px] border border-[#222] text-[#888] hover:text-white transition-colors flex items-center justify-center touch-manipulation">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletarId(svc.id)} className="flex-1 min-h-[44px] border border-red-900/40 bg-red-900/10 text-red-500 flex items-center justify-center touch-manipulation">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-charcoal-950 border border-[#222] p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-white">Novo Serviço</h2>
              <button onClick={() => setShowForm(false)} className="text-[#666] hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Nome do Serviço</label>
                <input required type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-charcoal-900 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Descrição</label>
                <input type="text" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full bg-charcoal-900 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Duração</label>
                <input required type="text" value={formData.duracao} onChange={e => setFormData({...formData, duracao: e.target.value})} placeholder="ex: 45 min" className="w-full bg-charcoal-900 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Preço (Display)</label>
                  <input required type="text" value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} placeholder="ex: R$ 60" className="w-full bg-charcoal-900 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Preço (Numérico)</label>
                  <input required type="number" value={formData.precoNumerico || ''} onChange={e => setFormData({...formData, precoNumerico: Number(e.target.value)})} placeholder="ex: 60" className="w-full bg-charcoal-900 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Status</label>
                <select required value={formData.ativo ? 'true' : 'false'} onChange={e => setFormData({...formData, ativo: e.target.value === 'true'})} className="w-full bg-charcoal-900 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors">
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
              
              <button type="submit" className="w-full min-h-[44px] touch-manipulation bg-gold-500 text-black font-bold text-sm uppercase tracking-widest py-4 hover:bg-gold-400 transition-colors mt-4">
                Confirmar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
