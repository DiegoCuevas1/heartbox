import Image from "next/image";
import Link from "next/link";

interface CategoriesProps {
  onLinkClick?: (href: string) => void;
}

export default function Categories({ onLinkClick }: CategoriesProps) {
  const handleClick = (href: string) => {
    if (onLinkClick) {
      onLinkClick(href);
    }
  };
  // Define the categories
  const categories = [
    { id: 1, name: "Wedding Relics", image: "/images/wedding-relics.png" },
    { id: 2, name: "Christmas Relics", image: "/images/christmas-relics.png" },
    { id: 3, name: "Birthday Relics", image: "/images/birthday-relics.png" },
    {
      id: 4,
      name: "Anniversary Relics",
      image: "/images/anniversary-relics.png",
    },
    {
      id: 5,
      name: "Graduation Relics",
      image: "/images/graduation-relics.png",
    },
    { id: 6, name: "New Year Relics", image: "/images/new-year-relics.png" },
    { id: 7, name: "Halloween Relics", image: "/images/halloween-relics.png" },
    {
      id: 8,
      name: "Valentine's Relics",
      image: "/images/valentines-relics.png",
    },
  ];

  return (
    <div className="categories w-full">
      <ul className="max-h-72 overflow-y-auto space-y-3">
        {categories.map((category) => (
          <li
            key={category.id}
            onClick={() =>
              handleClick(
                `/categories/${category.name.toLowerCase().replace(" ", "-")}`
              )
            }
          >
            <Link
              href={`/categories/${category.name.toLowerCase().replace(" ", "-")}`}
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
