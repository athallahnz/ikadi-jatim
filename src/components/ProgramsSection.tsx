import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as LucideIcons from "lucide-react";
import { HelpCircle, LucideProps } from "lucide-react";

/* ================= TYPES ================= */
type Program = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  order_num: number;
};

type LucideIconComponent = React.ForwardRefExoticComponent<
  LucideProps & React.RefAttributes<SVGSVGElement>
>;

const IconsRecord = LucideIcons as unknown as Record<
  string,
  LucideIconComponent
>;

/* ================= SUB-COMPONENT: DYNAMIC ICON ================= */
const DynamicIcon = ({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) => {
  if (!name) return <HelpCircle className={className} />;
  const IconComponent = IconsRecord[name];
  if (
    IconComponent &&
    (typeof IconComponent === "function" || typeof IconComponent === "object")
  ) {
    return <IconComponent className={className} />;
  }
  return <HelpCircle className={className} />;
};

/* ================= MAIN COMPONENT ================= */
const ProgramsSection = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("programs")
          .select("*")
          .order("order_num", { ascending: true });

        if (error) throw error;
        setPrograms(data || []);
      } catch (err) {
        console.error("Error loading programs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Jika masih loading, kita beri placeholder agar layout tidak loncat
  if (loading)
    return <div className="py-20 bg-cream text-center">Memuat Program...</div>;

  return (
    <section
      id="program"
      className="py-20 md:py-24 lg:py-28 bg-cream islamic-pattern relative"
    >
      <div className="container mx-auto px-6 relative z-10">
        {/* HEADER */}
        <div className="text-center mb-14 md:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Program Unggulan
          </h2>

          <div className="gold-divider mx-auto mb-4" />

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Program-program terstruktur yang dirancang untuk menjawab tantangan
            dakwah masa kini dan memperkuat peran da’i di tengah masyarakat.
          </p>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 max-w-6xl xl:max-w-7xl mx-auto">
          {programs.map((program, i) => (
            <div
              key={program.id}
              className="
                bg-card rounded-2xl
                p-6 md:p-7 lg:p-8
                border border-border
                hover:border-gold/30 hover:shadow-xl
                hover:-translate-y-1
                transition-all duration-300
                group
              "
              // Kita ganti animasi otomatis dengan transisi masuk manual agar data dinamis tetap terlihat
              style={{
                animation: `fadeInUp 0.5s ease-out forwards ${i * 0.1}s`,
                opacity: 0,
              }}
            >
              {/* ICON */}
              <div
                className="
                  w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
                  rounded-xl
                  bg-secondary
                  flex items-center justify-center
                  mb-4 md:mb-5
                  group-hover:bg-primary
                  transition-colors
                "
              >
                <DynamicIcon
                  name={program.icon}
                  className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary group-hover:text-primary-foreground transition-colors"
                />
              </div>

              {/* TITLE */}
              <h3 className="font-display font-semibold text-foreground mb-2 text-base md:text-lg lg:text-xl leading-snug">
                {program.title}
              </h3>

              {/* DESC */}
              <div
                className="text-sm md:text-base text-muted-foreground leading-relaxed prose prose-slate prose-sm max-w-none 
                           prose-p:leading-relaxed prose-p:m-0"
                dangerouslySetInnerHTML={{ __html: program.description }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* CSS internal untuk handle animasi manual agar tidak bentrok dengan library */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default ProgramsSection;
