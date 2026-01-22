export default function GuardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-black animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-black animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-black animate-bounce" />
      </div>
    </div>
  );
}
