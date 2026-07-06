CREATE TABLE IF NOT EXISTS products (
  id          VARCHAR(10)               PRIMARY KEY,
  name        VARCHAR(255)              NOT NULL,
  category    ENUM('Formal','Sneakers','Boots') NOT NULL,
  price       INT                       NOT NULL,
  image_url   TEXT,
  description TEXT,
  sizes       JSON,
  stock       INT                       DEFAULT 0,
  rating      DECIMAL(3,1)              DEFAULT 0.0,
  created_at  TIMESTAMP                 DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id         INT           AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255)  NOT NULL,
  email      VARCHAR(255)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
  id         INT           AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(100)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id               INT           AUTO_INCREMENT PRIMARY KEY,
  customer_name    VARCHAR(255)  NOT NULL,
  customer_phone   VARCHAR(20)   NOT NULL,
  customer_address TEXT          NOT NULL,
  items            JSON          NOT NULL,
  total_price      INT           NOT NULL,
  status           VARCHAR(50)   DEFAULT 'Diproses',
  wa_link          TEXT, 
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO products (id, name, category, price, image_url, description, sizes, stock, rating) VALUES
('P1','Alfas Step Pantofel Oxford Elite','Formal',850000,'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=80&w=600','Sepatu kulit asli dengan desain klasik Oxford, sangat ideal untuk acara kenegaraan atau kantor.','[39,40,41,42,43]',10,4.9),
('P2','Alfas Step Sneakers Putih Urban','Sneakers',525000,'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600','Sepatu kets minimalis berwarna putih yang ringan dan nyaman untuk aktivitas harian.','[39,40,41,42,43]',15,4.8),
('P3','Alfas Step Sepatu Boot Suede Cokelat','Boots',720000,'https://i.pinimg.com/736x/af/ce/49/afce4960f28b0753c1bde6a2fa4bf99c.jpg','Sepatu bot berbahan kulit suede berkualitas tinggi dengan warna cokelat maskulin.','[39,40,41,42,43]',5,4.7),
('P4','Alfas Step Sneakers Olahraga Pro','Sneakers',680000,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600','Sepatu olahraga dengan teknologi bantalan empuk untuk performa maksimal.','[39,40,41,42,43]',12,4.9),
('P5','Alfas Step Pantofel Hitam Premium','Formal',950000,'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600','Sepatu pantofel kulit premium berwarna hitam pekat untuk kesan sangat elegan.','[39,40,41,42,43]',8,5.0),
('P6','Alfas Step Sneakers Casual Abu-abu','Sneakers',450000,'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600','Sepatu casual fleksibel dengan warna abu-abu yang modern dan mudah dipadupadankan.','[39,40,41,42,43]',20,4.5),
('P7','Alfas Step Pantofel Derby Klasik','Formal',800000,'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600','Desain Derby klasik yang kokoh dan formal bagi pria profesional.','[39,40,41,42,43]',7,4.8),
('P8','Alfas Step Sepatu Boot Pendaki','Boots',1100000,'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=600','Sepatu bot tangguh yang dirancang khusus untuk petualangan luar ruangan.','[39,40,41,42,43]',4,4.9),
('P9','Alfas Step Sneakers Retro Modern','Sneakers',590000,'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600','Sepatu kets gaya retro dengan sentuhan warna neon yang sangat trendi.','[39,40,41,42,43]',14,4.6),
('P10','Alfas Step Sepatu Boot Workman Steel','Boots',890000,'https://i.pinimg.com/1200x/be/d1/77/bed1779ca5c60b249ffafb7bdb027da6.jpg','Sepatu bot industri dengan perlindungan ekstra untuk keamanan kerja.','[39,40,41,42,43]',6,4.7);

INSERT IGNORE INTO admins (username, password) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
