import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { ArrowLeft, Plus, Trash2, Package, Warehouse, FileText, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const AdjustmentForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
    const [formData, setFormData] = useState({
        reference: '',
        targetWarehouseId: '',
        adjustmentType: 'ADD',
        notes: ''
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [p, w] = await Promise.all([api.getProducts(), api.getWarehouses()]);
                setProducts(p);
                setWarehouses(w);
            } catch (error) {
                console.error('Failed to load data', error);
            }
        };
        loadData();
    }, []);

    const handleAddItem = () => {
        setItems([...items, { productId: '', quantity: 1 }]);
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createTransaction({
                type: 'ADJUST',
                ...formData,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: parseInt(item.quantity)
                }))
            });
            navigate('/operations/adjustments');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const isAddType = formData.adjustmentType === 'ADD';
    const typeColor = isAddType ? 'emerald' : 'rose';
    const TypeIcon = isAddType ? TrendingUp : TrendingDown;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="group mb-4 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md group-hover:bg-slate-50 transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">Back</span>
                    </button>

                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <Package className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-1">Stock Adjustment</h1>
                                <p className="text-blue-100 text-sm">Manage inventory levels with precision</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Adjustment Details Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 overflow-hidden transition-all hover:shadow-xl">
                        <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 py-4 border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-600" />
                                Adjustment Details
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Adjustment Type & Warehouse */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Adjustment Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Adjustment Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, adjustmentType: 'ADD' })}
                                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${isAddType
                                                ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`p-2 rounded-lg ${isAddType ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    <TrendingUp className="w-5 h-5" />
                                                </div>
                                                <span className={`text-sm font-semibold ${isAddType ? 'text-emerald-700' : 'text-slate-600'
                                                    }`}>
                                                    Add Stock
                                                </span>
                                            </div>
                                            {isAddType && (
                                                <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, adjustmentType: 'REMOVE' })}
                                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${!isAddType
                                                ? 'border-rose-500 bg-rose-50 shadow-md shadow-rose-100'
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`p-2 rounded-lg ${!isAddType ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    <TrendingDown className="w-5 h-5" />
                                                </div>
                                                <span className={`text-sm font-semibold ${!isAddType ? 'text-rose-700' : 'text-slate-600'
                                                    }`}>
                                                    Remove Stock
                                                </span>
                                            </div>
                                            {!isAddType && (
                                                <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Warehouse */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        <Warehouse className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                                        Warehouse Location
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full pl-4 pr-10 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all appearance-none cursor-pointer hover:border-slate-300"
                                            value={formData.targetWarehouseId}
                                            onChange={(e) => setFormData({ ...formData, targetWarehouseId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Warehouse</option>
                                            {warehouses.map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    <AlertCircle className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                                    Reason / Notes
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Explain why this adjustment is being made..."
                                    rows="3"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Card */}
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 overflow-hidden transition-all hover:shadow-xl">
                        <div className={`bg-gradient-to-r ${isAddType
                            ? 'from-emerald-50 to-emerald-100/50'
                            : 'from-rose-50 to-rose-100/50'
                            } px-6 py-4 border-b ${isAddType ? 'border-emerald-200' : 'border-rose-200'
                            }`}>
                            <div className="flex items-center justify-between">
                                <h2 className={`text-lg font-semibold flex items-center gap-2 ${isAddType ? 'text-emerald-800' : 'text-rose-800'
                                    }`}>
                                    <TypeIcon className="w-5 h-5" />
                                    Products to {isAddType ? 'Add' : 'Remove'}
                                </h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isAddType
                                    ? 'bg-emerald-200 text-emerald-800'
                                    : 'bg-rose-200 text-rose-800'
                                    }`}>
                                    {items.length} {items.length === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`group relative bg-gradient-to-br ${isAddType
                                            ? 'from-emerald-50/50 to-white'
                                            : 'from-rose-50/50 to-white'
                                            } border-2 ${isAddType ? 'border-emerald-100' : 'border-rose-100'
                                            } rounded-xl p-5 transition-all hover:shadow-md hover:scale-[1.01]`}
                                    >
                                        <div className="flex gap-4 items-end">
                                            {/* Item Number Badge */}
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${isAddType
                                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                                                : 'bg-gradient-to-br from-rose-500 to-rose-600'
                                                } text-white font-bold flex items-center justify-center shadow-md`}>
                                                {index + 1}
                                            </div>

                                            {/* Product Select */}
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                                                    Product
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        className="w-full pl-4 pr-10 py-2.5 bg-white border-2 border-slate-200 rounded-lg text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all appearance-none cursor-pointer hover:border-slate-300"
                                                        value={item.productId}
                                                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select Product</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name} ({p.sku})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <Package className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quantity Input */}
                                            <div className="w-36">
                                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className={`w-full px-4 py-2.5 bg-white border-2 ${isAddType ? 'border-emerald-200' : 'border-rose-200'
                                                        } rounded-lg text-slate-900 font-bold text-center focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all`}
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                disabled={items.length === 1}
                                                className={`flex-shrink-0 p-2.5 rounded-lg transition-all ${items.length === 1
                                                    ? 'text-slate-300 cursor-not-allowed'
                                                    : 'text-rose-500 hover:bg-rose-100 hover:text-rose-600 active:scale-95'
                                                    }`}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Item Button */}
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className={`mt-4 w-full py-3 px-4 border-2 border-dashed ${isAddType
                                    ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400'
                                    : 'border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400'
                                    } rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group`}
                            >
                                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Add Another Product
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 text-base"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={loading}
                            className={`px-8 py-3 text-base shadow-lg ${isAddType
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                                : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800'
                                }`}
                        >
                            {isAddType ? 'Add Stock' : 'Remove Stock'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdjustmentForm;
