import { useState, useCallback } from 'react';

/**
 * Custom hook for managing pagination state
 * @param {number} initialPage - Initial page number (default: 1)
 * @param {number} initialItemsPerPage - Initial items per page (default: 10)
 * @returns {Object} Pagination state and handlers
 */
export const usePagination = (initialPage = 1, initialItemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
    const [pagination, setPagination] = useState(null);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    }, []);

    const resetPagination = useCallback(() => {
        setCurrentPage(1);
        setPagination(null);
    }, []);

    const getPaginationParams = useCallback(() => {
        return {
            page: currentPage,
            limit: itemsPerPage
        };
    }, [currentPage, itemsPerPage]);

    return {
        currentPage,
        itemsPerPage,
        pagination,
        setPagination,
        handlePageChange,
        handleItemsPerPageChange,
        resetPagination,
        getPaginationParams
    };
};

export default usePagination;
