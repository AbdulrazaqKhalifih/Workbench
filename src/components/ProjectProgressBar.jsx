export default function ProjectProgressBar({ completed = 0, total = 0 }) {
  const safeTotal = Number(total) || 0;
  const safeCompleted = Math.min(Number(completed) || 0, safeTotal);
  const percent = safeTotal > 0 ? (safeCompleted / safeTotal) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-400">
        {safeCompleted} of {safeTotal} tasks complete
      </p>
    </div>
  );
}