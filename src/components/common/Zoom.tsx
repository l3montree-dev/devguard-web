"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState, type FC } from "react";
import { Root } from "@radix-ui/react-portal";
import { Dialog } from "../ui/dialog";

function getImageSrc(src: ImageProps["src"]): string {
  if (typeof src === "string") {
    return src;
  }
  if ("default" in src) {
    return src.default.src;
  }
  return src.src;
}


const Zoomable = ()) => {
  useEffect(() => {
    
  }, [])
  return (
     <Root>
          <div
            className="fixed scale-100 z-[9999]
           transition-all top-0 left-0 right-0 bottom-0 bg-black/20"
            onClick={() => setIsOpen(false)}
          >
            <Image
              fill
              quality={100}
              {...props}
              className="object-contain"
              alt={props.alt}
              src={getImageSrc(props as any)}

            />
          </div>
        </Root>
  )
}
export const ImageZoom: FC<ImageProps> = (props) => {
  const imgRef = useRef<HTMLImageElement>(null!);
  const [isInsideAnchor, setIsInsideAnchor] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsInsideAnchor(imgRef.current.closest("a") !== null);
  }, []);

  const img = (
    <Image
      onClick={() => setIsOpen(true)}
      width={300}
      height={300}
      {...props}
      ref={imgRef}
      alt={props.alt}
    />
  );

  if (isInsideAnchor) {
    // There is no need to add zoom for images inside anchor tags
    return img;
  }

  return (
    <>
      {img}
      {isOpen && (
       
      )}
    </>
  );
};
