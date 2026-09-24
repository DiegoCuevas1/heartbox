import Image from "next/image";
import Link from "next/link";
import { RELIC_CATEGORIES, categoryHref } from "@/utils/categories";

interface CategoriesProps {
  onLinkClick?: (href: string) => void;
}

export default function Categories({ onLinkClick }: CategoriesProps) {
  const handleClick = (href: string) => {
    if (onLinkClick) {
      onLinkClick(href);
    }
  };
  const categories = RELIC_CATEGORIES.map((name) => ({
    name: `${name} Relics`,
    href: categoryHref(name),
  }));

  return (
    <div className="categories w-full">
      <ul className="max-h-72 overflow-y-auto space-y-3">
        {categories.map((category) => (
          <li key={category.href} onClick={() => handleClick(category.href)}>
            <Link
              href={category.href}
              className="flex items-center group w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <Image
                src={`/images/icon-blue.png`}
                alt={category.name}
                className="w-12 h-12 rounded-full border-2 group-hover:border-blue-500 flex-shrink-0"
                width={48}
                height={48}
              />
              <span className="group-hover:text-blue-500 ml-3">
                {category.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="w-full flex justify-center items-center ">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-blue-500 cursor-pointer transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="7"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
