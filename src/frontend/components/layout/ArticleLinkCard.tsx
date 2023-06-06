import React from "react";

interface Props {
  image: string;
  alt: string;
  img_height?: string;
  img_width?: string;
  text?: string;
  heading?: string;
  link?: string;
}

export default function ArticleLinkCard({
  image,
  alt,
  img_height,
  img_width,
  text,
  heading,
  link,
}: Props) {
  return (
    <div
      className="@relative @bg-black/50 @my-4 @shadow-black/60 @shadow-lg @cursor-pointer hover:@scale-105 @transition"
      style={{ width: img_width != null ? img_width : "auto" }}
    >
      <a href={link} className="@absolute @h-full @w-full"></a>
      <div className="@flex @flex-col @space-y-2">
        <img
          className="@w-full @max-h-[25vh] @object-cover"
          style={{
            height: img_height != null ? img_height : "auto",
            width: img_width != null ? img_width : "auto",
          }}
          src={image}
          alt={alt}
        ></img>
        <div className="@px-2 laptop:@px-4 @py-2 laptop:@pb-4 @space-y-4">
          <h2 className="@font-semibold">{heading}</h2>
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}
