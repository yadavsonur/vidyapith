import { requireAdmin } from "@/lib/auth"; import { db } from "@/lib/db";
import { CategoryManager } from "./_components/category-manager";
export default async function CategoriesPage(){await requireAdmin();const categories=await db.category.findMany({include:{_count:{select:{courses:true}}},orderBy:{name:"asc"}});return <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6"><div><div className="text-[10px] font-mono uppercase tracking-widest text-ochre-700">Taxonomy</div><h1 className="font-serif text-3xl">Categories</h1></div><CategoryManager initialCategories={categories} /></div>}
