import Image from "next/image";

export default function Categories() {
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
    <div className="categories">
      <ul className="max-h-72 overflow-y-auto space-y-2 rounded-xl  ">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center">
            <a
              href={`/categories/${category.name.toLowerCase().replace(" ", "-")}`}
              className="flex items-center group"
            >
              <Image
                src={category.image}
                alt={category.name}
                className="w-16 h-16 p-1 rounded-full border-2 group-hover:border-blue-500"
                width={60}
                height={60}
              />
              <span className="group-hover:text-blue-500 ml-2">
                {category.name}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
