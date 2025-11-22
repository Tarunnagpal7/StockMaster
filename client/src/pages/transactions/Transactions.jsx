import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Search, Filter, ArrowRight, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, RefreshCw, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';

const Transactions = ({ typeFilter }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pagination, setPagination] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTransactions();
    }, [typeFilter, currentPage, itemsPerPage]);

    const fetchTransactions = async () => {
        try {
            const params = {
                type: typeFilter,
                page: currentPage,
                limit: itemsPerPage
            };
            const response = await api.getTransactions(params);
            setTransactions(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async (id) => {
        try {
            await api.validateTransaction(id);
            fetchTransactions();
        } catch (error) {
            alert('Validation failed');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            DRAFT: "bg-gray-100 text-gray-800",
            COMPLETED: "bg-green-100 text-green-800",
            CANCELLED: "bg-red-100 text-red-800"
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'IN': return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
            case 'OUT': return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
            case 'TRANSFER': return <ArrowRightLeft className="w-4 h-4 text-purple-600" />;
            case 'ADJUST': return <RefreshCw className="w-4 h-4 text-orange-600" />;
            default: return null;
        }
    };

    const columns = [
        {
            header: 'Type', accessor: 'type', render: (row) => (
                <div className="flex items-center gap-2">
                    {getTypeIcon(row.type)}
                    <span className="font-medium">{row.type}</span>
                </div>
            )
        },
        { header: 'Reference', accessor: 'reference', render: (row) => row.reference || '-' },
        { header: 'Date', accessor: 'date', render: (row) => format(new Date(row.date), 'MMM d, yyyy') },
        { header: 'Status', accessor: 'status', render: (row) => getStatusBadge(row.status) },
        {
            header: 'Actions', render: (row) => (
                row.status === 'DRAFT' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleValidate(row.id); }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Validate
                    </button>
                )
            )
        }
    ];

    const getPageTitle = () => {
        switch (typeFilter) {
            case 'IN': return 'Receipts';
            case 'OUT': return 'Deliveries';
            case 'TRANSFER': return 'Transfers';
            case 'ADJUST': return 'Adjustments';
            default: return 'All Transactions';
        }
    };

    const getNewLink = () => {
        switch (typeFilter) {
            case 'IN': return '/operations/receipts/new';
            case 'OUT': return '/operations/deliveries/new';
            case 'TRANSFER': return '/operations/transfers/new';
            case 'ADJUST': return '/operations/adjustments/new';
            default: return '/transactions/new';
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
                    <p className="text-gray-500">Manage your stock movements</p>
                </div>
                <Button onClick={() => navigate(getNewLink())}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Transaction
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                <Table columns={columns} data={transactions} isLoading={loading} />

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

export default Transactions;
