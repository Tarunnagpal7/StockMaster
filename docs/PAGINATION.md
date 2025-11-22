# Pagination Implementation Guide

This document describes the pagination implementation for the StockMaster application.

## Overview

Pagination has been implemented across both client and server sides to handle large datasets efficiently. The implementation includes:

- **Server-side pagination**: Reduces data transfer and improves performance
- **Client-side UI**: Beautiful, responsive pagination controls
- **Reusable components**: Easy to integrate into any page

## Server-Side Implementation

### Pagination Utility (`server/utils/pagination.js`)

The pagination utility provides helper functions for consistent pagination across all endpoints.

#### Functions:

1. **`getPaginationParams(query)`**
   - Parses `page` and `limit` from request query
   - Returns: `{ page, limit, skip }`
   - Default: page=1, limit=10
   - Max limit: 100

2. **`createPaginatedResponse(data, totalItems, page, limit)`**
   - Creates standardized paginated response
   - Returns:
     ```javascript
     {
       data: [...],
       pagination: {
         currentPage: 1,
         totalPages: 10,
         totalItems: 100,
         itemsPerPage: 10,
         hasNextPage: true,
         hasPrevPage: false,
         nextPage: 2,
         prevPage: null
       }
     }
     ```

### Usage in Controllers

Example from `productController.js`:

```javascript
const { getPaginationParams, createPaginatedResponse } = require('../utils/pagination');

const getProducts = async (req, res) => {
    const { page, limit, skip } = getPaginationParams(req.query);
    
    // Get total count
    const totalItems = await prisma.product.count({ where });
    
    // Get paginated data
    const products = await prisma.product.findMany({
        where,
        skip,
        take: limit,
        // ... other options
    });
    
    // Return paginated response
    res.json(createPaginatedResponse(products, totalItems, page, limit));
};
```

### API Query Parameters

All paginated endpoints accept:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

Example: `/api/products?page=2&limit=25`

## Client-Side Implementation

### Pagination Component (`client/src/components/Pagination.jsx`)

A beautiful, responsive pagination component with:
- First/Previous/Next/Last navigation buttons
- Page number buttons with ellipsis for large page counts
- Items per page selector
- Result count display
- Mobile-responsive design

#### Props:

```javascript
<Pagination
    currentPage={1}              // Current page number
    totalPages={10}              // Total number of pages
    totalItems={100}             // Total number of items
    itemsPerPage={10}            // Items per page
    onPageChange={(page) => {}}  // Callback when page changes
    onItemsPerPageChange={(limit) => {}} // Callback when limit changes
/>
```

### Usage in Pages

#### Option 1: Using the usePagination Hook (Recommended)

```javascript
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const {
        currentPage,
        itemsPerPage,
        pagination,
        setPagination,
        handlePageChange,
        handleItemsPerPageChange,
        getPaginationParams
    } = usePagination(1, 10); // initial page and items per page

    const fetchProducts = async () => {
        const params = {
            ...getPaginationParams(),
            // ... other filters
        };
        const response = await api.getProducts(params);
        setProducts(response.data);
        setPagination(response.pagination);
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage, itemsPerPage]);

    return (
        <div>
            <Table data={products} />
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
    );
};
```

#### Option 2: Manual State Management

```javascript
import Pagination from '../../components/Pagination';

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pagination, setPagination] = useState(null);

    const fetchProducts = async () => {
        const params = {
            page: currentPage,
            limit: itemsPerPage,
            // ... other filters
        };
        const response = await api.getProducts(params);
        setProducts(response.data);
        setPagination(response.pagination);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newLimit) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1); // Reset to first page
    };

    return (
        <div>
            <Table data={products} />
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
    );
};
```

### usePagination Hook

The `usePagination` hook simplifies pagination state management:

#### API:

```javascript
const {
    currentPage,              // Current page number
    itemsPerPage,            // Items per page
    pagination,              // Pagination metadata from server
    setPagination,           // Set pagination metadata
    handlePageChange,        // Handler for page changes
    handleItemsPerPageChange, // Handler for items per page changes
    resetPagination,         // Reset to initial state
    getPaginationParams      // Get { page, limit } for API calls
} = usePagination(initialPage, initialItemsPerPage);
```

## Paginated Endpoints

The following endpoints now support pagination:

### Products
- **GET** `/api/products`
- Query params: `page`, `limit`, `search`, `category`, `activeOnly`

### Transactions
- **GET** `/api/transactions`
- Query params: `page`, `limit`, `type`, `status`

## Adding Pagination to New Endpoints

### Server-Side Steps:

1. Import pagination utilities:
   ```javascript
   const { getPaginationParams, createPaginatedResponse } = require('../utils/pagination');
   ```

2. Get pagination params:
   ```javascript
   const { page, limit, skip } = getPaginationParams(req.query);
   ```

3. Count total items:
   ```javascript
   const totalItems = await prisma.model.count({ where });
   ```

4. Apply pagination to query:
   ```javascript
   const items = await prisma.model.findMany({
       where,
       skip,
       take: limit
   });
   ```

5. Return paginated response:
   ```javascript
   res.json(createPaginatedResponse(items, totalItems, page, limit));
   ```

### Client-Side Steps:

1. Add state variables:
   ```javascript
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(10);
   const [pagination, setPagination] = useState(null);
   ```

2. Update fetch function:
   ```javascript
   const params = { page: currentPage, limit: itemsPerPage };
   const response = await api.getItems(params);
   setItems(response.data);
   setPagination(response.pagination);
   ```

3. Add pagination handlers:
   ```javascript
   const handlePageChange = (page) => setCurrentPage(page);
   const handleItemsPerPageChange = (limit) => {
       setItemsPerPage(limit);
       setCurrentPage(1);
   };
   ```

4. Render Pagination component:
   ```javascript
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
   ```

## Design Features

The pagination UI includes:
- **Modern aesthetics**: Clean, professional design with smooth transitions
- **Responsive**: Works on mobile, tablet, and desktop
- **Accessible**: Keyboard navigation and proper ARIA labels
- **Smart page numbers**: Shows ellipsis for large page counts
- **Flexible**: Customizable items per page (5, 10, 25, 50, 100)
- **Informative**: Shows current range and total count

## Performance Considerations

- Server-side pagination reduces payload size
- Database queries use `skip` and `take` for efficient data retrieval
- Total count is cached per query to avoid redundant counts
- Client-side debouncing prevents excessive API calls during filtering

## Future Enhancements

Potential improvements:
- Cursor-based pagination for very large datasets
- Virtual scrolling for infinite scroll UX
- Cache pagination results on client
- Server-side caching with Redis
- GraphQL pagination support
