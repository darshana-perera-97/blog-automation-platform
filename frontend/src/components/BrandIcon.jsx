function BrandIcon({ className = "h-5 w-5 sm:h-6 sm:w-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M6.5 7.5a2.5 2.5 0 0 1 2.5-2.5h5.2a3.3 3.3 0 1 1 0 6.6H9a2.5 2.5 0 1 0 0 5h8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16.5 14.2h1.9v4.8h-1.9z" fill="currentColor" />
      <path d="M19.6 14.2h1.9v4.8h-1.9z" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

export default BrandIcon;
