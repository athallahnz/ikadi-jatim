import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Item = {
  content: string;
  link: string | null;
};

export default function RunningTextBar() {
  const [items, setItems] = useState<Item[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(30);

  /* scroll sync navbar */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* fetch supabase */
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("running_texts")
        .select("content, link")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setItems(data);
      }
    };

    fetchData();
  }, []);

  /* duration calc */
  useEffect(() => {
    if (!trackRef.current) return;
    const width = trackRef.current.scrollWidth / 2;
    setDuration(width / 80);
  }, [items]);

  if (!items.length) return null; // aman jika kosong

  const content = (
    <>
      {items.map((item, i) => (
        <span key={i} className="mx-8 inline-flex items-center gap-4">
          {item.link ? (
            <a href={item.link} className="hover:underline">
              {item.content}
            </a>
          ) : (
            item.content
          )}
          <span className="text-gold ml-12">✦</span>
        </span>
      ))}
    </>
  );

  return (
    <div
      className={`fixed left-0 right-0 z-40 overflow-hidden transition-colors duration-500 ${
        isScrolled
          ? "top-20 xl:top-24 bg-primary/95 backdrop-blur-lg border-b border-gold/40 shadow-sm"
          : "top-20 xl:top-24 bg-primary/80 backdrop-blur-md"
      }`}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-primary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-primary to-transparent" />

      <div
        ref={trackRef}
        className="ticker-track whitespace-nowrap text-primary-foreground py-2 text-sm md:text-base font-medium"
        style={{ animationDuration: `${duration}s` }}
      >
        {content}
        {content}
      </div>
    </div>
  );
}
