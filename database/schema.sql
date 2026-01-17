-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 17, 2026 at 09:39 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pfa_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `month` tinyint(4) NOT NULL CHECK (`month` >= 1 and `month` <= 12),
  `year` smallint(6) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`id`, `user_id`, `amount`, `month`, `year`, `category_id`, `created_at`, `updated_at`) VALUES
(2, 1, 200.00, 1, 2026, 2, '2026-01-17 19:57:51', '2026-01-17 19:57:51'),
(3, 1, 100.00, 1, 2026, 3, '2026-01-17 19:58:07', '2026-01-17 19:58:07');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `user_id`, `name`, `type`, `created_at`) VALUES
(1, 1, 'Food & Dining', 'expense', '2026-01-13 18:24:45'),
(2, 1, 'Transportation', 'expense', '2026-01-13 18:24:45'),
(3, 1, 'Shopping', 'expense', '2026-01-13 18:24:45'),
(4, 1, 'Entertainment', 'expense', '2026-01-13 18:24:45'),
(5, 1, 'Bills & Utilities', 'expense', '2026-01-13 18:24:45'),
(6, 1, 'Health & Fitness', 'expense', '2026-01-13 18:24:45'),
(7, 1, 'Travel', 'expense', '2026-01-13 18:24:45'),
(8, 1, 'Education', 'expense', '2026-01-13 18:24:45'),
(9, 1, 'Other Expense', 'expense', '2026-01-13 18:24:45'),
(10, 1, 'Salary', 'income', '2026-01-13 18:24:45'),
(11, 1, 'Freelance', 'income', '2026-01-13 18:24:45'),
(12, 1, 'Investments', 'income', '2026-01-13 18:24:45'),
(13, 1, 'Other Income', 'income', '2026-01-13 18:24:45');

-- --------------------------------------------------------

--
-- Table structure for table `solde`
--

CREATE TABLE `solde` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `initial_balance` decimal(12,2) DEFAULT 0.00,
  `current_balance` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `solde`
--

INSERT INTO `solde` (`id`, `user_id`, `initial_balance`, `current_balance`, `created_at`, `updated_at`) VALUES
(1, 1, 0.00, 1754.40, '2026-01-13 18:24:45', '2026-01-17 19:56:54');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `date` date NOT NULL,
  `category_id` int(11) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `amount`, `date`, `category_id`, `type`, `description`, `created_at`, `updated_at`) VALUES
(6, 1, 2500.00, '2026-01-17', 10, 'income', 'Salaire Décembre 2024', '2026-01-17 19:55:29', '2026-01-17 19:55:29'),
(7, 1, 650.00, '2026-01-17', 5, 'expense', 'Loyer Janvier', '2026-01-17 19:56:06', '2026-01-17 19:56:06'),
(8, 1, 45.60, '2026-01-17', 1, 'expense', 'Courses Carrefour', '2026-01-17 19:56:29', '2026-01-17 19:56:29'),
(9, 1, 50.00, '2026-01-17', 2, 'expense', 'Plein essence', '2026-01-17 19:56:54', '2026-01-17 19:56:54');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Nakouri Safa', 'Safa@gmail.com', '$2a$10$GUkzHHtfgFzDWVB.xPVRPOpb3u4KWsZDSaQrQxIGGAlzvZpUr2M6W', '2026-01-13 18:24:45', '2026-01-13 18:24:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_budget` (`user_id`,`month`,`year`,`category_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_period` (`month`,`year`),
  ADD KEY `idx_user_period` (`user_id`,`month`,`year`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_category` (`user_id`,`name`,`type`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_type` (`type`);

--
-- Indexes for table `solde`
--
ALTER TABLE `solde`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_user_date` (`user_id`,`date`),
  ADD KEY `idx_user_type_date` (`user_id`,`type`,`date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `solde`
--
ALTER TABLE `solde`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `budgets_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `solde`
--
ALTER TABLE `solde`
  ADD CONSTRAINT `solde_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
