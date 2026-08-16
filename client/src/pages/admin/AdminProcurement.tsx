import React from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, ShoppingBag, User, CheckCircle2, ImagePlus, X } from "lucide-react";

export default function AdminProcurement() {
  const { data: allOrders, isLoading } = (trpc as any).adminProcurement?.list?.useQuery?.() || { data: [], isLoading: false };
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({});
  const [shippedOrders, setShippedOrders] = React.useState<Record<string, { trackingNo: string, image: string, company: string }>>({});

  const [shippingModalOpen, setShippingModalOpen] = React.useState(false);
  const [activeOrderId, setActiveOrderId] = React.useState<string | null>(null);
  const [trackingInput, setTrackingInput] = React.useState("");
  const [shippingCompanyInput, setShippingCompanyInput] = React.useState("");
  const [shippingImgInput, setShippingImgInput] = React.useState("");

  const orders = allOrders || [];

  const toggleCheck = (orderId: string, itemIndex: number) => {
    const key = `${orderId}-${itemIndex}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleShip = (orderId: string) => {
    setActiveOrderId(orderId);
    setTrackingInput("");
    setShippingCompanyInput("");
    setShippingImgInput("");
    setShippingModalOpen(true);
  };

  const confirmShipment = () => {
    if (!shippingCompanyInput) {
      alert("请输入物流公司名称！");
      return;
    }
    if (!trackingInput) {
      alert("请输入运单号！");
      return;
    }
    if (!shippingImgInput) {
      alert("请提供发货证明图片！");
      return;
    }
    if (activeOrderId) {
      setShippedOrders(prev => ({
        ...prev,
        [activeOrderId]: { trackingNo: trackingInput, image: shippingImgInput, company: shippingCompanyInput }
      }));
      setShippingModalOpen(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShippingImgInput(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div id="print-section">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">按单采购清单</h1>
          <p className="text-stone-500 mt-1">按顾客订单分组，方便采买后直接对单分装配货。</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handlePrint} className="bg-stone-900 text-white hover:bg-stone-800">
            <Printer className="w-4 h-4 mr-2" /> 打印拣货单
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-stone-500">加载中...</div>
      ) : orders?.length === 0 ? (
        <div className="text-center py-12 text-stone-500">当前没有需要采购的订单</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders?.map((order: any) => (
            <Card key={order.orderId} className="bg-white border-stone-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 bg-stone-50 border-b border-stone-200 flex justify-between items-start">
                <div>
                  <div className="font-bold text-stone-800 flex items-center">
                    <User className="w-4 h-4 mr-2 text-stone-400" />
                    {order.customerName}
                  </div>
                  <div className="text-xs text-stone-500 mt-1 ml-6">{order.phone}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm font-mono text-stone-500 bg-white px-2 py-1 rounded border border-stone-200">
                    {order.orderId}
                  </div>
                  {shippedOrders[order.orderId] && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-stone-100 rounded border border-stone-200 overflow-hidden">
                        <img src={shippedOrders[order.orderId].image} alt="Proof" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded flex flex-col items-end">
                        <span>已发货: {shippedOrders[order.orderId].trackingNo}</span>
                        <span className="opacity-80 text-[10px]">{shippedOrders[order.orderId].company}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-0 flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2 font-medium w-16">图片</th>
                      <th className="px-4 py-2 font-medium">商品名称</th>
                      <th className="px-4 py-2 font-medium text-right w-24">采买数量</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item: any, index: number) => {
                      const isChecked = checkedItems[`${order.orderId}-${index}`];
                      return (
                        <tr 
                          key={index} 
                          className={`hover:bg-stone-50 cursor-pointer transition-colors ${isChecked ? 'bg-emerald-50/50 opacity-50' : ''}`}
                          onClick={() => toggleCheck(order.orderId, index)}
                        >
                          <td className="px-4 py-3">
                            <div className="relative w-10 h-10 rounded bg-stone-100 overflow-hidden border border-stone-200">
                              {item.mainImage ? (
                                <img src={item.mainImage} alt={item.productName} className={`w-full h-full object-cover ${isChecked ? 'grayscale' : ''}`} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">无图</div>
                              )}
                              {isChecked && (
                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className={`px-4 py-3 font-medium text-stone-700 ${isChecked ? 'line-through text-stone-400' : ''}`}>
                            {item.productName}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-flex items-center justify-center min-w-[2rem] h-6 px-2 font-bold rounded-md ${isChecked ? 'bg-stone-200 text-stone-500 line-through' : 'bg-matcha-100 text-matcha-700'}`}>
                              {item.quantity} {item.unit}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
                <div className="text-xs text-stone-500">
                  <div className="mb-1">
                    <ShoppingBag className="w-3 h-3 inline mr-1" />
                    共 {order?.items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0} 件商品
                  </div>
                  <div className="font-bold text-stone-700">
                    订单金额: {order?.totalAmount || "RM " + ((order?.items || []).reduce((sum: number, item: any) => sum + ((item.quantity || 0) * 45), 0).toFixed(2))}
                  </div>
                </div>
                {!shippedOrders[order.orderId] ? (
                  <Button 
                    size="sm" 
                    className="bg-matcha-600 hover:bg-matcha-700 text-white shadow-sm"
                    onClick={() => handleShip(order.orderId)}
                  >
                    全部配齐，发货至中转仓
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled className="text-emerald-600 border-emerald-200 bg-emerald-50">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> 已发货
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      </div>
      
      {/* Shipping Modal */}
      {shippingModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-stone-100">
              <h3 className="font-bold text-lg text-stone-800">确认发货至中转仓</h3>
              <p className="text-stone-500 text-sm mt-1">请输入运单号并上传发货包裹照片作为凭证。</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">物流公司名称 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full border border-stone-300 rounded-md px-3 py-2 outline-none focus:border-matcha-500" 
                  placeholder="例如: J&T, Flash Express"
                  value={shippingCompanyInput}
                  onChange={(e) => setShippingCompanyInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">本地运单号 (Tracking No) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full border border-stone-300 rounded-md px-3 py-2 outline-none focus:border-matcha-500" 
                  placeholder="例如: TH1234567890"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">发货凭证图片 <span className="text-red-500">*</span></label>
                {shippingImgInput ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-stone-200 group">
                    <img src={shippingImgInput} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setShippingImgInput("")}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="relative w-full h-32 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-500 hover:border-matcha-300 hover:bg-matcha-50 hover:text-matcha-600 transition-colors cursor-pointer">
                    <ImagePlus className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">点击上传物流单照片</span>
                    <input type="file" accept="image/*" className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>
            <div className="p-4 bg-stone-50 flex justify-end gap-3 border-t border-stone-100">
              <Button variant="outline" onClick={() => setShippingModalOpen(false)}>取消</Button>
              <Button className="bg-matcha-600 text-white hover:bg-matcha-700" onClick={confirmShipment}>确认发货</Button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
          button, .print\\:hidden { display: none !important; }
          .grid { display: block !important; }
          .grid > div { page-break-inside: avoid; margin-bottom: 20px; border: 1px solid #e2e8f0; }
        }
      `}} />
    </AdminLayout>
  );
}
