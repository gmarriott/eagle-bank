export function FormAlert({ message }: { message: string }) {
  return (
    <div
      className="bg-negative-bg text-negative-text border border-[var(--border-alert)] rounded-md px-4 py-3 text-sm font-medium mb-4"
      role="alert"
    >
      {message}
    </div>
  );
}
