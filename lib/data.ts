import { Product, Category } from "@/types";

export const mockCategories: Category[] = [
  {
    id: "cmhozukjp0001",
    name: "Kính mát",
    slug: "sunglasses",
    description: "Kính mát thời trang và bảo vệ mắt khỏi tia UV",
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cmhozukjp0002",
    name: "Kính gọng",
    slug: "eyeglasses",
    description: "Gọng kính cận thời trang, nhẹ và bền bỉ",
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cmhozukjp0003",
    name: "Kính thể thao",
    slug: "sports-glasses",
    description: "Kính chuyên dụng cho hoạt động ngoài trời và thể thao",
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cmhozukjp0004",
    name: "Phụ kiện",
    slug: "accessories",
    description: "Hộp kính, khăn lau và các phụ kiện đi kèm",
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockProducts: Product[] = [
  // Sunglasses
  {
    id: "cmhozukjp1001",
    sku: "RB-AVIATOR-001",
    name: "Ray-Ban Aviator Classic",
    slug: "ray-ban-aviator-classic",
    priceInt: 4500000,
    stock: 45,
    description:
      "Kính mát phi công kinh điển, gọng kim loại vàng, tròng thủy tinh G-15 cao cấp.",
    imageUrls: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000",
      "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1000",
    ],
    categoryId: "cmhozukjp0001",
    attributes: {
      brand: "Ray-Ban",
      frameMaterial: "Metal",
      lensMaterial: "Glass",
      uvProtection: "UV400",
      frameShape: "Aviator",
      color: "Gold/Green",
    },
    model3dUrl: "/3dmodel/glasses-01/scene.gltf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cmhozukjp1002",
    sku: "RB-WAYFARER-002",
    name: "Ray-Ban Wayfarer",
    slug: "ray-ban-wayfarer",
    priceInt: 3800000,
    stock: 60,
    description:
      "Phong cách retro kinh điển, gọng nhựa acetate cao cấp, biểu tượng của sự tự do.",
    imageUrls: [
      "https://images.unsplash.com/photo-1511499767390-90342f568952?q=80&w=1000",
      "https://images.unsplash.com/photo-1594236773539-75573415170d?q=80&w=1000",
    ],
    categoryId: "cmhozukjp0001",
    attributes: {
      brand: "Ray-Ban",
      frameMaterial: "Acetate",
      lensMaterial: "Polycarbonate",
      uvProtection: "UV400",
      frameShape: "Wayfarer",
      color: "Black",
    },
    model3dUrl: "/3dmodel/glasses-02/scene.gltf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cmhozukjp1003",
    sku: "GUCCI-GG001",
    name: "Gucci Cat-Eye GG",
    slug: "gucci-cat-eye-gg",
    priceInt: 8500000,
    stock: 20,
    description:
      "Thiết kế mắt mèo sang trọng, logo Gucci đặc trưng, gọng kim loại mạ vàng.",
    imageUrls: [
      "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=1000",
      "https://images.unsplash.com/photo-1591076482201-38257865c363?q=80&w=1000",
    ],
    categoryId: "cmhozukjp0001",
    attributes: {
      brand: "Gucci",
      frameMaterial: "Metal/Acetate",
      lensMaterial: "Polycarbonate",
      uvProtection: "UV400",
      frameShape: "Cat-Eye",
      color: "Gold/Brown",
      gender: "Nữ",
    },
    model3dUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cmhozukjp1004",
    sku: "PRADA-001",
    name: "Prada Monochrome",
    slug: "prada-monochrome",
    priceInt: 9200000,
    stock: 15,
    description:
      "Sự tối giản đẳng cấp từ Prada, gọng vuông to bản, phong cách thanh lịch.",
    imageUrls: [
      "https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=1000",
    ],
    categoryId: "cmhozukjp0001",
    attributes: {
      brand: "Prada",
      frameMaterial: "Acetate",
      lensMaterial: "Nylon",
      uvProtection: "UV400",
      frameShape: "Square",
      color: "Black/Grey",
      gender: "Unisex",
    },
    model3dUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Eyeglasses
  {
    id: "cmhozukjp2001",
    sku: "EYE-BLUE-001",
    name: "Kính Tròn Vintage Silver",
    slug: "round-vintage-silver",
    priceInt: 1200000,
    stock: 100,
    description:
      "Gọng kính tròn mỏng phong cách vintage, tích hợp tròng lọc ánh sáng xanh.",
    imageUrls: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000",
    ],
    categoryId: "cmhozukjp0002",
    attributes: {
      brand: "Vision Pro",
      frameMaterial: "Titanium",
      frameShape: "Round",
      color: "Silver",
      blueLight: true,
    },
    model3dUrl: "/3dmodel/glasses-05/scene.gltf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cmhozukjp2002",
    sku: "EYE-RECT-002",
    name: "Kính Gọng Vuông Office",
    slug: "square-office-frames",
    priceInt: 950000,
    stock: 80,
    description:
      "Gọng vuông mạnh mẽ, phù hợp môi trường công sở, chất liệu TR90 siêu nhẹ.",
    imageUrls: [
      "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=1000",
    ],
    categoryId: "cmhozukjp0002",
    attributes: {
      brand: "Classic",
      frameMaterial: "TR90",
      frameShape: "Square",
      color: "Navy Blue",
    },
    model3dUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Sports
  {
    id: "cmhozukjp3001",
    sku: "OAKLEY-RADAR-001",
    name: "Oakley Radar EV Path",
    slug: "oakley-radar-ev-path",
    priceInt: 5800000,
    stock: 30,
    description:
      "Kính thể thao đỉnh cao, tròng Prizm Road tăng cường tương phản, chống gió tuyệt đối.",
    imageUrls: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1000",
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?q=80&w=1000",
    ],
    categoryId: "cmhozukjp0003",
    attributes: {
      brand: "Oakley",
      frameMaterial: "O-Matter",
      lensMaterial: "Plutonite",
      uvProtection: "UV400",
      frameShape: "Wrap",
      color: "Matte Black",
      prizm: true,
    },
    model3dUrl: "/3dmodel/glasses-04/scene.gltf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cmhozukjp3002",
    sku: "OAKLEY-JAWBREAKER",
    name: "Oakley Jawbreaker",
    slug: "oakley-jawbreaker",
    priceInt: 6200000,
    stock: 25,
    description:
      "Thiết kế đột phá cho vận động viên đạp xe, tầm nhìn mở rộng tối đa.",
    imageUrls: [
      "https://images.unsplash.com/photo-1509695507497-903c140c43b0?q=80&w=1000",
    ],
    categoryId: "cmhozukjp0003",
    attributes: {
      brand: "Oakley",
      frameMaterial: "O-Matter",
      frameShape: "Shield",
      color: "White/Prizm Road",
      prizm: true,
    },
    model3dUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockStats = {
  totalProducts: mockProducts.length,
  totalCategories: mockCategories.length,
  highStockCount: 15,
  bestSellingCount: 8,
};
