import React from "react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    onPageChange(p);
  };

  const pages: (number | "...")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t bg-white">
      <div className="text-sm text-gray-600">
        Mostrando {start}-{end} de {total}
      </div>
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select
            className="border rounded-md px-2 py-1 text-sm bg-white text-gray-700"
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(parseInt(e.target.value))}
         >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / página
              </option>
            ))}
          </select>
        )}
        <div className="flex items-center gap-1">
          <button
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 text-gray-700 bg-white hover:bg-gray-50 bg-white"
            disabled={!canPrev}
            onClick={() => goTo(page - 1)}
          >
            Anterior
          </button>
          {pages.map((p, i) => (
            <button
              key={i}
              className={`px-3 py-1 border rounded-md text-sm ${
                p === page ? "bg-blue-600 text-white border-blue-600" : "text-gray-700 bg-white hover:bg-gray-50"
              } ${p === "..." ? "cursor-default" : ""}`}
              disabled={p === "..."}
              onClick={() => typeof p === "number" && goTo(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 text-gray-700 bg-white hover:bg-gray-50"
            disabled={!canNext}
            onClick={() => goTo(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
