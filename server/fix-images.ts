import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixImages() {
  const products = await prisma.product.findMany();
  for (const p of products) {
    if (p.slug.includes('white-chocolate')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: ['/White-Chocolate-Hazelnut-Creme-1.png', '/White-Chocolate-Hazelnut-Creme-2.png', '/White-Chocolate-Hazelnut-Creme-3.png', '/White-Chocolate-Hazelnut-Creme-4.png'] } });
    } else if (p.slug.includes('speculoos-creme-kunafa-110g')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: ['/Speculoos-Creme-and-Kunafa-1.png', '/Speculoos-Creme-and-Kunafa-2.png', '/Speculoos-Creme-and-Kunafa-3.png', '/Speculoos-Creme-and-Kunafa-4.png'] } });
    } else if (p.slug.includes('kunafa-pistachio-dark-chocolate-200g')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: ['/Kunafa-Pistachio-Dark-Chocolate-1.png', '/Kunafa-Pistachio-Dark-Chocolate-2.png', '/Kunafa-Pistachio-Dark-Chocolate-3.png', '/Kunafa-Pistachio-Dark-Chocolate-4.png'] } });
    } else if (p.slug.includes('hazelnut-creme-milk-chocolate-110g')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: ['/Hazelnut-Creme-Milk-Chocolate-1.png', '/Hazelnut-Creme-Milk-Chocolate-2.png', '/Hazelnut-Creme-Milk-Chocolate-3.png', '/Hazelnut-Creme-Milk-Chocolate-4.png'] } });
    } else if (p.slug.includes('crispy-speculoos-creme-milk-chocolate-200g')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: ['/Crispy-Speculoos-Creme-Milk-Chocolate-1.png', '/Crispy-Speculoos-Creme-Milk-Chocolate-2.png', '/Crispy-Speculoos-Creme-Milk-Chocolate-3.png', '/Crispy-Speculoos-Creme-Milk-Chocolate-4.png'] } });
    } else if (p.slug.includes('kunafa-pistachio-dark-chocolate-mini-bar-35g')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: ['/Kunafa-Pistachio-Dark-Chocolate---Mini-Bar-35gm-1.png', '/Kunafa-Pistachio-Dark-Chocolate---Mini-Bar-35gm-2.png', '/Kunafa-Pistachio-Dark-Chocolate---Mini-Bar-35gm-3.png', '/Kunafa-Pistachio-Dark-Chocolate---Mini-Bar-35gm-4.png'] } });
    } else if (p.slug.includes('crispy-speculoos-creme-milk-chocolate-mini-bar-35g')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: ['/Crispy-Speculoos-Creme-Milk-Chocolate---Mini-Bar-35gm-1.png', '/Crispy-Speculoos-Creme-Milk-Chocolate---Mini-Bar-35gm-2.png', '/Crispy-Speculoos-Creme-Milk-Chocolate---Mini-Bar-35gm-3.png', '/Crispy-Speculoos-Creme-Milk-Chocolate---Mini-Bar-35gm-4.png'] } });
    } else if (p.slug.includes('kunafa-pistachio-milk-chocolate-mini-bar-35g')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: ['/Kunafa-Pistachio-Milk-Chocolate---Mini-Bar-35gm-1.png', '/Kunafa-Pistachio-Milk-Chocolate---Mini-Bar-35gm-2.png', '/Kunafa-Pistachio-Milk-Chocolate---Mini-Bar-35gm-3.png', '/Kunafa-Pistachio-Milk-Chocolate---Mini-Bar-35gm-4.png'] } });
    } else if (p.slug.includes('kunafa-pistachio-creme-110g')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: ['/Kunafa-and-Pistachio-Creme-1.png', '/Kunafa-and-Pistachio-Creme-2.png', '/Kunafa-and-Pistachio-Creme-3.png', '/Kunafa-and-Pistachio-Creme-4.png'] } });
    } else if (p.slug.includes('kunafa-pistachio-milk-chocolate-200g')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: ['/Kunafa-Pistachio-Milk-Chocolate-1.png', '/Kunafa-Pistachio-Milk-Chocolate-2.png', '/Kunafa-Pistachio-Milk-Chocolate-3.png', '/Kunafa-Pistachio-Milk-Chocolate-4.png'] } });
    } else if (p.slug.includes('hazelnut-creme-milk-chocolate-mini-bar-35g')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: ['/Hazelnut-Creme-Milk-Chocolate---Mini-Bar-35gm-1.png', '/Hazelnut-Creme-Milk-Chocolate---Mini-Bar-35gm-2.png', '/Hazelnut-Creme-Milk-Chocolate---Mini-Bar-35gm-3.png', '/Hazelnut-Creme-Milk-Chocolate---Mini-Bar-35gm-4.png'] } });
    } else if (p.slug.includes('lebubu')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: ['/Le-Bubu-1.png', '/Le-Bubu-2.png', '/Le-Bubu-3.png', '/Le-Bubu-4.png'] } });
    }
  }
  console.log('Images updated!');
}

fixImages().finally(() => prisma.$disconnect());
