# **Sample Product Search API with MySQL, Elasticsearch, and Redis**

This project is a backend service designed to handle product creation, full-text search across product data, and optimized caching of frequent queries. The service demonstrates senior-level engineering skills in architecture, design patterns, scalability, and performance optimization. It combines the use of **MySQL**, **Elasticsearch**, and **Redis** to build a highly performant, scalable product search system.

## **Table of Contents**
1. [Project Overview](#project-overview)
2. [Architecture and Design Patterns](#architecture-and-design-patterns)
3. [Project Structure](#project-structure)
4. [Installation](#installation)
5. [API Usage](#api-usage)

---

## **Project Overview**

The primary objective of this project is to provide a system that:
- **Stores product data in MySQL** while synchronizing key fields (name, description, category) with **Elasticsearch** for fast, full-text search.
- **Caches frequent product search queries in Redis**, dynamically managing the top 100 most frequent requests to improve performance.
- Handles **optional search filters** (name, category, price range, etc.) and **pagination** efficiently across all services (MySQL, Elasticsearch, Redis).
- **Maintains data consistency** between MySQL and Elasticsearch during product creation via distributed transaction-like mechanisms.

---

## **Architecture and Design Patterns**

The project is built with a focus on clean, maintainable, and scalable architecture, using several key design patterns and principles:

### **1. Singleton Pattern**
- The application leverages the Singleton Design Pattern to manage client instances for **MySQL**, **Redis**, and **Elasticsearch**, ensuring that only a single instance of each client exists throughout the application lifecycle.

### **2. Repository Pattern**
- A clear separation of concerns is achieved by using a Repository Pattern for data access. Each repository interacts with a specific data source (MySQL, Redis, Elasticsearch) and abstracts the complexity of the underlying database interactions from the service layer.

### **3. Service-Oriented Architecture**
- The business logic resides in the **Service Layer**, which interacts with repositories to perform operations. This abstraction allows for better maintainability and scalability, especially in complex applications.

### **4. Caching Strategy**
- A dynamic caching mechanism is implemented in **Redis** to manage **frequent queries**. The system only caches the top 100 most frequent queries (with a minimum threshold of 10 hits), ensuring that the cache is both efficient and relevant.
- Cache invalidation logic is triggered automatically when a new product is added, ensuring that stale data is not served to users.

### **5. Distributed Consistency**
- To maintain consistency between MySQL and Elasticsearch, a two-phase-like synchronization mechanism is used. Product IDs are synchronized across both databases, ensuring that the data is consistent during product creation.

### **6. Error Handling and Retry Mechanism**
- The system incorporates robust error handling and retry mechanisms, ensuring the reliability and fault tolerance of operations involving database and cache transactions.

### **7. Scalability and Pagination**
- Pagination is handled both at the MySQL and Elasticsearch levels. The system ensures that paginated results are cached effectively, even across multiple search filters.

---

## **Project Structure**

The project is modular and designed to adhere to the principles of separation of concerns, reusability, and scalability. Below is an overview of the folder structure:

```
src
├─ configs
   ├── cache.ts                      # Redis connection config
   ├── database.ts                   # Redis connection config
   ├── elasticsearch.ts              # Elasticsearch connection config
   ├── configuration.ts              # Put all configs together
├─ contracts
   ├── ...                           # Interfaces, Abstracts, Base Classes and Type Definitions
├─ controllers
   ├── ProductController.ts          # Handles API requests
├─ lib
   ├── elasticsearchClient.ts        # ElasticSearch client singleton
   ├── mysqlClient.ts                # MySQL client singleton
   ├── redisClient.ts                # Redis client singleton
├─ middlewares
   ├── apiMessageHolder.ts           # Used to keep messages and send them within response
   ├── ensureApiResult.ts            # Used to shape all responses in a uniform
├─ models
   ├── Product.ts                    # The main model of application
   ├── ...
├─ repositories
   ├── ElasticSearchRepository.ts    # Data access layer for Elasticsearch
   ├── MySqlProductRepository.ts     # Data access layer for Product model in the database
├─ routes
   ├── index.ts                      # API route definitions
   ├── ...
├─ services
   ├── CacheService.ts               # Business logic for managing caching process of frequent requests
   ├── ChildProcessService.ts        # Business logic for managing child processes
   ├── ProductService.ts             # Business logic for managing products data
├─ setup
   ├── cli.ts                        # Used to implement CLI commands in order to initialize application, database structure, etc...
   ├── ...
├─ utils
   ├── ...                           # Some utility classes and helper functions
├─ workers
   ├── invalidateCache.js            # The child process used to invalidate cached responses after altering database by filtering affected cached requests
   ├── pruneCache.js                 # The child process used to insure only highly frequent request are kept inside cache and the rest are removed
├─ main.ts                          # Application entry file
```

### **Key Components**:

1. **Lib**:
   - **`lib/`**: Initializes and exports clients for MySQL, Redis, and Elasticsearch, ensuring singleton behavior.
  
2. **Repositories**:
   - **`repositories/`**: Contains repositories for data access. Each repository interacts with a specific data source.
  
3. **Services**:
   - **`services/`**: Contains business logic that orchestrates the data retrieval and storage operations.
  
4. **Controllers**:
   - **`controllers/`**: Responsible for handling incoming API requests and delegating actions to the appropriate services.
  
5. **Cache Management**:
   - **`utils/cache.service.ts`**: Manages cache creation, invalidation, and maintenance of the top 100 most frequent queries in Redis.

---

## **Installation**

> This section will guide you through the setup and installation process. I will fill this section based on the specifics you provide.

1. Clone the repository:
   ```bash
   git clone https://github.com/farhad-rad/product-search-api-example.git
   cd product-search-api-example
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   - Update your MySQL, Redis, and Elasticsearch credentials in the `.env` file.

4. Run the services using **Docker Compose**:
   ```bash
   docker-compose up
   ```

5. Run setup command `db:int` inside **Application Docker Container**:
   ```bash
   npm run setup -- db:init
   ```

6. _[OPTIONAL]_ If you want to add sample data, run setup command `db:seed` **Application Docker Container**:
   ```bash
   npm run setup -- db:seed
   ```
   Alternatively you can run `db:int` setup command with `--seed` flag:
   ```bash
   npm run setup -- db:init --seed
   ```

---

## **API Usage**

### **Base URL**:
```
http://localhost:3000
```

### **Endpoints**:

#### 1. **Create Product**
- **URL**: `/products`
- **Method**: `POST`
- **Description**: Adds a new product to the database (MySQL) and indexes it in Elasticsearch.
  
- **Request Body**:
  ```json
  {
    "name": "Product Name",
    "description": "Product Description",
    "category": "Product Category",
    "price": 100
  }
  ```

- **Response**:
  ```json
  {
    "data": {
        "id": 1,
        "name": "Product Name",
        "description": "Product Description",
        "category": "Product Category",
        "price": 100,
        "created_at": "2024-10-01T00:00:00.000Z"
    },
    "messages": ["Product created successfully"],
    "ok": true
  }
  ```

#### 2. **Search Products**
- **URL**: `/products`
- **Method**: `GET`
- **Description**: Searches products by name, description, or category using full-text search in Elasticsearch. The final data is retrieved from MySQL.
  
- **Query Parameters**:
  - `search`: (optional, string) Full-text search by product name and description.
  - `category`: (optional, string) Filter by product category.
  - `minPrice`: (optional, number) Minimum price filter.
  - `maxPrice`: (optional, number) Maximum price filter.
  - `before`: (optional, string&lt;date-time&gt;) Filter by creation date and keep older products.
  - `after`: (optional, string&lt;date-time&gt;) Filter by creation date and keep newer products.
  - `page`: (optional, integer) Page number for pagination (default: 1).
  - `limit`: (optional, integer) Number of results per page (default: 10).

- **Example**:
  ```
  GET /products?search=phone&category=electronics&minPrice=50&maxPrice=500
  ```

- **Response**:
  ```json
  {
    "totalItems": 25,
    "currentPage": 1,
    "totalPages": 2,
    "pageSize": 10,
    "products": [
      {
        "id": 1,
        "name": "Smartphone",
        "description": "A modern smartphone.",
        "category": "electronics",
        "price": 300,
        "created_at": "2024-10-01T00:00:00.000Z"
      },
      ...
    ]
  }
  ```

---
