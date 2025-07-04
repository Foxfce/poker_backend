-- CreateTable
CREATE TABLE `Player` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `nick_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` TEXT NOT NULL,
    `current_pocket` DOUBLE NOT NULL DEFAULT 20000,
    `total_win` INTEGER NOT NULL DEFAULT 0,
    `total_losees` INTEGER NOT NULL DEFAULT 0,
    `total_earning` DOUBLE NOT NULL,

    UNIQUE INDEX `Player_username_key`(`username`),
    UNIQUE INDEX `Player_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Table` (
    `id` VARCHAR(191) NOT NULL,
    `creator_Id` VARCHAR(191) NOT NULL,
    `player2_Id` VARCHAR(191) NULL,
    `player3_Id` VARCHAR(191) NULL,
    `player4_Id` VARCHAR(191) NULL,
    `max_player` INTEGER NOT NULL DEFAULT 1,
    `min_buy_in` INTEGER NOT NULL DEFAULT 20,
    `create_at` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Game` (
    `id` VARCHAR(10) NOT NULL,
    `table_id` VARCHAR(191) NOT NULL,
    `winner_id` VARCHAR(191) NULL,
    `start_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `end_time` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Table_Card` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `game_id` VARCHAR(10) NOT NULL,
    `round_number` INTEGER NOT NULL DEFAULT 0,
    `is_revealed` INTEGER NOT NULL DEFAULT 2,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Card` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `card_rank` VARCHAR(2) NOT NULL,
    `card_suit` ENUM('HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES') NOT NULL,
    `commu_card1_id` INTEGER NULL,
    `commu_card2_id` INTEGER NULL,
    `commu_card3_id` INTEGER NULL,
    `commu_card4_id` INTEGER NULL,
    `commu_card5_id` INTEGER NULL,
    `player_hand1_id` INTEGER NOT NULL,
    `player_hand2_id` INTEGER NOT NULL,

    UNIQUE INDEX `Card_card_rank_key`(`card_rank`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Player_Game` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player_id` VARCHAR(191) NOT NULL,
    `game_id` VARCHAR(10) NOT NULL,
    `bet_amount` DOUBLE NOT NULL,
    `final_hand_rank` INTEGER NOT NULL,
    `earning_change` DOUBLE NOT NULL,
    `is_winner` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Player_Hand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player_game_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player_game_id` INTEGER NULL,
    `amount` DOUBLE NOT NULL,
    `round_number` INTEGER NOT NULL,
    `is_raise` BOOLEAN NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Table` ADD CONSTRAINT `Table_creator_Id_fkey` FOREIGN KEY (`creator_Id`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Table` ADD CONSTRAINT `Table_player2_Id_fkey` FOREIGN KEY (`player2_Id`) REFERENCES `Player`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Table` ADD CONSTRAINT `Table_player3_Id_fkey` FOREIGN KEY (`player3_Id`) REFERENCES `Player`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Table` ADD CONSTRAINT `Table_player4_Id_fkey` FOREIGN KEY (`player4_Id`) REFERENCES `Player`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_table_id_fkey` FOREIGN KEY (`table_id`) REFERENCES `Table`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_winner_id_fkey` FOREIGN KEY (`winner_id`) REFERENCES `Player`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Table_Card` ADD CONSTRAINT `Table_Card_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_commu_card1_id_fkey` FOREIGN KEY (`commu_card1_id`) REFERENCES `Table_Card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_commu_card2_id_fkey` FOREIGN KEY (`commu_card2_id`) REFERENCES `Table_Card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_commu_card3_id_fkey` FOREIGN KEY (`commu_card3_id`) REFERENCES `Table_Card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_commu_card4_id_fkey` FOREIGN KEY (`commu_card4_id`) REFERENCES `Table_Card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_commu_card5_id_fkey` FOREIGN KEY (`commu_card5_id`) REFERENCES `Table_Card`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_player_hand1_id_fkey` FOREIGN KEY (`player_hand1_id`) REFERENCES `Player_Hand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Card` ADD CONSTRAINT `Card_player_hand2_id_fkey` FOREIGN KEY (`player_hand2_id`) REFERENCES `Player_Hand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Player_Game` ADD CONSTRAINT `Player_Game_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Player_Game` ADD CONSTRAINT `Player_Game_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Player_Hand` ADD CONSTRAINT `Player_Hand_player_game_id_fkey` FOREIGN KEY (`player_game_id`) REFERENCES `Player_Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bet` ADD CONSTRAINT `Bet_player_game_id_fkey` FOREIGN KEY (`player_game_id`) REFERENCES `Player_Game`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
