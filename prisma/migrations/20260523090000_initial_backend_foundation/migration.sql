CREATE TABLE `users` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(180) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `last_login_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,
  UNIQUE INDEX `users_email_key`(`email`),
  INDEX `users_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(60) NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `roles_code_key`(`code`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(120) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `permissions_code_key`(`code`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_roles` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `role_id` INTEGER NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `user_roles_role_id_idx`(`role_id`),
  UNIQUE INDEX `user_roles_user_id_role_id_key`(`user_id`, `role_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `role_id` INTEGER NOT NULL,
  `permission_id` INTEGER NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `role_permissions_permission_id_idx`(`permission_id`),
  UNIQUE INDEX `role_permissions_role_id_permission_id_key`(`role_id`, `permission_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_sessions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `user_sessions_token_hash_key`(`token_hash`),
  INDEX `user_sessions_expires_at_idx`(`expires_at`),
  INDEX `user_sessions_user_id_idx`(`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `areas` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(40) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `parent_id` INTEGER NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,
  UNIQUE INDEX `areas_code_key`(`code`),
  INDEX `areas_parent_id_idx`(`parent_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `houses` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `area_id` INTEGER NOT NULL,
  `name` VARCHAR(140) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `address` VARCHAR(255) NOT NULL,
  `rt_rw` VARCHAR(30) NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `joined_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,
  INDEX `houses_area_id_idx`(`area_id`),
  INDEX `houses_rt_rw_idx`(`rt_rw`),
  INDEX `houses_active_idx`(`active`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `coin_boxes` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `box_number` VARCHAR(60) NOT NULL,
  `status` ENUM('ACTIVE', 'LOST', 'DAMAGED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `distributed_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,
  UNIQUE INDEX `coin_boxes_box_number_key`(`box_number`),
  INDEX `coin_boxes_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `coin_box_assignments` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `coin_box_id` INTEGER NOT NULL,
  `house_id` INTEGER NOT NULL,
  `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ended_at` DATETIME(3) NULL,
  `status` ENUM('ACTIVE', 'ENDED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  INDEX `coin_box_assignments_coin_box_id_idx`(`coin_box_id`),
  INDEX `coin_box_assignments_house_id_idx`(`house_id`),
  INDEX `coin_box_assignments_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `withdrawals` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `coin_box_id` INTEGER NOT NULL,
  `house_id` INTEGER NOT NULL,
  `collector_id` INTEGER NOT NULL,
  `amount` INTEGER NOT NULL,
  `status` ENUM('PENDING', 'VALIDATED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  `notes` VARCHAR(500) NULL,
  `collected_at` DATETIME(3) NOT NULL,
  `validated_at` DATETIME(3) NULL,
  `rejected_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  INDEX `withdrawals_status_idx`(`status`),
  INDEX `withdrawals_collected_at_idx`(`collected_at`),
  INDEX `withdrawals_coin_box_id_idx`(`coin_box_id`),
  INDEX `withdrawals_house_id_idx`(`house_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `financial_categories` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(60) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `type` ENUM('INCOME', 'EXPENSE', 'ADJUSTMENT') NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,
  UNIQUE INDEX `financial_categories_code_key`(`code`),
  INDEX `financial_categories_type_idx`(`type`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `cash_transactions` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `category_id` INTEGER NOT NULL,
  `withdrawal_id` INTEGER NULL,
  `type` ENUM('INCOME', 'EXPENSE', 'ADJUSTMENT') NOT NULL,
  `amount` INTEGER NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `transaction_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  INDEX `cash_transactions_type_idx`(`type`),
  INDEX `cash_transactions_transaction_at_idx`(`transaction_at`),
  INDEX `cash_transactions_category_id_idx`(`category_id`),
  INDEX `cash_transactions_withdrawal_id_idx`(`withdrawal_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `public_reports` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `period` VARCHAR(40) NOT NULL,
  `title` VARCHAR(160) NOT NULL,
  `summary` TEXT NOT NULL,
  `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `published_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `public_reports_period_key`(`period`),
  INDEX `public_reports_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `attachments` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `public_report_id` INTEGER NULL,
  `file_name` VARCHAR(180) NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `mime_type` VARCHAR(120) NOT NULL,
  `size_bytes` INTEGER NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `attachments_public_report_id_idx`(`public_report_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `audit_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `actor_id` INTEGER NULL,
  `action` VARCHAR(120) NOT NULL,
  `entity_type` VARCHAR(80) NOT NULL,
  `entity_id` VARCHAR(80) NULL,
  `ip_address` VARCHAR(80) NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `audit_logs_actor_id_idx`(`actor_id`),
  INDEX `audit_logs_action_idx`(`action`),
  INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
  INDEX `audit_logs_created_at_idx`(`created_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `areas` ADD CONSTRAINT `areas_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `areas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `houses` ADD CONSTRAINT `houses_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `coin_box_assignments` ADD CONSTRAINT `coin_box_assignments_coin_box_id_fkey` FOREIGN KEY (`coin_box_id`) REFERENCES `coin_boxes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `coin_box_assignments` ADD CONSTRAINT `coin_box_assignments_house_id_fkey` FOREIGN KEY (`house_id`) REFERENCES `houses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `withdrawals` ADD CONSTRAINT `withdrawals_coin_box_id_fkey` FOREIGN KEY (`coin_box_id`) REFERENCES `coin_boxes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `withdrawals` ADD CONSTRAINT `withdrawals_house_id_fkey` FOREIGN KEY (`house_id`) REFERENCES `houses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `withdrawals` ADD CONSTRAINT `withdrawals_collector_id_fkey` FOREIGN KEY (`collector_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `cash_transactions` ADD CONSTRAINT `cash_transactions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `financial_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `cash_transactions` ADD CONSTRAINT `cash_transactions_withdrawal_id_fkey` FOREIGN KEY (`withdrawal_id`) REFERENCES `withdrawals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_public_report_id_fkey` FOREIGN KEY (`public_report_id`) REFERENCES `public_reports`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
