import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const resources = [
  {
    title: "How to Store Vegetables Properly",
    description: "Tips on storing fruits and vegetables to extend freshness.",
    url: "https://www.lovefoodhatewaste.com/article/how-store-fruit-and-veg",
    category: "waste reduction",
    type: "article"
  },
  {
    title: "FoodKeeper Storage Guide (USDA)",
    description: "USDA's official guide on food storage and shelf life.",
    url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
    category: "waste reduction",
    type: "article"
  },
  {
    title: "Reducing Wasted Food at Home (EPA)",
    description: "EPA-recommended steps for reducing household food waste.",
    url: "https://www.epa.gov/recycle/reducing-wasted-food-home",
    category: "waste reduction",
    type: "article"
  },
  {
    title: "UN WFP – Tips to Reduce Food Waste",
    description: "UN World Food Programme's tips for reducing food waste.",
    url: "https://www.wfp.org/stories/8-tips-reduce-your-food-waste",
    category: "waste reduction",
    type: "article"
  },
  {
    title: "WRAP Food Waste Action Guide",
    description: "Guidelines for reducing household food waste.",
    url: "https://wrap.org.uk/taking-action/food-waste",
    category: "waste reduction",
    type: "article"
  },
  {
    title: "NYT Beginner's Guide to Meal Planning",
    description: "A complete introduction to weekly meal planning.",
    url: "https://cooking.nytimes.com/guides/48-how-to-meal-plan",
    category: "meal planning",
    type: "article"
  },
  {
    title: "Meal Prep for Beginners",
    description: "Easy weekly meal prep tutorial for beginners.",
    url: "https://www.youtube.com/watch?v=8gF8h7v1wQk",
    category: "meal planning",
    type: "youtube"
  },
  {
    title: "Weekly Meal Planner Template (PDF)",
    description: "Printable template for planning meals weekly.",
    url: "https://www.vertex42.com/Files/pdfs/meal-planner.pdf",
    category: "meal planning",
    type: "pdf"
  },
  {
    title: "Harvard Healthy Eating Plate",
    description: "Evidence-based guide for building healthy meals.",
    url: "https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/",
    category: "nutrition tips",
    type: "article"
  },
  {
    title: "BBC GoodFood Budget-Friendly Recipes",
    description: "Affordable and nutritious recipe ideas.",
    url: "https://www.bbcgoodfood.com/recipes/collection/budget-recipes",
    category: "meal planning",
    type: "article"
  },
  {
    title: "WHO Healthy Diet Guidelines",
    description: "Science-based global dietary recommendations.",
    url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
    category: "nutrition tips",
    type: "article"
  },
  {
    title: "Healthy Eating Tips for Beginners",
    description: "Simple steps for building healthy eating habits.",
    url: "https://www.healthline.com/nutrition/healthy-eating-tips",
    category: "nutrition tips",
    type: "blog"
  },
  {
    title: "Macronutrients Explained",
    description: "Beginner-friendly breakdown of proteins, carbs, and fats.",
    url: "https://www.medicalnewstoday.com/articles/322744",
    category: "nutrition tips",
    type: "article"
  },
  {
    title: "High Protein Budget Meals",
    description: "Budget-friendly high protein meal ideas.",
    url: "https://www.youtube.com/watch?v=7Hc7Zlg9e48",
    category: "nutrition tips",
    type: "youtube"
  },
  {
    title: "50 Ways to Save Money on Groceries",
    description: "Practical techniques to reduce grocery spending.",
    url: "https://www.thepennyhoarder.com/save-money/save-money-groceries/",
    category: "budget meal tips",
    type: "blog"
  },
  {
    title: "Cheap & Healthy Foods (Harvard)",
    description: "Affordable healthy food list from Harvard Nutrition.",
    url: "https://www.hsph.harvard.edu/nutritionsource/cheap-healthy-foods/",
    category: "budget meal tips",
    type: "article"
  },
  {
    title: "Grocery Budgeting 101",
    description: "Beginner's guide to managing grocery expenses.",
    url: "https://moneyunder30.com/grocery-budget",
    category: "budget meal tips",
    type: "article"
  },
  {
    title: "Save Money with Batch Cooking",
    description: "Bulk meal prep to reduce monthly food expenses.",
    url: "https://www.youtube.com/watch?v=csuYqzJH5e8",
    category: "budget meal tips",
    type: "youtube"
  },
  {
    title: "Earth.org Sustainable Living Guide",
    description: "Beginner-friendly guide to living sustainably.",
    url: "https://www.earth.org/sustainable-living-guide/",
    category: "waste reduction",
    type: "article"
  },
  {
    title: "Zero Waste Kitchen Guide",
    description: "Tips for creating a low-waste kitchen environment.",
    url: "https://www.goingzerowaste.com/blog/zero-waste-kitchen/",
    category: "waste reduction",
    type: "blog"
  }
];

async function main() {
  console.log('Seeding resources...');
  
  // Clear existing resources
  await prisma.resource.deleteMany({});
  
  // Insert new resources
  for (const resource of resources) {
    await prisma.resource.create({
      data: resource
    });
  }
  
  console.log(`Seeded ${resources.length} resources`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

