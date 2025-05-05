"use client";

import Image, { type ImageProps } from "next/image";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  type FC,
} from "react";
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

const Zoomable = (props: {
  className: string;
  src: string;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  alt: string;
}) => {
  const [cls, setCls] = useState(
    "fixed z-[9999] transition-all top-0 left-0 right-0 bottom-0 bg-black/20 scale-0",
  );

  useEffect(() => {
    setCls(
      "fixed z-[9999] transition-all top-0 left-0 right-0 bottom-0 bg-black/20 scale-100",
    );
  }, []);
  return (
    <Root>
      <div className={cls} onClick={() => props.onOpenChange(false)}>
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
  );
};

export const ImageZoom: FC<ImageProps> = (props) => {
  const imgRef = useRef<HTMLImageElement>(null!);
  const [isInsideAnchor, setIsInsideAnchor] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const img = (
    <Image
      onClick={() => setIsOpen(true)}
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
        <Zoomable
          src={props.src as string}
          className={
            "fixed z-[9999] transition-all top-0 left-0 right-0 bottom-0 bg-black/20 scale-100"
          }
          onOpenChange={setIsOpen}
          alt={props.alt}
        />
      )}
    </>
  );
};
