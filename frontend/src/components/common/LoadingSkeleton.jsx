const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderCardSkeleton = () => (
    <div className="card p-6 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 skeleton rounded-xl" />
          <div className="space-y-2">
            <div className="w-40 h-4 skeleton rounded" />
            <div className="w-24 h-3 skeleton rounded" />
          </div>
        </div>
        <div className="w-20 h-6 skeleton rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-3 skeleton rounded" />
        <div className="w-3/4 h-3 skeleton rounded" />
      </div>
      <div className="flex gap-2">
        <div className="w-16 h-6 skeleton rounded-full" />
        <div className="w-20 h-6 skeleton rounded-full" />
        <div className="w-14 h-6 skeleton rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="w-24 h-4 skeleton rounded" />
        <div className="w-20 h-8 skeleton rounded-lg" />
      </div>
    </div>
  );

  const renderProfileSkeleton = () => (
    <div className="card p-8 space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 skeleton rounded-full" />
        <div className="space-y-2">
          <div className="w-48 h-5 skeleton rounded" />
          <div className="w-32 h-4 skeleton rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="w-full h-10 skeleton rounded-lg" />
        <div className="w-full h-10 skeleton rounded-lg" />
        <div className="w-full h-10 skeleton rounded-lg" />
      </div>
    </div>
  );

  const renderStatsSkeleton = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-6 animate-pulse space-y-3">
          <div className="w-10 h-10 skeleton rounded-lg" />
          <div className="w-16 h-6 skeleton rounded" />
          <div className="w-24 h-3 skeleton rounded" />
        </div>
      ))}
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="card overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-32 h-5 skeleton rounded" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center gap-4">
          <div className="w-10 h-10 skeleton rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="w-40 h-4 skeleton rounded" />
            <div className="w-24 h-3 skeleton rounded" />
          </div>
          <div className="w-20 h-6 skeleton rounded-full" />
        </div>
      ))}
    </div>
  );

  const renderers = {
    card: renderCardSkeleton,
    profile: renderProfileSkeleton,
    stats: renderStatsSkeleton,
    table: renderTableSkeleton,
  };

  const render = renderers[type] || renderCardSkeleton;

  if (type === 'stats') return render();

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{render()}</div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
