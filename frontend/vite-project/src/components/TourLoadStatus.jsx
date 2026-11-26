import Button from 'react-bootstrap/Button';

export default function TourLoadStatus({ message, onRetry }) {
  return (
    <div className="py-5 text-center">
      <p role={onRetry ? 'alert' : 'status'}>{message}</p>
      {onRetry && <Button variant="outline-dark" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function TourCatalogStatus({ catalog }) {
  if (catalog.loading) return <TourLoadStatus message="Loading tours…" />;
  if (catalog.tours) return <TourLoadStatus message="No tours are available right now." />;
  return <TourLoadStatus message="Unable to load tours." onRetry={catalog.refetch} />;
}
