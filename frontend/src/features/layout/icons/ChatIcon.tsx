export interface ChatIconProps {
  className?: string;
}

export function ChatIcon({ className }: ChatIconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337L5.05 21l1.395-3.72C5.512 15.042 5 13.574 5 12c0-4.556 4.029-8.25 9-8.25s9 3.694 9 8.25z"
      />
    </svg>
  );
}
