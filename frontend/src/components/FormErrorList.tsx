type FormErrorListProps = {
  messages: string[];
};

export function FormErrorList({ messages }: FormErrorListProps) {
  if (messages.length === 0) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
      <p className="text-sm font-medium text-red-800">Please fix the following:</p>
      <ul className="mt-2 list-inside list-disc text-sm text-red-700">
        {messages.map((msg, index) => (
          <li key={`${index}-${msg}`}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
