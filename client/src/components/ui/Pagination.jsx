import { pageWindow } from '../../utils/pagination.js';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="pagination__page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      {pageWindow(page, totalPages).map((item) =>
        typeof item === 'string' ? (
          <span key={item} aria-hidden="true">&hellip;</span>
        ) : (
          <button
            key={item}
            type="button"
            className="pagination__page"
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button type="button" className="pagination__page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
