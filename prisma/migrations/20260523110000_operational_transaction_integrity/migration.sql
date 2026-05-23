ALTER TABLE `withdrawals`
  MODIFY `status` ENUM('PENDING','VALIDATED','REJECTED','VOIDED') NOT NULL DEFAULT 'PENDING',
  ADD COLUMN `voided_at` DATETIME(3) NULL,
  ADD COLUMN `void_reason` VARCHAR(500) NULL;

ALTER TABLE `coin_box_assignments`
  CHANGE COLUMN `ended_at` `unassigned_at` DATETIME(3) NULL;

ALTER TABLE `cash_transactions`
  ADD COLUMN `status` ENUM('PENDING','VALIDATED','REJECTED','VOIDED') NOT NULL DEFAULT 'VALIDATED',
  ADD COLUMN `reference_type` ENUM('WITHDRAWAL','EXPENSE','ADJUSTMENT') NOT NULL DEFAULT 'ADJUSTMENT',
  ADD COLUMN `reference_id` INTEGER NULL,
  ADD COLUMN `reason` VARCHAR(500) NULL,
  ADD COLUMN `created_by_id` INTEGER NULL,
  ADD COLUMN `validated_by_id` INTEGER NULL,
  ADD COLUMN `validated_at` DATETIME(3) NULL,
  ADD COLUMN `rejected_at` DATETIME(3) NULL,
  ADD COLUMN `voided_at` DATETIME(3) NULL;

UPDATE `cash_transactions`
SET
  `reference_type` = CASE
    WHEN `withdrawal_id` IS NOT NULL THEN 'WITHDRAWAL'
    WHEN `type` = 'EXPENSE' THEN 'EXPENSE'
    ELSE 'ADJUSTMENT'
  END,
  `reference_id` = CASE
    WHEN `withdrawal_id` IS NOT NULL THEN `withdrawal_id`
    ELSE `id`
  END,
  `validated_at` = COALESCE(`validated_at`, `transaction_at`);

CREATE UNIQUE INDEX `cash_transactions_withdrawal_id_key` ON `cash_transactions`(`withdrawal_id`);
CREATE INDEX `withdrawals_collector_id_idx` ON `withdrawals`(`collector_id`);
CREATE INDEX `coin_box_assignments_unassigned_at_idx` ON `coin_box_assignments`(`unassigned_at`);
CREATE INDEX `cash_transactions_status_idx` ON `cash_transactions`(`status`);
CREATE INDEX `cash_transactions_validated_at_idx` ON `cash_transactions`(`validated_at`);
CREATE INDEX `cash_transactions_reference_type_reference_id_idx` ON `cash_transactions`(`reference_type`, `reference_id`);
CREATE INDEX `cash_transactions_created_by_id_idx` ON `cash_transactions`(`created_by_id`);
CREATE INDEX `cash_transactions_validated_by_id_idx` ON `cash_transactions`(`validated_by_id`);

ALTER TABLE `cash_transactions` ADD CONSTRAINT `cash_transactions_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `cash_transactions` ADD CONSTRAINT `cash_transactions_validated_by_id_fkey` FOREIGN KEY (`validated_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
