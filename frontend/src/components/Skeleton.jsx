import React from 'react';

const Skeleton = ({ variant = 'card', count = 1 }) => {
  const renderItems = () => {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(i);
    }
    return items;
  };

  return (
    <>
      {renderItems().map((idx) => {
        if (variant === 'stats') {
          return (
            <div key={idx} className="flex items-center gap-5 rounded-2xl border border-gray-155 bg-white p-5 shadow-sm animate-pulse">
              <div className="h-14 w-14 rounded-2xl bg-gray-200" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="h-6 w-16 rounded bg-gray-250" />
              </div>
            </div>
          );
        }

        if (variant === 'row') {
          return (
            <tr key={idx} className="animate-pulse border-b border-gray-100 last:border-b-0">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-200 shrink-0" />
                  <div className="h-4 w-36 rounded bg-gray-200" />
                </div>
              </td>
              <td className="py-4 px-4"><div className="h-4 w-24 rounded bg-gray-200" /></td>
              <td className="py-4 px-4"><div className="h-4 w-16 rounded bg-gray-200" /></td>
              <td className="py-4 px-4"><div className="h-4 w-28 rounded bg-gray-200" /></td>
              <td className="py-4 px-4 text-right"><div className="h-6 w-12 rounded bg-gray-250 ml-auto" /></td>
            </tr>
          );
        }

        if (variant === 'list') {
          return (
            <div key={idx} className="animate-pulse flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-12 w-12 rounded-xl bg-gray-200 shrink-0" />
                <div className="space-y-2 flex-1 max-w-md">
                  <div className="h-4 w-1/3 rounded bg-gray-250" />
                  <div className="h-3 w-1/4 rounded bg-gray-200" />
                </div>
              </div>
              <div className="h-6 w-16 rounded bg-gray-200 shrink-0 ml-4" />
            </div>
          );
        }

        if (variant === 'details') {
          return (
            <div key={idx} className="space-y-8 animate-pulse">
              <div className="h-[350px] w-full rounded-3xl bg-gray-200" />
              <div className="space-y-6 bg-white border border-gray-150 rounded-3xl p-6 sm:p-8">
                <div className="h-5 w-24 rounded bg-gray-200" />
                <div className="h-8 w-3/4 rounded bg-gray-250" />
                <div className="flex gap-4 items-center border-b border-gray-100 pb-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-5/6 rounded bg-gray-250" />
                </div>
              </div>
            </div>
          );
        }

        // Default card skeleton (Blog post card layout)
        return (
          <div key={idx} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-155 bg-white shadow-sm animate-pulse">
            <div className="aspect-video w-full bg-gray-200" />
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="h-3.5 w-16 rounded bg-gray-200" />
                <div className="h-5 w-11/12 rounded bg-gray-250" />
                <div className="h-3.5 w-28 rounded bg-gray-200" />
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                <div className="h-6 w-16 rounded bg-gray-200" />
                <div className="h-8 w-24 rounded bg-gray-250" />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Skeleton;
