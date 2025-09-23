export interface Subcategory {
  name: string;
  slug: string;
}

export interface Category {
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

const categories: Category[] = [
  {
    name: "Development & IT",
    slug: "development-it",
    subcategories: [
      { name: "Web Development", slug: "web-development" },
      { name: "Mobile App Development", slug: "mobile-app-development" },
      { name: "Software Development", slug: "software-development" },
      { name: "E-commerce Development", slug: "ecommerce-development" },
      { name: "Game Development", slug: "game-development" },
      { name: "Database Administration", slug: "database-administration" },
      { name: "DevOps & Cloud", slug: "devops-cloud" },
      { name: "AI & Machine Learning", slug: "ai-ml" },
      { name: "Data Science & Analytics", slug: "data-science" },
      { name: "Cybersecurity", slug: "cybersecurity" },
      { name: "QA & Testing", slug: "qa-testing" },
      { name: "Other Development", slug: "other-development" },
    ],
  },
  {
    name: "Design & Creative",
    slug: "design-creative",
    subcategories: [
      { name: "Graphic Design", slug: "graphic-design" },
      { name: "UI/UX Design", slug: "ui-ux-design" },
      { name: "Web & Mobile Design", slug: "web-mobile-design" },
      { name: "Branding & Logo Design", slug: "branding-logo" },
      { name: "Illustration", slug: "illustration" },
      { name: "3D Modeling & Animation", slug: "3d-modeling" },
      { name: "Video Editing & Motion Graphics", slug: "video-editing" },
      { name: "Photography", slug: "photography" },
      { name: "Other Creative", slug: "other-creative" },
    ],
  },
  {
    name: "Writing & Translation",
    slug: "writing-translation",
    subcategories: [
      { name: "Content Writing", slug: "content-writing" },
      { name: "Copywriting", slug: "copywriting" },
      { name: "Technical Writing", slug: "technical-writing" },
      { name: "Academic Writing & Research", slug: "academic-writing" },
      { name: "Editing & Proofreading", slug: "editing-proofreading" },
      { name: "Translation", slug: "translation" },
      { name: "Transcription", slug: "transcription" },
      { name: "Creative Writing", slug: "creative-writing" },
      { name: "Other Writing", slug: "other-writing" },
    ],
  },
  {
    name: "Sales & Marketing",
    slug: "sales-marketing",
    subcategories: [
      { name: "Digital Marketing", slug: "digital-marketing" },
      { name: "SEO & SEM", slug: "seo-sem" },
      { name: "Social Media Marketing", slug: "social-media" },
      { name: "Email Marketing", slug: "email-marketing" },
      { name: "Affiliate Marketing", slug: "affiliate-marketing" },
      { name: "Market Research", slug: "market-research" },
      { name: "Telemarketing & Telesales", slug: "telemarketing" },
      { name: "Other Marketing", slug: "other-marketing" },
    ],
  },
  {
    name: "Admin & Support",
    slug: "admin-support",
    subcategories: [
      { name: "Virtual Assistance", slug: "virtual-assistance" },
      { name: "Data Entry", slug: "data-entry" },
      { name: "Customer Support", slug: "customer-support" },
      { name: "Project Management", slug: "project-management" },
      { name: "Transcription & Typing", slug: "transcription-typing" },
      { name: "Other Admin Support", slug: "other-admin" },
    ],
  },
  {
    name: "Finance & Business",
    slug: "finance-business",
    subcategories: [
      { name: "Accounting", slug: "accounting" },
      { name: "Bookkeeping", slug: "bookkeeping" },
      { name: "Financial Analysis", slug: "financial-analysis" },
      { name: "Business Consulting", slug: "business-consulting" },
      { name: "HR & Recruiting", slug: "hr-recruiting" },
      { name: "Legal Consulting", slug: "legal-consulting" },
      { name: "Tax Preparation", slug: "tax-preparation" },
      { name: "Other Business", slug: "other-business" },
    ],
  },
  {
    name: "Engineering & Architecture",
    slug: "engineering-architecture",
    subcategories: [
      { name: "Civil Engineering", slug: "civil-engineering" },
      { name: "Mechanical Engineering", slug: "mechanical-engineering" },
      { name: "Electrical Engineering", slug: "electrical-engineering" },
      { name: "CAD & 3D Design", slug: "cad-3d" },
      { name: "Architecture", slug: "architecture" },
      { name: "Interior Design", slug: "interior-design" },
      { name: "Structural Engineering", slug: "structural-engineering" },
      { name: "Other Engineering", slug: "other-engineering" },
    ],
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    subcategories: [
      { name: "Fitness & Health", slug: "fitness-health" },
      { name: "Cooking & Recipes", slug: "cooking" },
      { name: "Travel & Planning", slug: "travel-planning" },
      { name: "Life Coaching", slug: "life-coaching" },
      { name: "Music & Audio", slug: "music-audio" },
      { name: "Other Lifestyle", slug: "other-lifestyle" },
    ],
  },
];

export default categories;
