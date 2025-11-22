import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Users as UsersIcon, Shield, Edit } from 'lucide-react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { useAuth } from '../../hooks/useAuth';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [role, setRole] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (e) => {
        e.preventDefault();
        try {
            await api.updateUser(editingUser.id, { role });
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            alert('Failed to update role');
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name', className: 'font-medium' },
        { header: 'Email', accessor: 'email' },
        {
            header: 'Role', accessor: 'role', render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.role === 'MANAGER' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {row.role}
                </span>
            )
        },
        ...(user?.role !== 'STAFF' ? [{
            header: 'Actions', render: (row) => (
                <button
                    onClick={() => { setEditingUser(row); setRole(row.role); }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    Edit Role
                </button>
            )
        }] : [])
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-500">Manage system access and roles</p>
                </div>
            </div>

            <Table columns={columns} data={users} isLoading={loading} />

            <Modal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                title="Edit User Role"
            >
                <form onSubmit={handleUpdateRole} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                        <select
                            className="input w-full"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="STAFF">STAFF</option>
                            <option value="MANAGER">MANAGER</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Update Role
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Users;
