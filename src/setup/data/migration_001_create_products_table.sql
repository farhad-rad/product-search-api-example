DROP TABLE IF EXISTS `products`;

CREATE TABLE
    `products` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255),
        `description` TEXT,
        `category` VARCHAR(255),
        `price` DECIMAL(10, 2),
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );