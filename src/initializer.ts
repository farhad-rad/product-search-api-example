import dotenv from "dotenv";
import { ElasticSearchRepository } from "./repositories/ElasticSearchRepository";
import { MySqlProductRepository } from "./repositories/MySqlProductRepository";
import { ProductService } from "./services/ProductService";
import { Configuration } from "./utils/Configuration";

dotenv.config({ override: false });
(async () => {
  console.log(Configuration.get());
  const db = MySqlProductRepository.getInstance();
  const pool = db.getPool();
  console.log("dropping old tables");
  await pool.query(`DROP TABLE IF EXISTS products`);
  console.log("creating new tables");
  await pool.query(`CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  category VARCHAR(255),
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
  console.log("creating es indexes");

  const es = ElasticSearchRepository.getInstance();
  await es.initializeIndexes();

  const srv = ProductService.getInstance();

  const products = [
    {
      category: "tools",
      description: "Build your house at a time with this durable hammer.",
      name: "Stainless Still Hammer",
      price: 1500,
      created_at: new Date(),
    },
    {
      category: "books",
      description:
        "Unlock the secrets of the stars in this comprehensive astronomy guide.",
      name: "Stargazer's Handbook",
      price: 2000,
      created_at: new Date(),
    },
    {
      category: "books",
      description:
        "A riveting tale of perseverance and courage in the face of adversity.",
      name: "Against All Odds",
      price: 1200,
      created_at: new Date(),
    },
    {
      category: "electronics",
      description:
        "Immerse yourself in stunning sound with this high-fidelity audio device.",
      name: "SonicBoom 3000",
      price: 25000,
      created_at: new Date(),
    },
    {
      category: "electronics",
      description:
        "Stay connected with this sleek smartwatch that tracks everything.",
      name: "SmartTrack Pro",
      price: 8000,
      created_at: new Date(),
    },
    {
      category: "electronics",
      description:
        "Experience gaming like never before with this next-gen console.",
      name: "UltraGame Station",
      price: 50000,
      created_at: new Date(),
    },
    {
      category: "electronics",
      description: "Ultra HD resolution for a lifelike viewing experience.",
      name: "VisionMax TV",
      price: 35000,
      created_at: new Date(),
    },
    {
      category: "electronics",
      description: "Capture every moment with this advanced 4K camera.",
      name: "PhotoMaster 4K",
      price: 45000,
      created_at: new Date(),
    },
    {
      category: "electronics",
      description:
        "Stream music effortlessly with this portable Bluetooth speaker.",
      name: "SoundWave Mini",
      price: 15000,
      created_at: new Date(),
    },
    {
      category: "fashion",
      description: "Revolutionize your wardrobe with this eco-friendly jacket.",
      name: "EcoJacket",
      price: 3000,
      created_at: new Date(),
    },
    {
      category: "fashion",
      description:
        "Stay stylish and comfortable with our unique athleisure collection.",
      name: "ChillWear Set",
      price: 2500,
      created_at: new Date(),
    },
    {
      category: "fashion",
      description:
        "Timeless elegance meets modern design in this classic watch.",
      name: "Elegance Timepiece",
      price: 7000,
      created_at: new Date(),
    },
    {
      category: "fashion",
      description: "Step up your shoe game with these trendy sneakers.",
      name: "StreetStyle Kicks",
      price: 4000,
      created_at: new Date(),
    },
    {
      category: "home & garden",
      description:
        "Transform your living space with this stylish decorative lamp.",
      name: "LuxeGlow Lamp",
      price: 3500,
      created_at: new Date(),
    },
    {
      category: "home & garden",
      description: "Make cooking easier with this smart kitchen assistant.",
      name: "ChefPro",
      price: 8000,
      created_at: new Date(),
    },
    {
      category: "home & garden",
      description:
        "Enhance your outdoor space with test these elegant patio lights.",
      name: "Garden Glimmer",
      price: 2000,
      created_at: new Date(),
    },
    {
      category: "home & garden",
      description:
        "Enjoy fresh herbs all year round with this indoor garden kit.",
      name: "HerbGrower",
      price: 5000,
      created_at: new Date(),
    },
    {
      category: "toys",
      description:
        "Spark creativity and imagination with this building blocks set.",
      name: "Build-It Blocks",
      price: 1500,
      created_at: new Date(),
    },
    {
      category: "toys",
      description:
        "Explore the world of STEM with this educational test robot kit.",
      name: "RoboLearn",
      price: 4500,
      created_at: new Date(),
    },
    {
      category: "toys",
      description:
        "Unleash the fun with this 3D test puzzle game for all ages.",
      name: "PuzzleMaster 3D",
      price: 2800,
      created_at: new Date(),
    },
  ];

  for (let product of products) {
    await srv.createProduct(product);
  }
  console.log("done");
  process.exit(0);
})();
