-- TABLAS USUARIOS, PROVEEDORES, CLIENTES, CATEGORIAS

-- USUARIOS
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(150) UNIQUE NOT NULL,
  nombre_apellido VARCHAR(150) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROVEEDORES
CREATE TABLE proveedor (
  id SERIAL PRIMARY KEY,
  rif VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(20),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CLIENTES
CREATE TABLE cliente (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  rif_ci VARCHAR(20) UNIQUE,
  direccion TEXT,
  telefono VARCHAR(20),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORÍAS
CREATE TABLE categoria (
  id SERIAL PRIMARY KEY,
  categoria_nombre VARCHAR(100) UNIQUE NOT NULL
);


-- TABLA PRODUCTOS


CREATE TABLE producto (
  id SERIAL PRIMARY KEY,
  codigo_barra VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT NOT NULL,
  categoria_id INT NOT NULL REFERENCES categoria(id)
);


-- TABLA INVENTARIO


CREATE TABLE inventario (
  producto_id INT PRIMARY KEY REFERENCES producto(id) ON DELETE CASCADE,
  stock INT NOT NULL DEFAULT 0,
  precio_usd NUMERIC(14,2) NOT NULL DEFAULT 0,
  precio_bs NUMERIC(14,2) NOT NULL DEFAULT 0,
  margen_porcentaje NUMERIC(5,2) DEFAULT 20,
  precio_venta_usd NUMERIC(14,2) DEFAULT 0,
  precio_venta_bs NUMERIC(14,2) DEFAULT 0,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- TABLAS COMPRA

CREATE TABLE compra_encabezado (
  id SERIAL PRIMARY KEY,
  proveedor_id INT NOT NULL REFERENCES proveedor(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_usd NUMERIC(14,2) NOT NULL,
  total_bs NUMERIC(14,2) NOT NULL
);

CREATE TABLE compra_detalle (
  id SERIAL PRIMARY KEY,
  compra_id INT NOT NULL REFERENCES compra_encabezado(id) ON DELETE CASCADE,
  producto_id INT NOT NULL REFERENCES producto(id),
  cantidad INT NOT NULL,
  precio_entrada_usd NUMERIC(12,2),
  precio_entrada_bs NUMERIC(14,2),
  precio_final_usd NUMERIC(12,2),
  precio_final_bs NUMERIC(14,2),
  subtotal_usd NUMERIC(14,2),
  subtotal_bs NUMERIC(14,2)
);

-- TABLAS VENTA

CREATE TABLE venta_encabezado (
  id SERIAL PRIMARY KEY,
  cliente_id INT NOT NULL REFERENCES cliente(id),
  vendedor_id UUID NOT NULL REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_usd NUMERIC(14,2) NOT NULL,
  total_bs NUMERIC(14,2) NOT NULL
);

CREATE TABLE venta_detalle (
  id SERIAL PRIMARY KEY,
  venta_id INT NOT NULL REFERENCES venta_encabezado(id) ON DELETE CASCADE,
  producto_id INT NOT NULL REFERENCES producto(id),
  cantidad INT NOT NULL,
  precio_unitario_usd NUMERIC(12,2),
  precio_unitario_bs NUMERIC(14,2),
  subtotal_usd NUMERIC(14,2),
  subtotal_bs NUMERIC(14,2)
);


INSERT INTO categoria (categoria_nombre)
VALUES ('Ropa');

ALTER TABLE compra_encabezado
ADD COLUMN fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP;