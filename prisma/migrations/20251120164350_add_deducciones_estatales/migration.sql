-- CreateTable
CREATE TABLE `ente_deducciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO', 'ELIMINADO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ente_deducciones_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuraciones_deducciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `enteId` INTEGER NOT NULL,
    `anio` INTEGER NOT NULL,
    `tipo` ENUM('PORCENTAJE', 'TECHO', 'MONTO_FIJO') NOT NULL,
    `subTipo` VARCHAR(191) NULL,
    `porcentaje` DECIMAL(10, 4) NULL,
    `montoFijo` DECIMAL(12, 2) NULL,
    `techo` DECIMAL(12, 2) NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO', 'ELIMINADO') NOT NULL DEFAULT 'ACTIVO',
    `descripcion` VARCHAR(191) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tramos_isr` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anio` INTEGER NOT NULL,
    `desde` DECIMAL(12, 2) NOT NULL,
    `hasta` DECIMAL(12, 2) NULL,
    `porcentaje` DECIMAL(10, 4) NOT NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO', 'ELIMINADO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regimenes_laborales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `aplicaIHSS` BOOLEAN NOT NULL DEFAULT false,
    `aplicaRAP` BOOLEAN NOT NULL DEFAULT false,
    `aplicaISR` BOOLEAN NOT NULL DEFAULT true,
    `aplicaINJUPEMP` BOOLEAN NOT NULL DEFAULT false,
    `aplicaIMPREMA` BOOLEAN NOT NULL DEFAULT false,
    `estado` ENUM('ACTIVO', 'INACTIVO', 'ELIMINADO') NOT NULL DEFAULT 'ACTIVO',
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `regimenes_laborales_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cotizaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empleadoNombre` VARCHAR(191) NOT NULL,
    `salarioBruto` DECIMAL(12, 2) NOT NULL,
    `regimenId` INTEGER NULL,
    `totalDeducciones` DECIMAL(12, 2) NULL,
    `salarioNeto` DECIMAL(12, 2) NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `configuraciones_deducciones` ADD CONSTRAINT `configuraciones_deducciones_enteId_fkey` FOREIGN KEY (`enteId`) REFERENCES `ente_deducciones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cotizaciones` ADD CONSTRAINT `cotizaciones_regimenId_fkey` FOREIGN KEY (`regimenId`) REFERENCES `regimenes_laborales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
