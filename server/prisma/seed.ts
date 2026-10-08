import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting LE DAMAS database seed...');

  // 1. Create Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ledamas.com' },
    update: {},
    create: {
      email: 'admin@ledamas.com',
      password: adminPasswordHash,
      name: 'LE DAMAS Admin',
      role: Role.SUPER_ADMIN,
      phone: '+919876543210',
    },
  });
  console.log(`✅ Admin user upserted: ${adminUser.email}`);

  // 2. Define Official Categories & Cleanup Old Categories
  const categoriesData = [
    {
      slug: 'kunafa-chocolate',
      name: 'Kunafa Chocolate',
      tagline: 'Pistachio Cream & Crunchy Kunafa Layers',
      description: 'Savor the richness of Dubai Chocolate – Pistachio Cream & Kunafa. A gourmet fusion of East and West, only at LE DAMAS.',
      heroImage: '/Kunafa-Pistachio-Dark-Chocolate-1.png',
    },
    {
      slug: 'dark-chocolate',
      name: 'Dark Chocolate',
      tagline: 'Single-Origin Bittersweet Cacao',
      description: 'Bold dark chocolate bars crafted with single-estate cacao beans.',
      heroImage: '/Kunafa-Pistachio-Dark-Chocolate-3.png',
    },
    {
      slug: 'milk-chocolate',
      name: 'Milk Chocolate',
      tagline: 'Creamy Alpine Milk Cacao & Roasted Gianduja',
      description: 'Smooth, creamy milk chocolate bars filled with roasted hazelnut creme, speculoos, and Kunafa crunch.',
      heroImage: '/Crispy-Speculoos-Creme-Milk-Chocolate-1.png',
    },
    {
      slug: 'mini-chocolate-bars',
      name: 'Mini Chocolate Bars',
      tagline: 'Portioned 35g Bite-Sized Luxury Chocolates',
      description: '35g mini luxury chocolate bars featuring Kunafa Pistachio, Crispy Speculoos, and Hazelnut Creme.',
      heroImage: '/Kunafa-Pistachio-Dark-Chocolate---Mini-Bar-35gm-1.png',
    },
    {
      slug: 'pistachio-chocolate',
      name: 'Pistachio Chocolate',
      tagline: 'Mediterranean Roasted Pistachio Chocolates',
      description: 'Pure Mediterranean roasted pistachio creme encased in single-origin dark and milk chocolate.',
      heroImage: '/Kunafa-and-Pistachio-Creme-1.png',
    },
    {
      slug: 'lebubu',
      name: 'Lebubu',
      tagline: 'Signature Lebubu Character Molded Chocolate',
      description: 'Discover the iconic LE DAMAS Lebubu collection.',
      heroImage: '/Le-Bubu-2.png',
    },
  ];

  // 3. Official 12 LE DAMAS Product Slugs
  const allowedProductSlugs = [
    'white-chocolate-hazelnut-creme-200g',
    'speculoos-creme-kunafa-110g',
    'kunafa-pistachio-dark-chocolate-200g',
    'hazelnut-creme-milk-chocolate-110g',
    'crispy-speculoos-creme-milk-chocolate-200g',
    'kunafa-pistachio-dark-chocolate-mini-bar-35g',
    'crispy-speculoos-creme-milk-chocolate-mini-bar-35g',
    'kunafa-pistachio-milk-chocolate-mini-bar-35g',
    'kunafa-pistachio-creme-110g',
    'kunafa-pistachio-milk-chocolate-200g',
    'hazelnut-creme-milk-chocolate-mini-bar-35g',
    'lebubu-milk-chocolate-kunafa-pistachio',
  ];

  // Purge obsolete sample products
  console.log('🧹 Purging non-LE DAMAS sample products from database...');
  const obsoleteProducts = await prisma.product.findMany({
    where: { slug: { notIn: allowedProductSlugs } },
    select: { id: true, name: true, slug: true },
  });

  for (const oldProd of obsoleteProducts) {
    await prisma.productImage.deleteMany({ where: { productId: oldProd.id } });
    await prisma.productVariant.deleteMany({ where: { productId: oldProd.id } });
    await prisma.orderItem.deleteMany({ where: { productId: oldProd.id } });
    await prisma.inventoryBatch.deleteMany({ where: { productId: oldProd.id } });
    await prisma.product.delete({ where: { id: oldProd.id } });
    console.log(`🗑️ Deleted non-LE DAMAS product: ${oldProd.name} (${oldProd.slug})`);
  }

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }

  // Purge old categories with no products
  const allowedCatSlugs = categoriesData.map(c => c.slug);
  const obsoleteCategories = await prisma.category.findMany({
    where: { slug: { notIn: allowedCatSlugs } }
  });
  for (const cat of obsoleteCategories) {
    const prodsCount = await prisma.product.count({ where: { categoryId: cat.id } });
    if (prodsCount === 0) {
      await prisma.category.delete({ where: { id: cat.id } });
      console.log(`🗑️ Deleted empty old category: ${cat.name}`);
    }
  }

  console.log(`✅ ${categoriesData.length} Categories active and seeded.`);

  // 4. Create All 12 Products from LE DAMAS Catalogue
  const productsData = [
    {
      slug: 'white-chocolate-hazelnut-creme-200g',
      name: 'White Chocolate Hazelnut Creme - 200gm',
      tagline: 'Pure Cocoa Butter White Shell with Velvet Roasted Hazelnut',
      shortDescription: 'Luxury 200g white chocolate bar crafted with pure organic cocoa butter and filled with slow-roasted hazelnut creme.',
      description: 'An exquisite 200g creation featuring a delicate shell of pure white chocolate encapsulating a velvety, slow-roasted hazelnut gianduja center.',
      price: 1699,
      originalPrice: 1899,
      cacaoPercentage: null,
      weight: '200gm',
      origin: 'Organic Cocoa Butter & Roasted Hazelnut',
      tastingNotes: ['Velvety Cocoa Butter', 'Toasted Hazelnut', 'Bourbon Vanilla'],
      ingredients: ['Cocoa Butter', 'Roasted Hazelnuts', 'Whole Milk Powder', 'Natural Vanilla'],
      dietaryBadges: ['Pure Cocoa Butter', 'White Chocolate', '200gm Bar'],
      images: ['/White-Chocolate-Hazelnut-Creme-1.png', '/White-Chocolate-Hazelnut-Creme-2.png', '/White-Chocolate-Hazelnut-Creme-3.png', '/White-Chocolate-Hazelnut-Creme-4.png'],
      isFeatured: true,
      isBestSeller: false,
      isNewRelease: true,
      categorySlug: 'milk-chocolate',
      rating: 4.9,
      reviewsCount: 56,
      inStock: true,
    },
    {
      slug: 'speculoos-creme-kunafa-110g',
      name: 'Speculoos Creme and Kunafa - 110gm',
      tagline: 'Spiced Belgian Cookie Creme with Crispy Kataifi',
      shortDescription: 'Spiced cookie butter creme jar infused with cinnamon, cardamom, and toasted Kunafa crunch.',
      description: 'A warm, aromatic dessert spread crafted from caramelized speculoos cookie creme blended with buttered Kataifi pastry flakes.',
      price: 749,
      originalPrice: 899,
      cacaoPercentage: null,
      weight: '110gm',
      origin: 'Belgian Speculoos Infusion',
      tastingNotes: ['Cinnamon Speculoos', 'Caramelized Sugar', 'Toasted Kunafa Crunch'],
      ingredients: ['Belgian Cookie Butter', 'Kataifi Pastry', 'Butter', 'Spices'],
      dietaryBadges: ['Handcrafted', 'Spiced Cookie Butter'],
      images: ['/Speculoos-Creme-and-Kunafa-1.png', '/Speculoos-Creme-and-Kunafa-2.png', '/Speculoos-Creme-and-Kunafa-3.png', '/Speculoos-Creme-and-Kunafa-4.png'],
      isFeatured: true,
      isBestSeller: false,
      isNewRelease: false,
      categorySlug: 'kunafa-chocolate',
      rating: 4.85,
      reviewsCount: 42,
      inStock: true,
    },
    {
      slug: 'kunafa-pistachio-dark-chocolate-200g',
      name: 'Kunafa Pistachio Dark Chocolate - 200gm',
      tagline: 'Pistachio Cream & Crunchy Kunafa Layers',
      shortDescription: 'Savor the richness of Dubai Chocolate – Pistachio Cream & Kunafa. A luxurious dark chocolate bar filled with smooth pistachio cream and crunchy kunafa layers.',
      description: 'Savor the richness of Dubai Chocolate – Pistachio Cream & Kunafa. A luxurious dark chocolate bar filled with smooth pistachio cream and crunchy kunafa layers. A gourmet fusion of East and West, only at LE DAMAS.',
      price: 1799,
      originalPrice: 1999,
      cacaoPercentage: 70,
      weight: '200gm',
      origin: 'Single-Origin Cacao & Pistachio Creme',
      tastingNotes: ['Bittersweet Dark Cacao', 'Toasted Kataifi Crunch', 'Rich Pistachio Creme'],
      ingredients: ['70% Dark Chocolate', 'Sicilian Pistachios', 'Kataifi Pastry', 'Cocoa Butter'],
      dietaryBadges: ['Vegetarian', 'Single Origin', 'Artisanal Batch'],
      images: ['/Kunafa-Pistachio-Dark-Chocolate-1.png', '/Kunafa-Pistachio-Dark-Chocolate-2.png', '/Kunafa-Pistachio-Dark-Chocolate-3.png', '/Kunafa-Pistachio-Dark-Chocolate-4.png'],
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: false,
      categorySlug: 'dark-chocolate',
      rating: 4.98,
      reviewsCount: 128,
      inStock: true,
    },
    {
      slug: 'hazelnut-creme-milk-chocolate-110g',
      name: 'Hazelnut Creme Milk Chocolate - 110gm',
      tagline: 'Piedmont Style Roasted Hazelnut Gianduja Jar',
      shortDescription: 'Creamy milk chocolate jar spread infused with slow-roasted hazelnut gianduja creme.',
      description: 'A velvety 110g jar of milk chocolate gianduja made with slow-roasted hazelnuts and pure cocoa butter.',
      price: 749,
      originalPrice: 899,
      cacaoPercentage: null,
      weight: '110gm',
      origin: 'Roasted Hazelnut Gianduja',
      tastingNotes: ['Toasted Hazelnut', 'Smooth Milk Cacao', 'Vanilla Cream'],
      ingredients: ['Roasted Hazelnuts', 'Alpine Milk Chocolate', 'Cocoa Butter'],
      dietaryBadges: ['Piedmont Style Gianduja', 'Preservative Free'],
      images: ['/Hazelnut-Creme-Milk-Chocolate-1.png', '/Hazelnut-Creme-Milk-Chocolate-2.png', '/Hazelnut-Creme-Milk-Chocolate-3.png', '/Hazelnut-Creme-Milk-Chocolate-4.png'],
      isFeatured: false,
      isBestSeller: false,
      isNewRelease: false,
      categorySlug: 'milk-chocolate',
      rating: 4.8,
      reviewsCount: 38,
      inStock: true,
    },
    {
      slug: 'crispy-speculoos-creme-milk-chocolate-200g',
      name: 'Crispy Speculoos Creme Milk Chocolate - 200gm',
      tagline: 'Milk Chocolate Bar Filled with Spiced Speculoos & Crisp Biscuits',
      shortDescription: 'Decadent 200g milk chocolate bar with spiced Belgian speculoos cookie creme and crispy biscuit crunch.',
      description: '200g of smooth milk chocolate wrapped around a generous filling of spiced Belgian speculoos cookie butter and micro-crisp caramelized biscuit crumbles.',
      price: 1649,
      originalPrice: 1849,
      cacaoPercentage: null,
      weight: '200gm',
      origin: 'Belgian Cookie Infusion',
      tastingNotes: ['Caramel Cookie Butter', 'Warm Cinnamon', 'Smooth Milk Cacao'],
      ingredients: ['Milk Chocolate', 'Speculoos Cookie Butter', 'Crispy Biscuits'],
      dietaryBadges: ['Spiced Speculoos', '200gm Bar'],
      images: ['/Crispy-Speculoos-Creme-Milk-Chocolate-1.png', '/Crispy-Speculoos-Creme-Milk-Chocolate-2.png', '/Crispy-Speculoos-Creme-Milk-Chocolate-3.png', '/Crispy-Speculoos-Creme-Milk-Chocolate-4.png'],
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: false,
      categorySlug: 'milk-chocolate',
      rating: 4.92,
      reviewsCount: 94,
      inStock: true,
    },
    {
      slug: 'kunafa-pistachio-dark-chocolate-mini-bar-35g',
      name: 'Kunafa Pistachio Dark Chocolate – Mini Bar 35gm',
      tagline: '35g Snack-Sized Bittersweet Dark Kunafa Bar',
      shortDescription: 'Convenient 35g mini bar featuring dark chocolate packed with pistachio creme and Kunafa crunch.',
      description: 'The beloved Kunafa Pistachio Dark Chocolate bar crafted into a perfectly portioned 35g mini bar.',
      price: 499,
      originalPrice: 599,
      cacaoPercentage: 70,
      weight: '35gm',
      origin: 'Single Origin Cacao',
      tastingNotes: ['Rich Cocoa Depth', 'Crispy Kunafa', 'Nutty Pistachio'],
      ingredients: ['70% Dark Cacao', 'Pistachio Paste', 'Kataifi Pastry'],
      dietaryBadges: ['Mini Bar 35gm', 'Dark Chocolate', 'Snack Portion'],
      images: ['/Kunafa-Pistachio-Dark-Chocolate---Mini-Bar-35gm-1.png', '/Kunafa-Pistachio-Dark-Chocolate---Mini-Bar-35gm-2.png', '/Kunafa-Pistachio-Dark-Chocolate---Mini-Bar-35gm-3.png', '/Kunafa-Pistachio-Dark-Chocolate---Mini-Bar-35gm-4.png'],
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: false,
      categorySlug: 'mini-chocolate-bars',
      rating: 4.9,
      reviewsCount: 84,
      inStock: true,
    },
    {
      slug: 'crispy-speculoos-creme-milk-chocolate-mini-bar-35g',
      name: 'Crispy Speculoos Creme Milk Chocolate – Mini Bar 35gm',
      tagline: '35g Snack Bar Filled with Spiced Speculoos Cookie Creme',
      shortDescription: 'Pocket-sized 35g mini bar featuring milk chocolate stuffed with spiced speculoos cookie butter crunch.',
      description: 'Enjoy the warmth of spiced speculoos cookie butter encased in smooth milk chocolate in a portable 35g mini bar format.',
      price: 499,
      originalPrice: 599,
      cacaoPercentage: null,
      weight: '35gm',
      origin: 'Belgian Speculoos Infusion',
      tastingNotes: ['Speculoos Spice', 'Caramel Biscuit', 'Creamy Milk Cocoa'],
      ingredients: ['Milk Chocolate', 'Speculoos Spread', 'Biscuit Crunch'],
      dietaryBadges: ['Mini Bar 35gm', 'Snack Portion'],
      images: ['/Crispy-Speculoos-Creme-Milk-Chocolate---Mini-Bar-35gm-1.png', '/Crispy-Speculoos-Creme-Milk-Chocolate---Mini-Bar-35gm-2.png', '/Crispy-Speculoos-Creme-Milk-Chocolate---Mini-Bar-35gm-3.png', '/Crispy-Speculoos-Creme-Milk-Chocolate---Mini-Bar-35gm-4.png'],
      isFeatured: false,
      isBestSeller: false,
      isNewRelease: false,
      categorySlug: 'mini-chocolate-bars',
      rating: 4.82,
      reviewsCount: 45,
      inStock: true,
    },
    {
      slug: 'kunafa-pistachio-milk-chocolate-mini-bar-35g',
      name: 'Kunafa Pistachio Milk Chocolate – Mini Bar 35gm',
      tagline: '35g Mini Bar with Velvety Milk Chocolate & Crispy Kunafa Core',
      shortDescription: 'Delicate 35g snack bar featuring velvety milk chocolate filled with crisp Kataifi Kunafa and pistachio creme.',
      description: 'A 35g snack-sized indulgence featuring smooth alpine milk chocolate filled with slow-roasted pistachio creme and butter-crisped Kataifi Kunafa pastry.',
      price: 499,
      originalPrice: 599,
      cacaoPercentage: 42,
      weight: '35gm',
      origin: 'Alpine Milk & Mediterranean Pistachio',
      tastingNotes: ['Creamy Milk Cocoa', 'Crispy Kunafa', 'Nutty Pistachio'],
      ingredients: ['Alpine Milk Chocolate', 'Sicilian Pistachio', 'Kataifi Pastry'],
      dietaryBadges: ['Mini Bar 35gm', 'Alpine Milk', 'Kunafa Core'],
      images: ['/Kunafa-Pistachio-Milk-Chocolate---Mini-Bar-35gm-1.png', '/Kunafa-Pistachio-Milk-Chocolate---Mini-Bar-35gm-2.png', '/Kunafa-Pistachio-Milk-Chocolate---Mini-Bar-35gm-3.png', '/Kunafa-Pistachio-Milk-Chocolate---Mini-Bar-35gm-4.png'],
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: false,
      categorySlug: 'mini-chocolate-bars',
      rating: 4.93,
      reviewsCount: 78,
      inStock: true,
    },
    {
      slug: 'kunafa-pistachio-creme-110g',
      name: 'Kunafa and Pistachio Creme - 110gm',
      tagline: 'Artisanal Spread with Crispy Kataifi & Pure Pistachio',
      shortDescription: 'Luxurious stone-ground pistachio creme jar folded with butter-toasted crispy Kunafa pastry bits.',
      description: 'A decadent 110g jar of pure, unadulterated pistachio creme blended with micro-crisped golden Kunafa pastry.',
      price: 749,
      originalPrice: 899,
      cacaoPercentage: null,
      weight: '110gm',
      origin: 'Mediterranean Pistachios',
      tastingNotes: ['Roasted Pistachio', 'Crisp Phyllo Butter', 'Mild Honey Nectar'],
      ingredients: ['Pistachio Paste', 'Kataifi Pastry', 'Clarified Butter'],
      dietaryBadges: ['Stone Ground', 'Zero Artificial Colors'],
      images: ['/Kunafa-and-Pistachio-Creme-1.png', '/Kunafa-and-Pistachio-Creme-2.png', '/Kunafa-and-Pistachio-Creme-3.png', '/Kunafa-and-Pistachio-Creme-4.png'],
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: false,
      categorySlug: 'pistachio-chocolate',
      rating: 4.96,
      reviewsCount: 110,
      inStock: true,
    },
    {
      slug: 'kunafa-pistachio-milk-chocolate-200g',
      name: 'Kunafa Pistachio Milk Chocolate - 200gm',
      tagline: 'Creamy Milk Chocolate with Grand Kunafa & Pistachio Filling',
      shortDescription: 'Grand 200g milk chocolate bar loaded with luscious pistachio creme and toasted Kataifi crunch.',
      description: 'Indulge in 200 grams of velvety milk chocolate holding an abundant core of slow-roasted pistachio creme and butter-crisped Kunafa pastry.',
      price: 1599,
      originalPrice: 1799,
      cacaoPercentage: 42,
      weight: '200gm',
      origin: 'Alpine Milk & Mediterranean Pistachio',
      tastingNotes: ['Sweet Milk Cacao', 'Rich Pistachio Paste', 'Crisp Phyllo'],
      ingredients: ['Milk Chocolate', 'Pistachio Creme', 'Kataifi Pastry'],
      dietaryBadges: ['Handcrafted', '200gm'],
      images: ['/Kunafa-Pistachio-Milk-Chocolate-1.png', '/Kunafa-Pistachio-Milk-Chocolate-2.png', '/Kunafa-Pistachio-Milk-Chocolate-3.png', '/Kunafa-Pistachio-Milk-Chocolate-4.png'],
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: false,
      categorySlug: 'milk-chocolate',
      rating: 4.95,
      reviewsCount: 105,
      inStock: true,
    },
    {
      slug: 'hazelnut-creme-milk-chocolate-mini-bar-35g',
      name: 'Hazelnut Creme Milk Chocolate – Mini Bar 35gm',
      tagline: '35g Mini Bar with Roasted Hazelnut Gianduja Core',
      shortDescription: 'Delicate 35g snack bar featuring milk chocolate filled with silky roasted hazelnut creme.',
      description: 'A 35g snack-sized indulgence featuring smooth milk chocolate filled with rich roasted hazelnut gianduja creme.',
      price: 499,
      originalPrice: 599,
      cacaoPercentage: null,
      weight: '35gm',
      origin: 'Roasted Hazelnut Gianduja',
      tastingNotes: ['Roasted Hazelnut', 'Silky Milk Cacao'],
      ingredients: ['Milk Chocolate', 'Roasted Hazelnuts', 'Cocoa Butter'],
      dietaryBadges: ['Mini Bar 35gm', 'Hazelnut Gianduja'],
      images: ['/Hazelnut-Creme-Milk-Chocolate---Mini-Bar-35gm-1.png', '/Hazelnut-Creme-Milk-Chocolate---Mini-Bar-35gm-2.png', '/Hazelnut-Creme-Milk-Chocolate---Mini-Bar-35gm-3.png', '/Hazelnut-Creme-Milk-Chocolate---Mini-Bar-35gm-4.png'],
      isFeatured: false,
      isBestSeller: false,
      isNewRelease: false,
      categorySlug: 'mini-chocolate-bars',
      rating: 4.79,
      reviewsCount: 32,
      inStock: true,
    },
    {
      slug: 'lebubu-milk-chocolate-kunafa-pistachio',
      name: 'Lebubu Milk Chocolate – Kunafa Pistachio 25gm',
      tagline: 'Velvety Milk Chocolate Signature Creation with Kunafa & Pistachio (25gm)',
      shortDescription: 'Signature 25gm Lebubu milk chocolate bar handcrafted with silky cocoa alpine milk chocolate, toasted Kunafa, and rich pistachio creme.',
      description: 'Experience pure indulgence with the 25gm Lebubu Milk Chocolate – Kunafa Pistachio. Crafted with silky 42% cocoa milk chocolate, roasted pistachio creme, and butter-crisped Kataifi Kunafa.',
      price: 449,
      originalPrice: 549,
      cacaoPercentage: 42,
      weight: '25gm',
      origin: 'Handcrafted in Atelier',
      tastingNotes: ['Creamy Milk Cacao', 'Roasted Pistachio', 'Crispy Kunafa'],
      ingredients: ['42% Alpine Milk Chocolate', 'Sicilian Pistachios', 'Kataifi Pastry'],
      dietaryBadges: ['Handcrafted', 'Preservative Free', 'Signature Bar', '25gm Bar'],
      images: ['/Le-Bubu-1.png', '/Le-Bubu-2.png', '/Le-Bubu-3.png', '/Le-Bubu-4.png'],
      isFeatured: true,
      isBestSeller: true,
      isNewRelease: true,
      categorySlug: 'lebubu',
      rating: 4.99,
      reviewsCount: 145,
      inStock: true,
    },
  ];

  for (const prod of productsData) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) continue;

    const { categorySlug, ...prodData } = prod;

    const upsertedProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        ...prodData,
        categoryId,
      },
      create: {
        ...prodData,
        categoryId,
      },
    });

    // Create default primary image
    if (prod.images && prod.images.length > 0) {
      await prisma.productImage.deleteMany({
        where: { productId: upsertedProduct.id },
      });
      await prisma.productImage.create({
        data: {
          productId: upsertedProduct.id,
          url: prod.images[0],
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }

    // Create default variants
    await prisma.productVariant.deleteMany({
      where: { productId: upsertedProduct.id },
    });
    await prisma.productVariant.createMany({
      data: [
        {
          productId: upsertedProduct.id,
          name: 'Standard Bar (90g)',
          weight: prod.weight,
          price: prod.price,
          originalPrice: prod.originalPrice,
          inStock: true,
          variantType: 'Standard',
        },
        {
          productId: upsertedProduct.id,
          name: 'Grand Edition (180g)',
          weight: '180g',
          price: Math.round(prod.price * 1.8),
          originalPrice: prod.originalPrice ? Math.round(prod.originalPrice * 1.8) : null,
          inStock: true,
          variantType: 'Grand',
        },
      ],
    });
  }

  console.log(`✅ Products and variants seeded.`);
  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during DB seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
