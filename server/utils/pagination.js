/**
 * Pagination utility for server-side pagination
 * Provides consistent pagination across all endpoints
 */

/**
 * Parse pagination parameters from request query
 * @param {Object} query - Express request query object
 * @returns {Object} Pagination parameters
 */
const getPaginationParams = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

/**
 * Create pagination metadata
 * @param {number} totalItems - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const createPaginationMeta = (totalItems, page, limit) => {
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
    };
};

/**
 * Create paginated response
 * @param {Array} data - Array of items for current page
 * @param {number} totalItems - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated response object
 */
const createPaginatedResponse = (data, totalItems, page, limit) => {
    return {
        data,
        pagination: createPaginationMeta(totalItems, page, limit)
    };
};

module.exports = {
    getPaginationParams,
    createPaginationMeta,
    createPaginatedResponse
};
