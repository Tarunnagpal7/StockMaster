import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import { useNavigate } from 'react-router-dom';

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [activeOnly, setActiveOnly] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pagination, setPagination] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, category, activeOnly, currentPage, itemsPerPage]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                category,
                activeOnly,
                page: currentPage,
                limit: itemsPerPage
            };
            const response = await api.getProducts(params);
            setProducts(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
        try {
            await api.deleteProduct(id);
            fetchProducts();
        } catch (error) {
            alert(error.message || 'Failed to delete product');
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await api.updateProduct(id, { isActive: !currentStatus });
            fetchProducts();
        } catch (error) {
            alert('Failed to update product status');
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name', className: 'font-medium text-gray-900' },
        { header: 'SKU', accessor: 'sku' },
        { header: 'Category', accessor: 'category' },
        { header: 'Price', accessor: 'price', render: (row) => `$${row.price?.toFixed(2)}` },
        {
            header: 'Total Stock', accessor: 'totalStock', render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.totalStock <= row.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {row.totalStock} {row.uom}
                </span>
            )
        },
        {
            header: 'Status', accessor: 'isActive', render: (row) => (
                <span className={`badge ${row.isActive ? 'badge-success' : 'badge-neutral'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Actions', render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleToggleActive(row.id, row.isActive); }}
                        className={`p-1 rounded ${row.isActive ? 'hover:bg-yellow-50' : 'hover:bg-green-50'}`}
                        title={row.isActive ? 'Deactivate' : 'Activate'}
                    >
                        <Eye className={`w-4 h-4 ${row.isActive ? 'text-yellow-600' : 'text-gray-400'}`} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/products/${row.id}/edit`); }} className="p-1 hover:bg-gray-100 rounded" title="Edit">
                        <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-1 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            )
        }
    ];

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Extract unique categories for filter
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500">Manage your inventory items</p>
                </div>
                <Button onClick={() => navigate('/products/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </div>

            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        className="pl-10 input w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        className="input py-2"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={activeOnly}
                        onChange={(e) => setActiveOnly(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Active Only
                </label>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <Table
                    columns={columns}
                    data={products}
                    isLoading={loading}
                    onRowClick={(row) => navigate(`/products/${row.id}`)}
                />

                {pagination && (
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        itemsPerPage={pagination.itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                )}
            </div>
        </div>
    );
};

export default ProductsList;
