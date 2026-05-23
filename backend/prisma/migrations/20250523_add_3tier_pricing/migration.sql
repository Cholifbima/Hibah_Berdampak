-- Migration: Add 3-tier pricing fields to Product table
-- Run this in MySQL before deploying

ALTER TABLE Product 
ADD COLUMN harga_asli INT NULL COMMENT 'Harga FAKE/ASLI (tipuan) - dicoret',
ADD COLUMN diskon_persen INT DEFAULT 0 COMMENT 'Persentase diskon',
ADD COLUMN harga_grosir INT NULL COMMENT 'Harga grosir',
ADD COLUMN min_grosir INT DEFAULT 10 COMMENT 'Min pembelian grosir';
