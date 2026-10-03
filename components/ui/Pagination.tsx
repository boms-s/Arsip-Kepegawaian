interface PaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, pageCount, onPageChange }: PaginationProps) {
  const firstPage = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
  const lastPage = Math.min(pageCount, firstPage + 4);

  return (
    <nav className="employee-pagination" aria-label="Halaman daftar pegawai">
      <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        Sebelumnya
      </button>
      {Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index).map((page) => (
        <button
          key={page}
          type="button"
          className={page === currentPage ? "employee-page-active" : ""}
          aria-current={page === currentPage ? "page" : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button type="button" disabled={currentPage === pageCount} onClick={() => onPageChange(currentPage + 1)}>
        Berikutnya
      </button>
    </nav>
  );
}