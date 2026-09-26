import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// GET /api/v1/products - Get all products with optional category & search filter
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, featured, bestSeller, newRelease } = req.query;

    const whereClause: any = {};

    if (category) {
      whereClause.category = {
        slug: String(category),
      };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { tagline: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (featured === 'true') whereClause.isFeatured = true;
    if (bestSeller === 'true') whereClause.isBestSeller = true;
    if (newRelease === 'true') whereClause.isNewRelease = true;

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        variants: true,
        productImages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedProducts = products.map((p: any) => ({
      ...p,
      categorySlug: p.category?.slug || '',
      categoryName: p.category?.name || '',
      images: p.images && p.images.length > 0 ? p.images : (p.productImages || []).map((img: any) => img.url),
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
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return sendSuccess(res, categories, 'Fetched categories successfully.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch categories';
    console.error('[CATEGORIES DB ERROR]', error);
    return sendError(res, message, 500);
  }
});

// GET /api/v1/products/:slug - Get single product details by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        productImages: true,
      },
    });

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    const p = product as any;
    const formattedProduct = {
      ...p,
      categorySlug: p.category?.slug || '',
      categoryName: p.category?.name || '',
      images: p.images && p.images.length > 0 ? p.images : (p.productImages || []).map((img: any) => img.url),
    };

    return sendSuccess(res, formattedProduct, 'Fetched product details from database.');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch product details';
    console.error('[PRODUCT BY SLUG DB ERROR]', error);
    return sendError(res, message, 500);
  }
});

export default router;
