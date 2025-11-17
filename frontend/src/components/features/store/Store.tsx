import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import * as apiService from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';

interface StoreProps {
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const items = [
  { id: 'extra_card', title: 'Carta extra', description: 'Recibe una carta extra en la mano', cost: 20 },
  { id: 'unlock_theme', title: 'Tema premium', description: 'Desbloquea un tema especial', cost: 50 },
];

interface Purchase {
  id: number;
  item_id: string;
  cost: number;
  created_at?: string;
}

const Store: React.FC<StoreProps> = ({ onClose, showToast }) => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [inventory, setInventory] = useState<Purchase[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    if (!user) return;
    setIsInventoryLoading(true);
    try {
      const response = await apiService.getPurchases();
      setInventory(response.data?.purchases ?? []);
    } catch (error) {
      console.error(error);
      showToast('No se pudo cargar tu inventario', 'error');
    } finally {
      setIsInventoryLoading(false);
    }
  }, [showToast, user]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handlePurchase = async (cost: number, itemId: string) => {
    if (!user) return;
    if ((user.coins || 0) < cost) {
      showToast('No tienes suficientes monedas', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const resp = await apiService.purchaseItem(cost, itemId as any);
      const purchase = resp.data?.purchase;
      const newCoins = resp.data?.coins;
      if (purchase) {
        const purchasedItem = items.find(i => i.id === purchase.item_id);
        const purchasedTitle = purchasedItem ? purchasedItem.title : purchase.item_id;
        showToast(`Compra realizada: ${purchasedTitle}`, 'success');
        if (refreshUser) await refreshUser();
        await fetchInventory();
      } else {
        showToast('Error en la compra', 'error');
      }
    } catch (err) {
      showToast('Error al procesar la compra', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} size="md">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Tienda</h2>
        <p className="text-gray-400 mb-4">Monedas disponibles: <span className="font-bold text-white">{user?.coins ?? 0}</span></p>
        <div className="space-y-3">
          {items.map(it => (
            <div key={it.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
              <div>
                <h3 className="text-white font-bold">{it.title}</h3>
                <p className="text-gray-400 text-sm">{it.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-cyan-300 font-bold">{it.cost} 💎</div>
                <Button onClick={() => handlePurchase(it.cost, it.id)} disabled={isLoading}>
                  Comprar
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-white mb-3">Inventario</h3>
          <div className="bg-slate-900/50 rounded-lg p-4 max-h-60 overflow-y-auto">
            {isInventoryLoading ? (
              <p className="text-gray-400 text-sm">Cargando inventario...</p>
            ) : inventory.length === 0 ? (
              <p className="text-gray-500 text-sm">Aún no has comprado ningún artículo.</p>
            ) : (
              <ul className="space-y-2">
                {inventory.map(purchase => {
                  const matchedItem = items.find(i => i.id === purchase.item_id);
                  const purchaseTitle = matchedItem ? matchedItem.title : purchase.item_id;
                  const purchaseDate = purchase.created_at ? new Date(purchase.created_at).toLocaleString() : '';
                  return (
                    <li key={purchase.id} className="flex items-center justify-between text-sm text-gray-200 border border-slate-700/60 rounded-md px-3 py-2">
                      <div>
                        <p className="font-medium text-white">{purchaseTitle}</p>
                        <p className="text-xs text-gray-400">{purchaseDate}</p>
                      </div>
                      <span className="text-cyan-300 font-semibold">{purchase.cost} 💎</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Modal>
  );
};

export default Store;
