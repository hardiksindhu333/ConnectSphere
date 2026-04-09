export default function VideoCardSkeleton() {
  return (
    <div className="bg-white/5 p-3 rounded-xl animate-pulse">
      <div className="w-full h-48 rounded-lg bg-white/10" />
      <div className="mt-3 h-4 w-3/4 bg-white/10 rounded" />
      <div className="mt-2 h-3 w-full bg-white/10 rounded" />
      <div className="mt-2 h-3 w-5/6 bg-white/10 rounded" />
    </div>
  );
}

