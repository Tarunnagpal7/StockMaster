import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Warehouse, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', location: '', capacity: '' });

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const data = await api.getWarehouses();
            setWarehouses(data);
        } catch (error) {
            console.error('Failed to fetch warehouses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.createWarehouse({
                ...formData,
                capacity: parseInt(formData.capacity)
            });
            setIsModalOpen(false);
            setFormData({ name: '', location: '', capacity: '' });
            fetchWarehouses();
        } catch (error) {
            alert('Failed to create warehouse');
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name', className: 'font-medium' },
        {
            header: 'Location', accessor: 'location', render: (row) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {row.location}
                </div>
            )
        },
        { header: 'Capacity', accessor: 'capacity' },
        {
            header: 'Actions', render: (row) => (
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View Details
                </button>
            )
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
                    <p className="text-gray-500">Manage your storage locations</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Warehouse
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {warehouses.map(warehouse => (
                    <div key={warehouse.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Warehouse className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Active
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{warehouse.name}</h3>
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                            <MapPin className="w-4 h-4 mr-1" />
                            {warehouse.location}
                        </div>
                        <div className="pt-4 border-t flex justify-between items-center">
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Manage
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Warehouse"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Warehouse Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Create Warehouse
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Warehouses;
