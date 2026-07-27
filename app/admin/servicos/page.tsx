"use client";

import { useState, useEffect } from "react";
import { Servico } from "@/lib/types";
import { getServicos, salvarServicos } from "@/lib/store";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";

export default function ServicosAdmin() {
  const [mounted, setMounted] = useState(false);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Servico>>({});
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setMounted(true);
    setServicos(getServicos());
  }, []);

  const handleSave = () => {
    if (isEditing) {
      const updated = servicos.map(s => s.id === isEditing ? { ...s, ...editForm } as Servico : s);
      setServicos(updated);
      salvarServicos(updated);
      setIsEditing(null);
    } else {
      const newServico: Servico = {
        id: Date.now(),
        nome: editForm.nome || '',
        descricao: editForm.descricao || '',
        duracao: editForm.duracao || '',
        preco: editForm.preco || '',
        precoNumerico: editForm.precoNumerico || 0,
        ativo: editForm.ativo !== false
      };
      const updated = [...servicos, newServico];
      setServicos(updated);
      salvarServicos(updated);
      setIsAdding(false);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      const updated = servicos.filter(s => s.id !== id);
      setServicos(updated);
      salvarServicos(updated);
    }
  };

  const toggleAtivo = (id: number) => {
    const updated = servicos.map(s => s.id === id ? { ...s, ativo: !s.ativo } : s);
    setServicos(updated);
    salvarServicos(updated);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-wider mb-2">Serviços</h1>
          <p className="text-slate-400">Gerencie os serviços oferecidos na barbearia.</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(true);
            setEditForm({ ativo: true });
            setIsEditing(null);
          }}
          className="bg-gold-500 text-black font-bold uppercase tracking-wider text-xs px-6 py-3 hover:bg-gold-400 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-[#111] border border-gold-500/30 p-6">
          <h2 className="text-white font-serif text-xl mb-4">{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs uppercase text-slate-500 mb-1">Nome</label>
              <input 
                type="text"
                value={editForm.nome || ''}
                onChange={e => setEditForm({...editForm, nome: e.target.value})}
                className="w-full bg-[#222] border border-[#333] text-white p-2 focus:border-gold-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-500 mb-1">Preço (Texto - Ex: R$ 50)</label>
              <input 
                type="text"
                value={editForm.preco || ''}
                onChange={e => setEditForm({...editForm, preco: e.target.value})}
                className="w-full bg-[#222] border border-[#333] text-white p-2 focus:border-gold-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-500 mb-1">Preço (Numérico - Ex: 50)</label>
              <input 
                type="number"
                value={editForm.precoNumerico || ''}
                onChange={e => setEditForm({...editForm, precoNumerico: Number(e.target.value)})}
                className="w-full bg-[#222] border border-[#333] text-white p-2 focus:border-gold-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-500 mb-1">Duração (Ex: 45 min)</label>
              <input 
                type="text"
                value={editForm.duracao || ''}
                onChange={e => setEditForm({...editForm, duracao: e.target.value})}
                className="w-full bg-[#222] border border-[#333] text-white p-2 focus:border-gold-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase text-slate-500 mb-1">Descrição</label>
              <input 
                type="text"
                value={editForm.descricao || ''}
                onChange={e => setEditForm({...editForm, descricao: e.target.value})}
                className="w-full bg-[#222] border border-[#333] text-white p-2 focus:border-gold-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button 
              onClick={() => { setIsAdding(false); setIsEditing(null); }}
              className="text-slate-400 hover:text-white px-4 py-2 uppercase text-xs font-bold"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="bg-gold-500 text-black px-6 py-2 uppercase text-xs font-bold hover:bg-gold-400"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicos.map(servico => (
          <div key={servico.id} className={`p-6 border ${servico.ativo ? 'border-[#333] bg-[#111]' : 'border-red-900/30 bg-[#1a0f0f] opacity-75'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-serif text-white">{servico.nome}</h3>
                <p className="text-gold-500 font-bold">{servico.preco}</p>
              </div>
              <button 
                onClick={() => toggleAtivo(servico.id)}
                className={`text-[10px] uppercase font-bold px-2 py-1 border ${servico.ativo ? 'text-green-500 border-green-500/30' : 'text-red-400 border-red-400/30'}`}
              >
                {servico.ativo ? 'Ativo' : 'Inativo'}
              </button>
            </div>
            
            <div className="space-y-1 mb-6 text-sm">
              <p className="text-slate-400">{servico.descricao}</p>
              <p className="text-slate-500">Duração: {servico.duracao}</p>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#222] pt-4 mt-auto">
              <button 
                onClick={() => {
                  setIsEditing(servico.id);
                  setEditForm(servico);
                  setIsAdding(false);
                }}
                className="text-slate-400 hover:text-white p-2"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(servico.id)}
                className="text-red-500/50 hover:text-red-400 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
