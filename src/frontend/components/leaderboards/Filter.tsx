import React from "react";

interface Props {
  label: string;
}

export default function Filter({ label }: Props) {
  return (
    <div className="@w-full">
      <label>{label}</label>
      <select className="@w-full @mt-2 @p-2 @rounded-md @bg-bg-secondary @border @border-bg-primary @shadow-lg @focus:ring-blue-500 @focus:border-blue-500">
        <option className="@p-2">1</option>
        <option className="@p-2">2</option>
        <option className="@p-2">3</option>
      </select>
    </div>
  );
}
