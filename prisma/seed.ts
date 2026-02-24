import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const productsData = [
  {
    name: "Moccosin Saddle Black",
    slug: "moccosin-saddle-black",
    sku: "SW-LF-SD-BLK-003",
    price: 2499,
    discountPrice: 3299,
    description: "Lightweight knit slip-on for everyday urban style.",
    longDescription:
      "Crafted with premium breathable knit fabric, the Urban Knit Slip-On delivers unmatched comfort for the modern man on the move. The flexible upper molds to your foot shape while the cushioned insole provides all-day support. Whether you're heading to a casual meeting or exploring the city, this shoe pairs effortlessly with any outfit.",
    material: "Premium Knit Fabric",
    sole: "Anti-slip EVA rubber sole",
    quality: "Machine-stitched with reinforced seams",
    color: "Black",
    colorCode: "#1a1a1a",
    category: "Loafers",
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 100,
    isOutOfStock: false,
    images: [
      "/images/creative/1black_cloth.JPG",
      "/images/creative/2black_cloth.JPG",
      "/images/creative/3black_cloth.JPG",
      "/images/lifestyle/1black_cloth.JPG",
      "/images/lifestyle/23black_cloth.JPG",
    ],
  },
  {
    name: "Moccosin Coco Black",
    slug: "moccosin-coco-black",
    sku: "SW-LF-CR-BLK-002",
    price: 3499,
    discountPrice: 4299,
    description: "Statement loafer with designer-inspired detailing.",
    longDescription:
      "The Classic Designer Loafer redefines sophistication with its intricate pattern work and premium leather construction. Hand-finished with meticulous attention to detail, this loafer features an ornamental design on the vamp that sets it apart. The leather-lined interior ensures breathability while the padded footbed keeps you comfortable from morning to night.",
    material: "Full-grain Leather",
    sole: "Genuine leather sole with rubber heel tap",
    quality: "Handcrafted finish with artisan detailing",
    color: "Black",
    colorCode: "#0d0d0d",
    category: "Loafers",
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 100,
    isOutOfStock: false,
    images: [
      "/images/creative/1black_lofer_design.JPG",
      "/images/creative/2black_lofer_design.JPG",
      "/images/creative/3black_lofer_design.JPG",
      "/images/lifestyle/1black_lofer_design.JPG",
      "/images/lifestyle/2black_lofer_design.JPG",
    ],
  },
  {
    name: "Derby Suede Black",
    slug: "derby-suede-black",
    sku: "SW-FM-SU-BLK-005",
    price: 3999,
    discountPrice: null,
    description: "Timeless Oxford with refined lace-up closure.",
    longDescription:
      "A cornerstone of every gentleman's wardrobe, the Oxford Lace-Up combines timeless design with modern comfort technology. The closed lacing system creates a sleek silhouette, while the burnished leather upper develops a unique patina over time. Paired with a Goodyear-welted sole for durability, this is a shoe built to last generations.",
    material: "Premium Calf Leather",
    sole: "Goodyear-welted leather sole",
    quality: "Hand-burnished with wax finish",
    color: "Black",
    colorCode: "#111111",
    category: "Formal",
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 100,
    isOutOfStock: false,
    images: [
      "/images/creative/1black_with_lase.JPG",
      "/images/creative/2black_with_lase.JPG",
      "/images/creative/3black_with_lase.JPG",
      "/images/lifestyle/1black_with_lase.JPG",
      "/images/lifestyle/2black_with_lase.JPG",
    ],
  },
  {
    name: "Chelsea Boot Black",
    slug: "chelsea-boot-black",
    sku: "SW-BT-BLK-001",
    price: 2799,
    discountPrice: 3499,
    description: "Easy slip-on with elastic gusset for perfect fit.",
    longDescription:
      "The Elastic Comfort Shoe is engineered for those who value convenience without compromising style. Twin elastic gussets on both sides ensure a snug yet flexible fit, making them effortless to put on and take off. The premium leather upper is paired with a memory foam insole that adapts to your unique foot contour for personalized comfort.",
    material: "Soft Nappa Leather",
    sole: "Flexible anti-slip rubber sole",
    quality: "Premium stitched with elastic gusset detail",
    color: "Black",
    colorCode: "#1c1c1c",
    category: "Boots",
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 100,
    isOutOfStock: false,
    images: [
      "/images/creative/1black_with_lastic.JPG",
      "/images/creative/2black_with_lastic.JPG",
      "/images/creative/3black_with_lastic.JPG",
      "/images/lifestyle/1black_with_lastic.JPG",
      "/images/lifestyle/2black_with_lastic.JPG",
    ],
  },
  {
    name: "Derby Classic Black",
    slug: "derby-classic-black",
    sku: "SW-FM-DR-BLK-004",
    price: 3299,
    discountPrice: null,
    description: "Minimalist derby with a clean laceless design.",
    longDescription:
      "The Sleek Laceless Derby strips formal footwear down to its elegant essentials. Without laces, the shoe presents a seamless, unbroken line that exudes modern refinement. The polished leather upper is crafted from a single piece for minimal seams, while the cushioned latex insole ensures comfort during long hours on your feet.",
    material: "Polished Leather",
    sole: "Slim-profile leather sole with rubber grip",
    quality: "Seamless one-piece construction",
    color: "Black",
    colorCode: "#0a0a0a",
    category: "Formal",
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 100,
    isOutOfStock: false,
    images: [
      "/images/creative/1black_without_lase.JPG",
      "/images/creative/2black_without_lase.JPG",
      "/images/creative/3black_without_lase.JPG",
      "/images/lifestyle/1black_without_lase.JPG",
      "/images/lifestyle/2black_without_lase.JPG",
    ],
  },
  {
    name: "Derby Suede Brown",
    slug: "derby-suede-brown",
    sku: "SW-FM-SU-BR-005",
    price: 2499,
    discountPrice: 2999,
    description: "Casual canvas shoe in rich brown for laid-back days.",
    longDescription:
      "The Canvas Comfort Shoe brings together the relaxed feel of canvas with the warmth of a rich brown tone. Perfect for weekends and casual outings, the breathable fabric upper keeps your feet cool while the padded collar prevents heel slip. The textured rubber outsole provides reliable grip on various surfaces.",
    material: "Premium Canvas Fabric",
    sole: "Textured rubber outsole",
    quality: "Double-stitched canvas with padded collar",
    color: "Brown",
    colorCode: "#5c3a1e",
    category: "Formal",
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 100,
    isOutOfStock: false,
    images: [
      "/images/creative/1brown_cloth.JPG",
      "/images/creative/2brown_cloth.JPG",
      "/images/creative/3brown_cloth.JPG",
      "/images/lifestyle/1brown_cloth.JPG",
      "/images/lifestyle/2brown_cloth.JPG",
    ],
  },
  {
    name: "Moccosin Croco Brown",
    slug: "moccosin-croco-brown",
    sku: "SW-LF-CR-BR-002",
    price: 3699,
    discountPrice: 4499,
    description: "Handcrafted penny loafer with artisan design elements.",
    longDescription:
      "The Artisan Penny Loafer is a tribute to old-world craftsmanship. Each pair is hand-assembled by skilled artisans, featuring an ornate strap across the vamp with the iconic penny slot. The rich brown leather is vegetable-tanned for an eco-friendly finish and develops a beautiful patina with wear, making each pair uniquely yours.",
    material: "Vegetable-tanned Leather",
    sole: "Blake-stitched leather sole",
    quality: "Hand-assembled artisan craftsmanship",
    color: "Brown",
    colorCode: "#6b3f1f",
    category: "Loafers",
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 100,
    isOutOfStock: false,
    images: [
      "/images/creative/1brown_lofer_design.JPG",
      "/images/creative/2brown_lofer_design.JPG",
      "/images/creative/3brown_lofer_design.JPG",
      "/images/lifestyle/1brown_lofer_design.JPG",
      "/images/lifestyle/2brown_lofer_design.JPG",
    ],
  },
  {
    name: "Moccosin Saddle Brown",
    slug: "moccosin-saddle-brown",
    sku: "SW-LF-SD-BR-003",
    price: 2999,
    discountPrice: null,
    description: "Understated loafer for effortless everyday elegance.",
    longDescription:
      "Sometimes less truly is more. The Classic Simple Loafer embodies this philosophy with its clean lines and unadorned design. The supple leather upper sits on a lightweight sole, creating a shoe that transitions seamlessly from office to evening. The interior leather lining wicks moisture while the cushioned footbed supports every step.",
    material: "Premium Suede Leather",
    sole: "Lightweight TPR sole",
    quality: "Hand-finished with suede brushing technique",
    color: "Brown",
    colorCode: "#7a4a2a",
    category: "Loafers",
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 100,
    isOutOfStock: false,
    images: [
      "/images/creative/1brown_lofer_simple.JPG",
      "/images/creative/2brown_lofer_simple.JPG",
      "/images/creative/3brown_lofer_simple.JPG",
      "/images/lifestyle/1brown_lofer_simple.JPG",
      "/images/lifestyle/2brown_lofer_simple.JPG",
    ],
  },
  {
    name: "Derby Classic Brown",
    slug: "derby-classic-brown",
    sku: "SW-FM-DR-BR-004",
    price: 3799,
    discountPrice: null,
    description: "Heritage-inspired brogue with intricate perforations.",
    longDescription:
      "The Brogue Lace-Up pays homage to British shoemaking heritage with its distinctive perforated wingtip pattern. The full-grain brown leather upper features medalion toe detailing and serrated edges that showcase exceptional skill. A Goodyear-welted construction ensures the sole can be replaced, making this a lifelong investment in style.",
    material: "Full-grain Leather",
    sole: "Goodyear-welted leather sole",
    quality: "Hand-perforated brogue detailing",
    color: "Brown",
    colorCode: "#5e3318",
    category: "Formal",
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 100,
    isOutOfStock: false,
    images: [
      "/images/creative/1brown_with_lase.JPG",
      "/images/creative/2brown_with_lase.JPG",
      "/images/creative/3brown_with_lase.JPG",
      "/images/lifestyle/1brown_with_lase.JPG",
      "/images/lifestyle/2brown_with_lase.JPG",
    ],
  },
  {
    name: "Chelsea Boot Brown",
    slug: "chelsea-boot-brown",
    sku: "SW-BT-BR-001",
    price: 3499,
    discountPrice: 4199,
    description: "Refined Chelsea-style boot with elastic side panels.",
    longDescription:
      "The Chelsea Elastic Boot is a modern take on the iconic Chelsea boot silhouette. Featuring twin elastic side panels for easy on-off access and a pull tab at the heel, this boot combines traditional British style with everyday practicality. The rich brown leather is treated with a matte finish for a contemporary feel, while the stacked heel adds subtle height.",
    material: "Premium Matte Leather",
    sole: "Stacked leather heel with rubber grip",
    quality: "Hand-lasted with reinforced heel counter",
    color: "Brown",
    colorCode: "#4a2d15",
    category: "Boots",
    sizes: [6, 7, 8, 9, 10, 11],
    stock: 100,
    isOutOfStock: false,
    images: [
      "/images/creative/1brown_with_lastic.JPG",
      "/images/creative/2brown_with_lastic.JPG",
      "/images/creative/3brown_with_lastic.JPG",
      "/images/lifestyle/1brown_with_lastic.JPG",
      "/images/lifestyle/2brown_with_lastic.JPG",
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@swathoops.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    },
  });
  console.log(`Admin user created: ${adminEmail}`);
  console.log("⚠️  Change the admin password after first login!");

  // Create products
  for (const product of productsData) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }
  console.log(`${productsData.length} products seeded.`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
