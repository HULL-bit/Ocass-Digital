import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, ShoppingBag, ShieldCheck, Sparkles, LogIn, UserPlus } from 'lucide-react';
import ProfileCard from '../../components/cards/ProfileCard';
import CardSwap, { Card } from '../../components/cards/CardSwap';
import { mockData } from '../../services/api/mockApi';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Slides du Hero (images/vidéos) — carrousel pleine section
  const heroSlides = useMemo(
    () => [
      { type: 'video', src: '/Res/20450812-hd_1920_1080_30fps.mp4', headline: "L'écosystème des entreprises locales", sub: "Explorez les secteurs, découvrez des produits et connectez-vous.", cta: { label: 'Découvrir', href: '/catalogue' } },
      { type: 'image', src: '/Res/ent2.png', headline: 'Des vitrines premium', sub: 'Produits sélectionnés avec des présentations élégantes.', cta: { label: 'Voir les vitrines', href: '#vitrines' } },
      { type: 'image', src: '/Res/boutiqueMarie%20Diallo.jpg', headline: 'Rejoignez la plateforme', sub: 'Créez un compte pour profiter de toutes les fonctionnalités.', cta: { label: 'Se connecter', href: '/auth/login' } },
      { type: 'image', src: '/Res/entrepreneur.png', headline: 'Innovation et services', sub: 'Un réseau de professionnels à votre portée.', cta: { label: 'Voir le catalogue', href: '/catalogue' } },
      { type: 'image', src: '/Res/SuperMarche.jpg', headline: 'Qualité et confiance', sub: 'Des entreprises vérifiées et des produits authentiques.', cta: { label: 'Créer un compte', href: '/auth/register' } },
    ],
    []
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const goPrev = () => setActiveSlide((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  const goNext = () => setActiveSlide((i) => (i + 1) % heroSlides.length);
  useEffect(() => {
    const timer = setInterval(() => goNext(), 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // échantillons de données (montrer seulement quelques produits sur la Landing)
  const featuredProducts = mockData.products.slice(0, 6);

  const mockCompanies = [
    {
      id: '1',
      name: 'TechSolutions Sénégal',
      sector: 'Technologie',
      description: 'Solutions tech et électroniques',
      logo: '/Res/iwaria-inc-tvTFMDwH-cQ-unsplash.jpg',
      specialties: ['Logiciels', 'Matériel', 'Support']
    },
    {
      id: '2',
      name: 'Boutique Marie Diallo',
      sector: 'Commerce de détail',
      description: 'Mode et accessoires',
      logo: '/Res/boutque.jpg',
      specialties: ['Prêt-à-porter', 'Accessoires', 'Artisanat']
    },
    {
      id: '3',
      name: 'Pharmacie Moderne',
      sector: 'Santé',
      description: 'Produits pharmaceutiques',
      logo: '/Res/SuperMarche.jpg',
      specialties: ['Médicaments', 'Parapharmacie', 'Conseil']
    }
  ];

  // Produits illustratifs par entreprise - Seulement les 4 produits originaux de l'accueil
  const showcaseByCompany: Record<string, Array<{ id: string; title: string; price: number; image: string }>> = {
    '1': [
      { id: 'ts-1', title: 'Ordinateur Pro 14" M3', price: 1450000, image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop' },
      { id: 'ts-2', title: 'Casque Sans Fil ANC', price: 165000, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop' },
      { id: 'ts-3', title: 'Clavier Mécanique Pro', price: 120000, image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?q=80&w=800&auto=format&fit=crop' },
      { id: 'ts-4', title: 'Caméra 4K Créateur', price: 890000, image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop' },
    ],
    '2': [
      { id: 'bm-1', title: 'Robe Wax Royale', price: 95000, image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=800&auto=format&fit=crop' },
      { id: 'bm-2', title: 'Sac Cuir Artisan', price: 78000, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop' },
      { id: 'bm-3', title: 'Boubou Homme Brodé', price: 65000, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop' },
      { id: 'bm-4', title: 'Sandales Cuir Premium', price: 35000, image: 'https://images.unsplash.com/photo-1544966503-7cc4ac881e57?q=80&w=800&auto=format&fit=crop' },
    ],
    '3': [
      { id: 'pm-1', title: 'Vitamine C 1000mg', price: 8500, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop' },
      { id: 'pm-2', title: 'Gel Hydroalcoolique', price: 2500, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop' },
      { id: 'pm-3', title: 'Crème Solaire SPF50', price: 9800, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop' },
      { id: 'pm-4', title: 'Tensiomètre Bras', price: 29500, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=800&auto=format&fit=crop' },
    ],
  };

 

  // Refs pour carrousels
  const companiesTrackRef = useRef<HTMLDivElement | null>(null);
  const productsTrackRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll doux pour entreprises
  useEffect(() => {
    const el = companiesTrackRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
      // boucle
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto max-w-[1800px] p-3 md:p-4 rounded-[28px] border border-white/10 bg-gradient-to-b from-dark-900/40 to-dark-900/20 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden">
      {/* NAVBAR HEADER */}
      <header className="absolute top-0 left-0 right-0 z-40">
        <div className="pt-6 flex justify-center px-4">
          <div className="rounded-full px-6 py-3 border border-white/15 bg-white/5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06)] flex items-center justify-between gap-6 w-full max-w-6xl">
            <div className="flex items-center gap-4">
              <img src="/logo.svg" alt="Logo" className="h-12 w-12" />
              <span className="text-xl font-bold text-white">OCASS DIGITAL</span>
            </div>
            <nav className="flex items-center gap-3 md:gap-4 text-white/85">
              <Link 
                to="/auth/login" 
                className="p-2 rounded-full hover:bg-white/10 transition-all hover:scale-110 group"
                title="Connexion"
              >
                <LogIn className="w-5 h-5 md:w-6 md:h-6 group-hover:text-white transition" />
              </Link>
              <Link 
                to="/auth/register" 
                className="p-2 rounded-full hover:bg-white/10 transition-all hover:scale-110 group"
                title="Inscription"
              >
                <UserPlus className="w-5 h-5 md:w-6 md:h-6 group-hover:text-white transition" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO CAROUSEL PLEINE SECTION */}
      <section id="accueil" className="relative overflow-hidden h-[92vh] min-h-[640px]">
        {/* Slides */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          {heroSlides.map((s, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{ zIndex: index === activeSlide ? 1 : 0 }}
            >
              {s.type === 'video' && !videoError ? (
                <video
                  className="h-full w-full object-cover"
                  src={s.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/Res/iwaria-inc-JnOFLg09yRE-unsplash.jpg"
                  onError={() => {
                    console.error('Video error:', s.src);
                    setVideoError(true);
                  }}
                />
              ) : s.type === 'image' ? (
                <img
                  className="h-full w-full object-cover"
                  src={s.src}
                  alt={`slide ${index + 1}`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  style={{ filter: 'brightness(0.7)' }}
                  onLoad={() => console.log('Image loaded:', s.src)}
                  onError={(e) => {
                    console.error('Image error:', s.src);
                    const t = e.currentTarget as HTMLImageElement;
                    t.src = '/Res/boutique.jpg';
                  }}
                />
              ) : null}
            </div>
          ))}
          {/* Overlay pour améliorer la lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" style={{ zIndex: 2 }} />
        </div>

        {/* Contenu Hero */}
        <div className="relative h-full" style={{ zIndex: 20 }}>
          <div className="max-w-3xl mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-6 flex items-center justify-center">
                <button onClick={goNext} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/90 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.1)]">
                  <Sparkles className="h-4 w-4 text-electric-500" />
                  <span className="text-sm">Rejoignez-nous</span>
                </button>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight text-white/90 tracking-tight" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {heroSlides[activeSlide].headline}
              </h1>
              <p className="mt-6 text-xl sm:text-2xl text-white/80" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {heroSlides[activeSlide].sub}
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate(heroSlides[activeSlide].cta.href)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-white text-dark-900 hover:bg-gray-100 transition shadow-[0_1px_0_0_rgba(0,0,0,0.05)]"
                >
                  {heroSlides[activeSlide].cta.label}
                  <ArrowRight className="h-5 w-5" />
                </button>
                <Link
                  to="/catalogue"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-[#111827]/70 hover:bg-[#0f172a]/80 border border-white/10 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06)] transition"
                >
                  Voir le catalogue
                </Link>
              </div>
            </motion.div>
            {/* Indicateurs du carrousel */}
            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-2 w-2 rounded-full ${i === activeSlide ? 'bg-electric-500' : 'bg-white/40'}`}
                  aria-label={`Aller au slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ENTREPRENEURS EN VEDETTE
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Entrepreneurs en vedette</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockCompanies.map((c, idx) => (
            <ProfileCard
              key={`entre-${c.id}`}
              name={c.name}
              title={c.sector}
              handle={c.name.toLowerCase().replace(/\s+/g, '')}
              status="En ligne"
              contactText="Contacter"
              avatarUrl={c.logo}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              onContactClick={() => navigate('/auth/login')}
              className={idx % 2 === 0 ? 'shadow-2xl' : ''}
            />
          ))}
        </div>
      </section> */}

      {/* ENTREPRISES & SPÉCIALITÉS */}
      <section id="entreprises" className="max-w-[1600px] mx-auto px-6 py-14">
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="h-6 w-6 text-primary-600 dark:text-cyan-400" />
          <h2 className="text-2xl md:text-3xl font-bold">Entreprises et spécialités</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {mockCompanies.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-md shadow-xl p-8 hover:shadow-2xl transition"
            >
              <div className="flex items-center gap-5">
                <img src={c.logo} alt={c.name} className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/20" />
                <div>
                  <div className="font-semibold text-xl">{c.name}</div>
                  <div className="text-base text-gray-500 dark:text-gray-400">{c.sector}</div>
                </div>
              </div>
              <p className="mt-5 text-gray-600 dark:text-gray-300">{c.description}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {c.specialties.map((s) => (
                  <span key={s} className="px-4 py-1.5 rounded-full text-sm bg-primary-50 dark:bg-dark-800 text-primary-700 dark:text-cyan-300 border border-primary-100 dark:border-dark-700">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-gray-600 dark:text-gray-300">
          Intéressé(e) ? <button onClick={() => navigate('/auth/login')} className="underline text-primary-600 dark:text-cyan-400 hover:text-primary-700">Connectez-vous</button> ou{' '}
          <Link to="/auth/register" className="underline text-primary-600 dark:text-cyan-400 hover:text-primary-700">créez un compte</Link> pour en savoir plus.
        </div>
      </section>

      {/* PRODUITS EN VITRINE
      <section id="produits" className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-6 w-6 text-electric-500" />
          <h2 className="text-2xl md:text-3xl font-bold">Produits en vitrine</h2>
        </div>
        <div className="relative h-[600px]">
          <CardSwap cardDistance={70} verticalDistance={80} delay={5000} pauseOnHover={false} width={520} height={420}
            onCardClick={() => navigate('/catalogue')}>
            {featuredProducts.slice(0, 6).map((p) => (
              <Card key={p.id} className="overflow-hidden">
                <div className="relative h-full w-full">
                  <img src={p.image} alt={p.nom} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="font-semibold text-white text-xl line-clamp-1">{p.nom}</div>
                    <p className="mt-1 text-sm text-gray-200/90 line-clamp-2">{p.description_courte}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-electric-500 font-bold">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(p.prix_vente)}
                      </div>
                      <button onClick={() => navigate('/catalogue')} className="btn-primary px-4 py-2">Voir plus</button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>
      </section> */}

      {/* VITRINES PAR ENTREPRISE */}
      <section id="vitrines" className="max-w-[1600px] mx-auto px-6 pb-20 pt-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">Catalogue par entreprise</h2>
        <div className="space-y-16">
          {mockCompanies.map((c) => {
            const companyProducts = showcaseByCompany[c.id] || [];
            if (companyProducts.length === 0) {
              return null;
            }
            return (
              <div key={`showcase-${c.id}`} className="space-y-6">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                  <img src={c.logo} alt={c.name} className="h-14 w-14 rounded-xl object-cover ring-2 ring-white/20" />
                  <div>
                    <div className="font-bold text-xl">{c.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{c.sector}</div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {companyProducts.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35 }}
                    className="relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        loading="lazy"
                        onError={(e) => {
                          const t = e.currentTarget as HTMLImageElement;
                          t.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-dark-900/20 to-transparent" />
                    </div>
                    <div className="p-6">
                      <div className="font-bold text-xl line-clamp-2 mb-3 text-gray-900 dark:text-white">{item.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        Produit de qualité professionnelle avec garantie
                      </div>
                      <div className="mt-3 text-2xl text-primary-600 dark:text-cyan-400 font-bold">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(item.price)}
                      </div>
                      <div className="mt-6 flex items-center gap-3">
                        <button 
                          onClick={() => navigate('/auth/login')} 
                          className="flex-1 btn-secondary text-sm py-2.5"
                        >
                          Voir détails
                        </button>
                        <button 
                          onClick={() => navigate('/auth/login')} 
                          className="flex-1 btn-primary text-sm py-2.5"
                        >
                          Acheter
                        </button>
                      </div>
                    </div>
                    {/* bordure glow */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                  </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-white/5 dark:bg-dark-900/40 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.svg" alt="Logo" className="h-7 w-7" />
              <span className="font-semibold">OCASS DIGITAL</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Plateforme moderne pour découvrir, promouvoir et gérer vos activités commerciales.</p>
          </div>
          <div>
            <div className="font-semibold mb-3">Liens</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#accueil" className="hover:underline">Accueil</a></li>
              <li><a href="#entreprises" className="hover:underline">Entreprises</a></li>
              <li><a href="#produits" className="hover:underline">Produits</a></li>
              <li><a href="#vitrines" className="hover:underline">Vitrines</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Support</div>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/auth/login" className="hover:underline inline-flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Connexion
                </a>
              </li>
              <li><a href="/auth/register" className="hover:underline">Créer un compte</a></li>
              <li><a href="#" className="hover:underline">Aide & FAQ</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Suivez-nous</div>
            <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
              <a href="#" className="hover:text-primary-600">Facebook</a>
              <a href="#" className="hover:text-electric-500">Twitter/X</a>
              <a href="#" className="hover:text-cyan-500">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} OCASS DIGITAL. Tous droits réservés.</div>
      </footer>
    </div>
  );
};

export default LandingPage;


