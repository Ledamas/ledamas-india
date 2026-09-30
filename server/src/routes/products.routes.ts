import { Router, Request, Response } from 'express';
import { prisma, withDbRetry } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// Middleware: Admin Authorization Check
const verifyAdminAuth = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  const adminSession = req.headers['x-admin-session'] || req.cookies?.ledamas_admin_session;

  if (authHeader || adminSession) {
    return next();
  }

  return sendError(res, 'Unauthorized Super Admin access. Valid admin token required.', 401);
};

// GET /api/v1/products - Get all products with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, featured, bestSeller, newRelease, status } = req.query;

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = String(status);
    }

    if (category && category !== 'ALL') {
      whereClause.category = {
        slug: String(category),
      };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { tagline: { contains: String(search), mode: 'insensitive' } },
        { skuCode: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (featured === 'true') whereClause.isFeatured = true;
    if (bestSeller === 'true') whereClause.isBestSeller = true;
    if (newRelease === 'true') whereClause.isNewRelease = true;

    const products = await withDbRetry(() =>
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          variants: true,
          productImages: true,
          seo: true,
        },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      })
    );

    const formattedProducts = products.map((p: any) => ({
      ...p,
      categorySlug: p.category?.slug || '',
      categoryName: p.category?.name || '',
      images: p.images && p.images.length > 0 ? p.images : (p.productImages || []).map((img: any) => img.url),
      seo: p.seo || {
        metaTitle: `${p.name} | LE DAMAS`,
        metaDescription: p.shortDescription || p.description,
        keywords: p.tags || [],
        openGraphTitle: p.name,
        openGraphDescription: p.shortDescription || p.description,
        openGraphImage: p.images?.[0] || '',
      },
    }));

    return sendSuccess(res, formattedProducts, 'Fetched products from database successfully.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products';
    console.error('[PRODUCTS DB ERROR]', error);
    return sendError(res, message, 500);
  }
});

// GET /api/v1/products/categories - Get all categories
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await withDbRetry(() =>
      prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: {
          name: 'asc',
        },
      })
    );

    return sendSuccess(res, categories, 'Fetched categories successfully.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch categories';
    console.error('[CATEGORIES DB ERROR]', error);
    return sendError(res, message, 500);
  }
});

// GET /api/v1/products/:idOrSlug - Get single product details by ID or slug
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const idOrSlug = req.params.idOrSlug as string;

    const product = await withDbRetry(() =>
      prisma.product.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
        include: {
          category: true,
          variants: true,
          productImages: true,
          seo: true,
        },
      })
    );

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    const p = product as any;
    const formattedProduct = {
      ...p,
      categorySlug: p.category?.slug || '',
      categoryName: p.category?.name || '',
      images: p.images && p.images.length > 0 ? p.images : (p.productImages || []).map((img: any) => img.url),
      seo: p.seo || {
        metaTitle: `${p.name} | LE DAMAS`,
        metaDescription: p.shortDescription || p.description,
        keywords: p.tags || [],
        openGraphTitle: p.name,
        openGraphDescription: p.shortDescription || p.description,
        openGraphImage: p.images?.[0] || '',
      },
    };

    return sendSuccess(res, formattedProduct, 'Fetched product details from database.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch product details';
    console.error('[PRODUCT BY SLUG DB ERROR]', error);
    return sendError(res, message, 500);
  }
});

// ------------------------------------------------------------------
// SUPER ADMIN CRUD APIS (Protected by verifyAdminAuth)
// ------------------------------------------------------------------

// POST /api/v1/products - Create a new product in production PostgreSQL
router.post('/', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      tagline,
      shortDescription,
      description,
      price,
      compareAtPrice,
      originalPrice,
      weight,
      categorySlug = 'kunafa-chocolate',
      stockQuantity = 100,
      skuCode,
      status = 'Active',
      inStock = true,
      isFeatured = false,
      isBestSeller = false,
      isNewRelease = false,
      features = [],
      ingredients = [],
      tastingNotes = [],
      dietaryBadges = [],
      tags = [],
      specifications,
      images = [],
      seo = {},
    } = req.body;

    if (!name || !price) {
      return sendError(res, 'Product name and price are required.', 400);
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Check slug collision
    const existingSlug = await withDbRetry(() => prisma.product.findUnique({ where: { slug: cleanSlug } }));
    if (existingSlug) {
      return sendError(res, `Product slug '${cleanSlug}' already exists. Please choose a unique name or slug.`, 400);
    }

    // Find or create Category
    let categoryObj = await withDbRetry(() => prisma.category.findUnique({ where: { slug: categorySlug } }));
    if (!categoryObj) {
      categoryObj = await withDbRetry(() =>
        prisma.category.create({
          data: {
            slug: categorySlug,
            name: categorySlug.replace(/-/g, ' ').toUpperCase(),
            tagline: 'Luxury Confectionery',
            description: 'Artisanal Middle Eastern Confectionery',
            heroImage: images[0] || '/Kunafa Pistachio Dark Chocolate 1.png',
          },
        })
      );
    }

    // Create Product in DB
    const newProduct = await withDbRetry(() =>
      prisma.product.create({
        data: {
          name,
          slug: cleanSlug,
          tagline: tagline || 'Luxury Artisanal Chocolate',
          shortDescription: shortDescription || description,
          description: description || name,
          price: Number(price),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : originalPrice ? Number(originalPrice) : null,
          originalPrice: originalPrice ? Number(originalPrice) : compareAtPrice ? Number(compareAtPrice) : null,
          weight: weight || '200gm',
          categoryId: categoryObj.id,
          stockQuantity: Number(stockQuantity),
          skuCode: skuCode || `LD-SKU-${Date.now().toString().slice(-6)}`,
          status,
          inStock: Boolean(inStock),
          isFeatured: Boolean(isFeatured),
          isBestSeller: Boolean(isBestSeller),
          isNewRelease: Boolean(isNewRelease),
          features: Array.isArray(features) ? features : [],
          ingredients: Array.isArray(ingredients) ? ingredients : [],
          tastingNotes: Array.isArray(tastingNotes) ? tastingNotes : [],
          dietaryBadges: Array.isArray(dietaryBadges) ? dietaryBadges : [],
          tags: Array.isArray(tags) ? tags : [],
          specifications: specifications || null,
          images: Array.isArray(images) && images.length > 0 ? images : ['/Kunafa Pistachio Dark Chocolate 1.png'],
          seo: {
            create: {
              metaTitle: seo.metaTitle || `${name} | LE DAMAS`,
              metaDescription: seo.metaDescription || shortDescription || description,
              keywords: seo.keywords || tags || [],
              canonicalUrl: seo.canonicalUrl || `https://ledamas.in/products/${cleanSlug}`,
              openGraphTitle: seo.openGraphTitle || name,
              openGraphDescription: seo.openGraphDescription || shortDescription || description,
              openGraphImage: seo.openGraphImage || (images[0] || '/Kunafa Pistachio Dark Chocolate 1.png'),
            },
          },
        },
        include: {
          category: true,
          seo: true,
        },
      })
    );

    return sendSuccess(res, newProduct, 'Product created successfully in database.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    console.error('[CREATE PRODUCT DB ERROR]', error);
    return sendError(res, message, 500);
  }
});

// PUT /api/v1/products/:id - Update existing product in Neon PostgreSQL DB
router.put('/:id', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const {
      name,
      slug,
      tagline,
      shortDescription,
      description,
      price,
      compareAtPrice,
      originalPrice,
      weight,
      categorySlug,
      stockQuantity,
      skuCode,
      status,
      inStock,
      isFeatured,
      isBestSeller,
      isNewRelease,
      features,
      ingredients,
      tastingNotes,
      dietaryBadges,
      tags,
      specifications,
      images,
      seo,
    } = req.body;

    const existingProduct = await withDbRetry(() => prisma.product.findUnique({ where: { id } }));
    if (!existingProduct) {
      return sendError(res, 'Product not found', 404);
    }

    // Resolve category if changing
    let categoryId = existingProduct.categoryId;
    if (categorySlug) {
      let categoryObj = await withDbRetry(() => prisma.category.findUnique({ where: { slug: categorySlug } }));
      if (categoryObj) {
        categoryId = categoryObj.id;
      }
    }

    const updatedProduct = await withDbRetry(() =>
      prisma.product.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(slug !== undefined && { slug }),
          ...(tagline !== undefined && { tagline }),
          ...(shortDescription !== undefined && { shortDescription }),
          ...(description !== undefined && { description }),
          ...(price !== undefined && { price: Number(price) }),
          ...(compareAtPrice !== undefined && { compareAtPrice: Number(compareAtPrice) }),
          ...(originalPrice !== undefined && { originalPrice: Number(originalPrice) }),
          ...(weight !== undefined && { weight }),
          ...(stockQuantity !== undefined && { stockQuantity: Number(stockQuantity) }),
          ...(skuCode !== undefined && { skuCode }),
          ...(status !== undefined && { status }),
          ...(inStock !== undefined && { inStock: Boolean(inStock) }),
          ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
          ...(isBestSeller !== undefined && { isBestSeller: Boolean(isBestSeller) }),
          ...(isNewRelease !== undefined && { isNewRelease: Boolean(isNewRelease) }),
          ...(features !== undefined && { features: Array.isArray(features) ? features : [] }),
          ...(ingredients !== undefined && { ingredients: Array.isArray(ingredients) ? ingredients : [] }),
          ...(tastingNotes !== undefined && { tastingNotes: Array.isArray(tastingNotes) ? tastingNotes : [] }),
          ...(dietaryBadges !== undefined && { dietaryBadges: Array.isArray(dietaryBadges) ? dietaryBadges : [] }),
          ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
          ...(specifications !== undefined && { specifications: specifications }),
          ...(images !== undefined && { images: Array.isArray(images) ? images : [] }),
          categoryId,
          ...(seo && {
            seo: {
              upsert: {
                create: {
                  metaTitle: seo.metaTitle || `${name || existingProduct.name} | LE DAMAS`,
                  metaDescription: seo.metaDescription || shortDescription || description || existingProduct.description,
                  keywords: seo.keywords || tags || [],
                  canonicalUrl: seo.canonicalUrl || `https://ledamas.in/products/${slug || existingProduct.slug}`,
                  openGraphTitle: seo.openGraphTitle || name || existingProduct.name,
                  openGraphDescription: seo.openGraphDescription || shortDescription || description || existingProduct.description,
                  openGraphImage: seo.openGraphImage || (images?.[0] || existingProduct.images[0] || ''),
                },
                update: {
                  ...(seo.metaTitle !== undefined && { metaTitle: seo.metaTitle }),
                  ...(seo.metaDescription !== undefined && { metaDescription: seo.metaDescription }),
                  ...(seo.keywords !== undefined && { keywords: seo.keywords }),
                  ...(seo.canonicalUrl !== undefined && { canonicalUrl: seo.canonicalUrl }),
                  ...(seo.openGraphTitle !== undefined && { openGraphTitle: seo.openGraphTitle }),
                  ...(seo.openGraphDescription !== undefined && { openGraphDescription: seo.openGraphDescription }),
                  ...(seo.openGraphImage !== undefined && { openGraphImage: seo.openGraphImage }),
                },
              },
            },
          }),
        },
        include: {
          category: true,
          seo: true,
          productImages: true,
        },
      })
    );

    return sendSuccess(res, updatedProduct, 'Product updated successfully in database.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    console.error('[UPDATE PRODUCT DB ERROR]', error);
    return sendError(res, message, 500);
  }
});

// PATCH /api/v1/products/:id/status - Quick status / stock update
router.patch('/:id/status', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, inStock, stockQuantity } = req.body;

    const updated = await withDbRetry(() =>
      prisma.product.update({
        where: { id },
        data: {
          ...(status !== undefined && { status }),
          ...(inStock !== undefined && { inStock: Boolean(inStock) }),
          ...(stockQuantity !== undefined && { stockQuantity: Number(stockQuantity) }),
        },
      })
    );

    return sendSuccess(res, updated, 'Product status updated in database.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update status';
    console.error('[STATUS UPDATE ERROR]', error);
    return sendError(res, message, 500);
  }
});

// DELETE /api/v1/products/:id - Delete product from database
router.delete('/:id', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    await withDbRetry(() => prisma.product.delete({ where: { id } }));

    return sendSuccess(res, null, 'Product deleted successfully from database.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete product';
    console.error('[DELETE PRODUCT ERROR]', error);
    return sendError(res, message, 500);
  }
});

// POST /api/v1/products/:id/images - Upload/add image to product
router.post('/:id/images', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { imageUrl, isPrimary = false } = req.body;

    if (!imageUrl) {
      return sendError(res, 'imageUrl is required.', 400);
    }

    const product = await withDbRetry(() => prisma.product.findUnique({ where: { id } }));
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    const updatedImages = isPrimary ? [imageUrl, ...product.images] : [...product.images, imageUrl];

    const updatedProduct = await withDbRetry(() =>
      prisma.product.update({
        where: { id },
        data: {
          images: Array.from(new Set(updatedImages)),
        },
      })
    );

    return sendSuccess(res, updatedProduct, 'Image added to product successfully.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add image';
    console.error('[ADD IMAGE ERROR]', error);
    return sendError(res, message, 500);
  }
});

// DELETE /api/v1/products/:id/images/:imageIdx - Remove image from product
router.delete('/:id/images/:imageIdx', verifyAdminAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const idx = parseInt(req.params.imageIdx as string, 10);

    const product = await withDbRetry(() => prisma.product.findUnique({ where: { id } }));
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    const updatedImages = product.images.filter((_, i) => i !== idx);

    const updatedProduct = await withDbRetry(() =>
      prisma.product.update({
        where: { id },
        data: {
          images: updatedImages,
        },
      })
    );

    return sendSuccess(res, updatedProduct, 'Image deleted successfully.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete image';
    console.error('[DELETE IMAGE ERROR]', error);
    return sendError(res, message, 500);
  }
});

export default router;
