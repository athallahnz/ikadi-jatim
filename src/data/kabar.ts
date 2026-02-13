export type KabarItem = {
  id: string;
  title: string;
  slug: string;
  date: string;
  displayDate: string;
  excerpt: string;
  cover: string;
  content: string;
  scope: "jatim" | "daerah";
  daerah?: string;
  daerahSlug?: string;
};

export const kabarData: KabarItem[] = [
  {
    id: "1",
    title: "Musyawarah Wilayah 2026",
    slug: "musyawarah-wilayah-2026",
    date: "2026-05-20",
    displayDate: "20 Mei 2026",
    excerpt: "Evaluasi program strategis tingkat wilayah.",
    cover: "https://picsum.photos/800/600?random=1",
    scope: "jatim",
    content: `
      <p>PW IKADI Jawa Timur menyelenggarakan Musyawarah Wilayah 2026 sebagai forum strategis untuk mengevaluasi program dakwah serta merumuskan arah kebijakan organisasi ke depan.</p>

      <p>Kegiatan ini dihadiri oleh pengurus wilayah, perwakilan daerah, serta para tokoh dakwah yang memberikan masukan konstruktif bagi penguatan peran IKADI di tengah masyarakat.</p>

      <p>Ketua PW IKADI Jawa Timur menegaskan bahwa sinergi antar daerah menjadi kunci dalam menghadirkan dakwah yang rahmatan lil ‘alamin di era digital.</p>
    `,
  },
  {
    id: "2",
    title: "Pelatihan Da'i Surabaya",
    slug: "pelatihan-dai-surabaya",
    date: "2026-03-15",
    displayDate: "15 Maret 2026",
    excerpt: "Peningkatan kapasitas dakwah digital.",
    cover: "https://picsum.photos/800/600?random=2",
    scope: "daerah",
    daerah: "Surabaya",
    daerahSlug: "surabaya",
    content: `
      <p>PD IKADI Surabaya mengadakan pelatihan dai dengan fokus pada penguatan kompetensi dakwah digital di era media sosial.</p>

      <p>Peserta dibekali strategi penyampaian pesan Islam yang moderat dan relevan dengan generasi muda melalui platform digital.</p>

      <p>Kegiatan ini diharapkan mampu melahirkan dai yang adaptif terhadap perkembangan teknologi komunikasi.</p>
    `,
  },
  {
    id: "3",
    title: "Kajian Akbar Sidoarjo",
    slug: "kajian-akbar-sidoarjo",
    date: "2026-04-05",
    displayDate: "5 April 2026",
    excerpt: "Strategi dakwah era digital.",
    cover: "https://picsum.photos/800/600?random=3",
    scope: "daerah",
    daerah: "Sidoarjo",
    daerahSlug: "sidoarjo",
    content: `
      <p>PD IKADI Sidoarjo menyelenggarakan Kajian Akbar yang membahas strategi dakwah di tengah perubahan sosial masyarakat digital.</p>

      <p>Pemateri menekankan pentingnya narasi Islam rahmatan lil ‘alamin yang inklusif dan solutif terhadap problem umat.</p>

      <p>Antusiasme jamaah menunjukkan tingginya kebutuhan masyarakat terhadap kajian yang kontekstual dan mencerahkan.</p>
    `,
  },
  {
    id: "4",
    title: "Silaturahmi Da'i Gresik",
    slug: "silaturahmi-dai-gresik",
    date: "2026-06-18",
    displayDate: "18 Juni 2026",
    excerpt: "Memperkuat ukhuwah dan sinergi.",
    cover: "https://picsum.photos/800/600?random=4",
    scope: "daerah",
    daerah: "Gresik",
    daerahSlug: "gresik",
    content: `
      <p>PD IKADI Gresik menggelar kegiatan silaturahmi antar dai untuk memperkuat ukhuwah dan kolaborasi dakwah.</p>

      <p>Forum ini menjadi ruang berbagi pengalaman lapangan serta tantangan dakwah di masyarakat.</p>

      <p>Diharapkan sinergi antar dai semakin solid dalam menghadirkan nilai Islam yang damai dan membangun.</p>
    `,
  },
  {
    id: "5",
    title: "Seminar Dakwah Malang",
    slug: "seminar-dakwah-malang",
    date: "2026-07-09",
    displayDate: "9 Juli 2026",
    excerpt: "Islam rahmatan lil alamin.",
    cover: "https://picsum.photos/800/600?random=5",
    scope: "daerah",
    daerah: "Malang",
    daerahSlug: "malang",
    content: `
      <p>PD IKADI Malang mengadakan seminar dakwah dengan tema Islam Rahmatan Lil ‘Alamin sebagai solusi peradaban.</p>

      <p>Materi menyoroti pentingnya pendekatan dakwah yang humanis, edukatif, dan relevan dengan kebutuhan masyarakat modern.</p>

      <p>Peserta berasal dari berbagai kalangan dai, mahasiswa, dan aktivis dakwah lokal.</p>
    `,
  },
  {
    id: "6",
    title: "Pelatihan Konten Digital",
    slug: "pelatihan-konten-digital",
    date: "2026-08-22",
    displayDate: "22 Agustus 2026",
    excerpt: "Strategi dakwah media sosial.",
    cover: "https://picsum.photos/800/600?random=6",
    scope: "jatim",
    content: `
      <p>PW IKADI Jawa Timur menyelenggarakan pelatihan pembuatan konten dakwah digital bagi para dai muda.</p>

      <p>Pelatihan mencakup teknik storytelling Islam, desain visual dakwah, serta optimalisasi platform media sosial.</p>

      <p>Program ini merupakan bagian dari strategi dakwah digital wilayah.</p>
    `,
  },
  {
    id: "7",
    title: "Rapat Kerja Wilayah",
    slug: "rapat-kerja-wilayah",
    date: "2026-02-10",
    displayDate: "10 Februari 2026",
    excerpt: "Perencanaan program dakwah.",
    cover: "https://picsum.photos/800/600?random=7",
    scope: "jatim",
    content: `
      <p>PW IKADI Jawa Timur melaksanakan Rapat Kerja Wilayah untuk menyusun rencana program dakwah tahunan.</p>

      <p>Fokus utama adalah penguatan pembinaan dai, perluasan jaringan dakwah, serta peningkatan layanan umat.</p>

      <p>Rakerwil menjadi momentum konsolidasi organisasi tingkat wilayah.</p>
    `,
  },
  {
    id: "8",
    title: "Kajian Ramadhan Lamongan",
    slug: "kajian-ramadhan-lamongan",
    date: "2026-02-14",
    displayDate: "14 Februari 2026",
    excerpt: "Persiapan dakwah Ramadhan.",
    cover: "https://picsum.photos/800/600?random=8",
    scope: "daerah",
    daerah: "Lamongan",
    daerahSlug: "lamongan",
    content: `
      <p>PD IKADI Lamongan mengadakan kajian khusus persiapan dakwah Ramadhan bagi para dai dan pengurus masjid.</p>

      <p>Kajian membahas materi khutbah, manajemen kegiatan Ramadhan, serta pendekatan dakwah keluarga.</p>

      <p>Kegiatan ini bertujuan meningkatkan kualitas pelayanan dakwah selama bulan suci.</p>
    `,
  },
  {
    id: "9",
    title: "Workshop Media Dakwah",
    slug: "workshop-media-dakwah",
    date: "2026-02-01",
    displayDate: "1 Februari 2026",
    excerpt: "Optimalisasi media sosial.",
    cover: "https://picsum.photos/800/600?random=9",
    scope: "jatim",
    content: `
      <p>PW IKADI Jawa Timur mengadakan workshop media dakwah untuk meningkatkan kualitas publikasi kegiatan dakwah.</p>

      <p>Peserta belajar strategi komunikasi visual, branding dakwah, dan pengelolaan media organisasi.</p>

      <p>Diharapkan publikasi dakwah IKADI semakin profesional dan luas jangkauannya.</p>
    `,
  },
  {
    id: "10",
    title: "Silaturahmi Da'i Kediri",
    slug: "silaturahmi-dai-kediri",
    date: "2026-01-28",
    displayDate: "28 Januari 2026",
    excerpt: "Penguatan jaringan dakwah.",
    cover: "https://picsum.photos/800/600?random=10",
    scope: "daerah",
    daerah: "Kediri",
    daerahSlug: "kediri",
    content: `
      <p>PD IKADI Kediri menyelenggarakan silaturahmi dai untuk memperkuat jaringan dakwah daerah.</p>

      <p>Pertemuan membahas kolaborasi program dakwah antar masjid dan lembaga pendidikan Islam.</p>

      <p>Suasana keakraban menunjukkan kuatnya ukhuwah antar dai Kediri.</p>
    `,
  },
];
