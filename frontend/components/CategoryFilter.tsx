"use client";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect("")}
        className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
          selected === ""
            ? "bg-[#163f73] text-white"
            : "bg-white text-[#163f73] border border-[#163f73]/20 hover:bg-[#e9f4ff]"
        }`}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
            selected === cat
              ? "bg-[#163f73] text-white"
              : "bg-white text-[#163f73] border border-[#163f73]/20 hover:bg-[#e9f4ff]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
