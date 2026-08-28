"use client";

import Image from "next/image";

export interface TrashIconProps {
  className?: string;
}

export function TrashIcon({ className }: TrashIconProps) {
  return (
    <span className={`relative inline-block shrink-0 ${className ?? ""}`}>
      <Image
        src="/icons/delete-icon.png"
        alt="Delete"
        width={16}
        height={16}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
