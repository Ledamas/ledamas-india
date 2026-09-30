const { PrismaClient } = require('./server/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const specs = {
    'Chocolate Type': 'Dark Chocolate',
    'Cocoa Percentage': '41 - 50% Cocoa',
    'Flavour': 'Kunafa Pistachio',
    'Pack Size': '1 pcs',
    'Chocolate Texture': 'Crispy, Crunchy & Creamy',
    'Speciality': 'Real Pistachio & Authentic Pastry Fusion',
    'Flavour Family': 'Kunafa',
    'Protein Per 100 g': '7 g',
    'Total Carbohydrates Per 100 g': '52.6 g',
    'Total Sugar Per 100 g': '39.8 g',
    'Added Sugar Per 100 g': '29.8 g',
    'Total Fat Per 100 g': '32.2 g',
    'Trans Fat Per 100 g': '0.3 g',
    'Cholesterol Per 100 g': '19 mg',
    'Sodium Per 100 g': '140 mg',
    'Energy Per 100 g': '530 kcal',
    'Ingredients': 'Dark Chocolate (48%) (Cocoa Mass, Cocoa Butter, Sugar, Cocoa Powder, Emulsifiers (INS322, INS476), Salt). Pistachio Creme (32%) (Pistachio, Non Hydrogenated Palm Oil, Sugar, Milk Protein (From Cow), Skimmed Milk Powder (From Cow), Emulsifiers (INS322, INS476, INS471), Food Colors (INS141, INS100, INS133). Kunafa Dough (20%) (Wheat Flour, Sugar, Corn Starch, Non Hydrogenated Palm Oil, Salt).',
    'Unit': '1 pack',
    'FSSAI License': '13325998000806',
    'Allergen Information': 'Contains gluten (wheat), milk, soy and nuts',
    'Shelf Life': '12 months',
    'Taste Profile': 'Sweet',
    'Disclaimer': 'Every effort is made to maintain accuracy of all information. However, actual product packaging and materials may contain more and/or different information. It is recommended not to solely rely on the information presented.',
    'Length Without Packaging (in cm)': '7',
    'Breadth Without Packaging (in cm)': '1.4',
    'Height Without Packaging (in cm)': '15',
    'Customer Care Details': 'Email: info@blinkit.com',
    'Country of Origin': 'United Arab Emirates',
    'Manufacturer Name and Address': 'Le Damas Sweets L.L.C - Dubai United Arab Emirates',
    'Marketer Name and Address': 'Genecia Global Delights Pvt Ltd - Lig flat bearing no - 173, ground floor, block- A, pocket - 1, sector-16, rohini, north west, Delhi - 110089',
    'Return Policy': 'Only Replacement of the item is permitted, within 72 hours of purchase, if it is found to be of poor quality, damaged or incorrect. If the item is incorrect, please ensure that it is sealed, unused, and in original condition.',
    'Storage Tips': 'Store in a cool and dry place',
    'Alternate Unit': '200 g'
  };

  const product = await prisma.product.findFirst({
    where: { slug: { contains: 'kunafa' } }
  });
  
  if (product) {
    await prisma.product.update({
      where: { id: product.id },
      data: { specifications: specs, description: "Experience the viral sensation of Dubai-style dessert with the Le Damas Kunafa Pistachio Dark Chocolate Bar. A premium, velvety 48% dark chocolate shell snaps open to reveal a luxurious center: smooth, creamy pistachio paste blended perfectly with golden, crispy toasted kunafa pastry dough. Every bite delivers a deep, bittersweet cocoa balance, rich nutty sweetness, and a loud, satisfying crunch." }
    });
    console.log('Updated product with specifications:', product.name);
  } else {
    console.log('No kunafa product found.');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
