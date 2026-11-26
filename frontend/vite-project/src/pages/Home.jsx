import Footsteps from '../components/Footsteps';
import VideoCard from '../components/backGroundVideo/videoCardContainer';
import Carrousel from '../components/tourCardCarrousell/Carrousell';
import { TourCatalogStatus } from '../components/TourLoadStatus';
import { useTourCatalog } from '../services/tourResources';

export default function Home() {
  const catalog = useTourCatalog();

  return (
    <div className="home-surface">
      <Footsteps />
      <VideoCard />
      {catalog.tours?.length
        ? <Carrousel cardData={catalog.tours} />
        : <section id="tours"><TourCatalogStatus catalog={catalog} /></section>}
    </div>
  );
}
