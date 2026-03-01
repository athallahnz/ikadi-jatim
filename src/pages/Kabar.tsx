import { useParams } from "react-router-dom";
import EventsSection from "@/components/EventsSection";

const Kabar = () => {
  const { scope } = useParams();

  return (
    <section className="pt-24 pb-24 bg-cream islamic-pattern">
      <EventsSection scope={scope} compactTitle />
    </section>
  );
};

export default Kabar;
