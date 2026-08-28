"use client";

import Image from "next/image";

export interface PencilIconProps {
  className?: string;
}

export function PencilIcon({ className }: PencilIconProps) {
  return (
    <span className={`relative inline-block shrink-0 ${className ?? ""}`}>
      <Image
        src="/icons/edit-icon.png"
        alt="Edit"
        width={16}
        height={16}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
