import React from "react";

interface Props {
  image: string;
  text?: string;
  heading?: string;
  link?: string;
}

export default function ArticleLinkCard({ image, text, heading, link }: Props) {
  return (
    <div className="@relative @bg-black/50 @my-4 @shadow-black/60 @shadow-lg @cursor-pointer hover:@scale-105 @transition">
      <a href={link} className="@absolute @h-full @w-full"></a>
      <div className="@flex @flex-col @space-y-2">
        <img
          className="@w-full @h-[20vh] laptop:@h-[22.5vh] @object-cover"
          src={image}
          alt={heading}
        ></img>
        <div className="@px-2 laptop:@px-4 @py-2 laptop:@pb-4 @space-y-4">
          <h2 className="@font-semibold">{heading}</h2>
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}
