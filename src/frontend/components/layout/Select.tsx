import { useState, useEffect } from "react";

export type SelectOption = {
  label: string;
  value: string | number;
};

type Props = {
  options: SelectOption[];
  value?: SelectOption;
  onChange: (value: SelectOption | undefined) => void;
  className?: string;
}

export default function Select({ value, onChange, options, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  function selectOption(option: SelectOption) {
    option !== value && onChange(option);
  }
  function isOptionSelected(option: SelectOption) {
    return option.value === value?.value;
  }

  useEffect(() => {
    isOpen && setHighlightedIndex(0);
  }, [isOpen]);

  return (
    <div className={className}>
      <div
        onBlur={() => setIsOpen(false)}
        onClick={() => setIsOpen((prev) => !prev)}
        tabIndex={0}
        className="@relative @cursor-pointer @w-full @min-h-2 @border @border-bg-tertiary @flex @items-center @gap-2 @p-2 @rounded @outline-none @bg-bg-tertiary @shadow-black/70 @shadow-md"
      >
        <span className="@grow @text-white @pl-2">{value?.label}</span>
        <div className="@bg-bg-secondary @w-0.5 @self-stretch"></div>
        <div className={`@font-mono @text-lg @duration-300 @px-1 ${isOpen && "@rotate-180"}`}>&#x25BC;</div>
        <ul
          className={`@absolute @m-0 @p-0 @list-none @overflow-y-auto no-scrollbar @shadow-black @shadow-lg @rounded @w-full @left-0 @top-[calc(100%_+_0.5em)] 
            @bg-bg-tertiary @z-50 @duration-500
            ${isOpen ? "@max-h-96" : "@max-h-0"}`}
        >
          {options.map((option, index) => (
            <li
              onClick={(e) => {
                e.stopPropagation();
                selectOption(option);
                setIsOpen(false);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              key={option.value}
              className={`@py-2 @px-4 @cursor-pointer 
                ${isOptionSelected(option) && "@bg-blue-500 hover:@bg-blue-900"}
                ${index === highlightedIndex && "@bg-bg-secondary"}
                `}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
