CREATE DATABASE IF NOT EXISTS menarapublik CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'menarapublik'@'localhost' IDENTIFIED BY 'MenaraPublik2026!';
GRANT ALL PRIVILEGES ON menarapublik.* TO 'menarapublik'@'localhost';
FLUSH PRIVILEGES;
SELECT 'DATABASE_SETUP_OK' AS status;
