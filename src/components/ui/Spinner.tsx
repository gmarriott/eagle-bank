export function Spinner({ size = 20, label }: { size?: number; label?: string }) {
  return (
    <span
      className="spinner-ring"
      style={{ width: size, height: size }}
      role={label ? 'status' : undefined}
      aria-label={label}
    />
  );
}
