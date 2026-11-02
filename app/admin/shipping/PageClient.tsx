'use client';

import { useState, useEffect } from 'react';
import { useOrders, useDispatchOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/Button';
import ShippingLabelModal from './components/ShippingLabelModal';
import TrackingSidePanel from './components/TrackingSidePanel';
import { X, Search } from 'lucide-react';

export default function ShippingDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: ordersData, isLoading } = useOrders({ search: debouncedSearchQuery });
  const orders = ordersData?.data || [];
  const dispatchOrder = useDispatchOrder();
  
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  // Modal State
  const [previewOrderIds, setPreviewOrderIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tracking Panel State
  const [isTrackingPanelOpen, setIsTrackingPanelOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<any>(null);

  const openTrackingPanel = (order: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTrackingOrder(order);
    setIsTrackingPanelOpen(true);
  };

  // Dispatch Weight Modal State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchOrderId, setDispatchOrderId] = useState<string | null>(null);
  const [dispatchWeight, setDispatchWeight] = useState<number>(1.0);

  const openDispatchModal = (orderId: string) => {
    setDispatchOrderId(orderId);
    setDispatchWeight(1.0); // Reset to default base rate weight
    setDispatchModalOpen(true);
  };

  const handleConfirmDispatch = () => {
    if (dispatchOrderId) {
      dispatchOrder.mutate(
        { orderId: dispatchOrderId, weightKg: dispatchWeight },
        {
          onSuccess: () => {
            setDispatchModalOpen(false);
            setDispatchOrderId(null);
          },
          onError: (error: any) => {
            alert(error.response?.data?.error || error.message || "Failed to dispatch order.");
            setDispatchModalOpen(false);
            setDispatchOrderId(null);
          }
        }
      );
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Select all dispatched/tracked orders
      const dispatchableIds = orders
        .filter((o: any) => o.status === 'DISPATCHED' || !!o.trackingNumber)
        .map((o: any) => o.id);
      setSelectedOrderIds(dispatchableIds);
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, orderId]);
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Courier Shipments</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID, Phone, Tracking #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 border border-border rounded-lg text-sm bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {selectedOrderIds.length > 0 && (
            <Button onClick={() => {
              setPreviewOrderIds(selectedOrderIds);
              setIsModalOpen(true);
            }}>
              Print Selected Labels ({selectedOrderIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#FF003A] text-white rounded-xl p-5 shadow-sm relative overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">Success Rate (Today)</p>
          <p className="text-4xl font-bold">{(orders.filter((o:any) => o.status === 'DELIVERED').length / (orders.length || 1) * 100).toFixed(1)}%</p>
          <div className="mt-4 text-xs opacity-90">
            {orders.filter((o:any) => o.status === 'DELIVERED').length} delivered of {orders.length} in period
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface/20">
            <div className="h-full bg-surface/50" style={{ width: `${(orders.filter((o:any) => o.status === 'DELIVERED').length / (orders.length || 1) * 100)}%` }} />
          </div>
        </div>
        
        <div className="bg-[#FFF4E5] text-[#D84B16] rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2">Return Rate (Today)</p>
          <p className="text-4xl font-bold">{(orders.filter((o:any) => o.status === 'RETURNED').length / (orders.length || 1) * 100).toFixed(1)}%</p>
          <div className="mt-4 text-xs flex items-center gap-1 bg-[#FDE8D7] w-max px-2 py-1 rounded">
            <span>↺</span> {orders.filter((o:any) => o.status === 'RETURNED').length} Returned
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-primary">Dispatched</p>
            <p className="text-4xl font-bold text-foreground">{orders.filter((o:any) => o.status === 'DISPATCHED' || o.trackingNumber).length}</p>
          </div>
          <div className="flex gap-2 mt-4 text-[10px] font-semibold text-primary">
            <span className="bg-primary/10 px-2 py-1 rounded">Picked Up: {orders.filter((o:any) => o.status === 'PICKED_UP').length}</span>
            <span className="bg-primary/10 px-2 py-1 rounded">In Transit: {orders.filter((o:any) => o.status === 'IN_TRANSIT').length}</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted">Total Shipments</p>
          <p className="text-4xl font-bold text-foreground">{orders.length}</p>
          <div className="flex gap-2 mt-4 text-[10px] font-semibold">
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">✓ {orders.filter((o:any) => o.status === 'DELIVERED').length} Delivered</span>
            <span className="bg-muted/20 text-muted px-2 py-1 rounded">✕ {orders.filter((o:any) => o.status === 'CANCELLED').length} Cancelled</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">Status Breakdown</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Pending Approval', status: 'PENDING', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
            { label: 'Processing', status: 'PROCESSING', color: 'bg-muted/20 text-muted' },
            { label: 'Pending Pickup', status: 'DISPATCHED', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
            { label: 'Picked Up', status: 'PICKED_UP', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
            { label: 'In Transit', status: 'IN_TRANSIT', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
            { label: 'Out for Del.', status: 'OUT_FOR_DELIVERY', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
            { label: 'Delivered', status: 'DELIVERED', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
            { label: 'Returned', status: 'RETURNED', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
            { label: 'Cancelled', status: 'CANCELLED', color: 'bg-muted/20 text-muted' },
          ].map(stat => (
            <div key={stat.label} className={`flex items-center gap-3 p-3 rounded-xl border border-border ${stat.color}`}>
              <div className="text-lg font-bold">{orders.filter((o:any) => o.status === stat.status).length}</div>
              <div className="text-xs font-semibold leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-muted text-sm font-inter">Loading orders...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-subtle border-b border-border">
              <tr>
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Courier Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order: any) => {
                const isDispatched = order.status === 'DISPATCHED' || !!order.trackingNumber;

                return (
                  <tr 
                    key={order.id} 
                    className={`border-t cursor-pointer hover:bg-surface-elevated transition-colors ${selectedOrderIds.includes(order.id) ? 'bg-primary/5' : ''}`}
                    onClick={() => openTrackingPanel(order)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      {isDispatched && (
                        <input 
                          type="checkbox" 
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      )}
                    </td>
                    <td className="p-4 font-mono text-xs font-bold text-foreground">{order.orderNumber}</td>
                    <td className="p-4">
                      <div className="font-inter text-xs font-normal text-foreground">
                        {order.customer 
                          ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}` 
                          : order.shippingAddress?.firstName 
                            ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                            : 'Guest'}
                      </div>
                      <div className="text-[11px] font-light text-muted italic">
                        {order.customer?.phone || order.shippingAddress?.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs font-black text-foreground">Rs. {order.total.toFixed(2)}</td>
                    <td className="p-4">
                      {isDispatched ? (
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-blue-500">{order.status}</span>
                          <div className="text-[11px] font-mono font-light text-muted mt-0.5">{order.trackingNumber}</div>
                        </div>
                      ) : (
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-500">{order.status}</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      {!isDispatched ? (
                        <Button size="sm" onClick={() => openDispatchModal(order.id)} isLoading={dispatchOrder.isPending && dispatchOrderId === order.id}>
                          Dispatch & Create Label
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={(e) => openTrackingPanel(order, e)}
                            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                          >
                            Track
                          </button>
                          {order.trackingNumber && (
                            <button 
                              onClick={() => {
                                setPreviewOrderIds([order.id]);
                                setIsModalOpen(true);
                              }}
                              className="text-sm text-blue-600 hover:underline inline-block font-medium"
                            >
                              View Label
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {orders?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Dispatch Weight Modal */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface rounded-xl shadow-xl overflow-hidden border border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">Enter Actual Package Weight</h3>
              <button onClick={() => setDispatchModalOpen(false)} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted mb-4">
                Please enter the exact packed weight of this order (including the box). Fardar will use this to calculate your courier fee.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Weight (KG)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={dispatchWeight}
                  onChange={(e) => setDispatchWeight(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setDispatchModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmDispatch} isLoading={dispatchOrder.isPending}>
                  Confirm Dispatch
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ShippingLabelModal 
        orderIds={previewOrderIds}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <TrackingSidePanel
        order={trackingOrder}
        isOpen={isTrackingPanelOpen}
        onClose={() => setIsTrackingPanelOpen(false)}
      />
    </div>
  );
}
