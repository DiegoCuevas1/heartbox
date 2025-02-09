export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white z-[9999] items-center justify-center flex transition-opacity duration-300">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-links"></div>
    </div>
  );
}
