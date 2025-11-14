import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ChevronUp, Sparkles, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';


const LoginPage: React.FC = () => {
  console.log('LoginPage component is rendering');
  
  const [showHomePage, setShowHomePage] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin',
  });
  
  // Emails suggérés selon le type d'utilisateur (testés et fonctionnels)
  const suggestedEmails = {
    admin: [
      { email: 'admin@platform.com', name: 'Super Admin', password: 'password' },
      { email: 'admin2@platform.com', name: 'Moussa Fall', password: 'admin123' },
      { email: 'admin3@platform.com', name: 'Khadija Ndiaye', password: 'admin123' },
      // { email: 'admin1@platform.com', name: 'Aminata Diop', password: 'admin123' },
      // { email: 'admin4@platform.com', name: 'Ibrahima Sow', password: 'admin123' },
      // { email: 'admin5@platform.com', name: 'Aïcha Ba', password: 'admin123' }
    ],
    entrepreneur: [
      { email: 'fatou@pharmaciemoderne.sn', name: 'Fatou Sow (Pharmacie)', password: 'password' },
      { email: 'marie@boutiquemarie.sn', name: 'Marie Diallo (Boutique)', password: 'password' },
      { email: 'amadou@techsolutions.sn', name: 'Amadou Ba (Tech)', password: 'password' }
    ],
    client: [
      { email: 'client1@example.com', name: 'Abdou Samb', password: 'password' },
      { email: 'client2@example.com', name: 'Aïcha Fall', password: 'password' },
      { email: 'client3@example.com', name: 'Moussa Ndiaye', password: 'password' }
    ]
  };
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Toujours appeler tous les hooks dans le même ordre
  const navigate = useNavigate();
  const authContext = useAuth();
  const notificationContext = useNotifications();
  
  const login = authContext.login;
  const addNotification = notificationContext.addNotification;

  // Slides du carousel (mêmes que dans LandingPage)
  const heroSlides = useMemo(
    () => [
      { type: 'video', src: '/Res/20450812-hd_1920_1080_30fps.mp4', headline: "L'écosystème des entreprises locales", sub: "Explorez les secteurs, découvrez des produits et connectez-vous." },
      { type: 'image', src: '/Res/ent2.png', headline: 'Des vitrines premium', sub: 'Produits sélectionnés avec des présentations élégantes.' },
      { type: 'image', src: '/Res/boutiqueMarie%20Diallo.jpg', headline: 'Rejoignez la plateforme', sub: 'Créez un compte pour profiter de toutes les fonctionnalités.' },
      { type: 'image', src: '/Res/entrepreneur.png', headline: 'Innovation et services', sub: 'Un réseau de professionnels à votre portée.' },
      { type: 'image', src: '/Res/SuperMarche.jpg', headline: 'Qualité et confiance', sub: 'Des entreprises vérifiées et des produits authentiques.' },
    ],
    []
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [videoError, setVideoError] = useState(false);
  
  const goNext = () => setActiveSlide((i) => (i + 1) % heroSlides.length);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((i) => (i + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('LoginPage handleSubmit called with:', formData);

    // Validation côté frontend
    const emailDomain = formData.email.split('@')[1];
    const isAdminEmail = emailDomain === 'platform.com';
    const isEntrepreneurEmail = emailDomain === 'pharmaciemoderne.sn' || emailDomain === 'boutiquemarie.sn' || emailDomain === 'techsolutions.sn' || emailDomain === 'business.sn';
    const isClientEmail = emailDomain === 'example.com';

    // Vérifier la cohérence entre l'email et le type
    let emailTypeMismatch = false;
    if (formData.role === 'admin' && !isAdminEmail) {
      emailTypeMismatch = true;
    } else if (formData.role === 'entrepreneur' && !isEntrepreneurEmail) {
      emailTypeMismatch = true;
    } else if (formData.role === 'client' && !isClientEmail) {
      emailTypeMismatch = true;
    }

    if (emailTypeMismatch) {
      addNotification({
        type: 'error',
        title: 'Incohérence détectée',
        message: `L'email ne correspond pas au type ${formData.role}. Veuillez choisir un email approprié.`,
      });
      setLoading(false);
      return;
    }

    try {
      const success = await login(formData.email, formData.password, formData.role);
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Connexion réussie',
          message: 'Bienvenue sur la plateforme OCASS DIGITAL!',
        });
        // Rediriger les clients directement vers le catalogue
        if (formData.role === 'client') {
          navigate('/client/catalog');
        } else {
          navigate(`/${formData.role}`);
        }
      } else {
        addNotification({
          type: 'error',
          title: 'Échec de la connexion',
          message: 'Email, mot de passe ou rôle incorrect.',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur de connexion',
        message: 'Une erreur inattendue s\'est produite.',
      });
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string, password: string, role: string) => {
    setFormData({ email, password, role });
  };

  // Fonction pour changer le type d'utilisateur et suggérer un email
  const handleRoleChange = (newRole: string) => {
    const suggestions = suggestedEmails[newRole as keyof typeof suggestedEmails];
    const suggestedEmail = suggestions[0].email;
    setFormData(prev => ({ 
      ...prev, 
      role: newRole,
      email: suggestedEmail // Suggérer automatiquement le premier email
    }));
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center p-0">
      <div className="w-full max-w-none" style={{ width: '90vw', maxWidth: 'none', minWidth: '90vw' }}> 
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="glass-morphism rounded-3xl p-4 shadow-2xl w-full"
        >
          <div className="flex w-full h-full rounded-3xl justify-center" style={{ gap: '30px', width: '100%' }}>
            {/* Section Carousel - 2/3 du bloc */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden lg:flex relative overflow-hidden"
              style={{ width: 'calc(70% - 2px)' }}
            >
              <div className="w-full h-full rounded-3xl overflow-hidden relative">
                {/* Slides du carousel */}
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
                
                {/* Overlay avec contenu */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8" style={{ zIndex: 20 }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 mb-8 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                  >
                    <img 
                      src="/logo.svg" 
                      alt="OCASS DIGITAL Logo" 
                      className="w-16 h-16"
                    />
                  </motion.div>
                  
                  <motion.div
                    key={activeSlide}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mb-6"
                  >
                    <div className="mb-6 flex items-center justify-center">
                      <button className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/90 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.1)]">
                        <Sparkles className="h-4 w-4 text-electric-500" />
                        <span className="text-sm">Rejoignez-nous</span>
                      </button>
                    </div>
                    <h1 className="text-5xl font-extrabold leading-tight mb-6" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {heroSlides[activeSlide].headline}
                    </h1>
                    <p className="text-xl max-w-md mx-auto" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {heroSlides[activeSlide].sub}
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="grid grid-cols-3 gap-6 text-center"
                  >
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl mb-2"></div>
                      <h3 className="font-semibold mb-2">Innovation</h3>
                      <p className="text-sm opacity-90">Technologie de pointe</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl mb-2"></div>
                      <h3 className="font-semibold mb-2">Business</h3>
                      <p className="text-sm opacity-90">Gestion simplifiée</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl mb-2"></div>
                      <h3 className="font-semibold mb-2">Communauté</h3>
                      <p className="text-sm opacity-90">Réseau connecté</p>
                    </div>
                  </motion.div>
                  
                  {/* Indicateurs du carrousel */}
                  <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-2">
                    {heroSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          i === activeSlide ? 'bg-electric-500 w-8' : 'bg-white/40'
                        }`}
                        aria-label={`Aller au slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section Formulaire - 1/3 du bloc */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full flex justify-center"
              style={{ width: 'calc(30% - 2px)' }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-3 shadow-2xl h-full flex flex-col min-h-[600px] overflow-y-auto w-full">
      {/* Header */}
            <div className="text-center mb-6  justify-center">
        <motion.div
          initial={{ scale: 0 }}

          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary-500 to-electric-500 flex items-center justify-center shadow-lg"
        >
          <img 
            src="/logo.svg" 
            alt="OCASS DIGITAL Logo" 
            className="w-12 h-12"
          />
        </motion.div>
        
        <h1 className="text-3xl font-bold gradient-text mb-2">
                Connexion
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
                Accédez à votre espace
        </p>
      </div>

{/*       
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start gap-3">
          <div className="text-blue-500 text-xl">Acteurs :</div>
          <div>
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Mots de passe de testts doit p
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <strong>Administrateurs :</strong> <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded font-mono">admin123</code> (sauf admin@platform.com qui utilise <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded font-mono">password</code>)<br/>
              <strong>Autres comptes :</strong> <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded font-mono">password</code>
            </p>
          </div>
        </div>
      </motion.div> */}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        {/* Role Selection */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Vous êtes :
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'admin', label: 'Admin', icon: '' },
              { value: 'entrepreneur', label: 'Entrepreneur', icon: '' },
              { value: 'client', label: 'Client', icon: '' },
            ].map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => handleRoleChange(role.value)}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  formData.role === role.value
                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <div className="text-lg mb-1">{role.icon}</div>
                {role.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input-premium pl-10"
              placeholder="votre@email.com"
              required
            />
          </div>
          
          {/* Suggestions d'emails */}
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Comptes disponibles pour {formData.role} :
            </p>
            <div className="space-y-2">
              {suggestedEmails[formData.role as keyof typeof suggestedEmails].map((suggestion, index) => (
                <div key={`${formData.role}-${index}`} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, email: suggestion.email, password: suggestion.password }))}
                    className={`px-3 py-2 text-xs rounded-lg transition-all flex-1 text-left ${
                      formData.email === suggestion.email
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-xs opacity-75">{suggestion.email}</div>
                  </button>
                  {/* <button
                    type="button"
                    onClick={() => quickLogin(suggestion.email, suggestion.password, formData.role)}
                    className="px-3 py-2 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                    title="Connexion rapide"
                  >
                    🚀
                  </button> */}
                </div>
              ))}
            </div>
            {/* <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                💡 <strong>Astuce :</strong> Cliquez sur l'email pour le sélectionner, ou sur 🚀 pour une connexion rapide
              </p>
            </div> */}
          </div>
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="input-premium pl-10 pr-10"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Affichage du mot de passe actuel */}
          {formData.password && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-green-600 dark:text-green-400">
                🔑 <strong>Mot de passe actuel :</strong> <code className="bg-green-100 dark:bg-green-800 px-1 rounded">{formData.password}</code>
              </p>
            </div>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          type="submit"
          disabled={loading}
          className="w-full btn-primary relative overflow-hidden group"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Connexion...
            </div>
          ) : (
            <div className="flex items-center justify-center group">
              Se connecter
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </motion.button>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center space-y-2"
        >
          <Link
            to="/auth/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
          >
            Mot de passe oublié ?
          </Link>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Pas de compte ?{' '}
            </span>
            <Link
              to="/auth/register"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </motion.div>
      </form>
              </div>
        </motion.div>
      </div>
    </motion.div>
      </div>
      
      {/* Bouton pour retourner à la page d'accueil */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 z-50 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-110"
        title="Retour à l'accueil"
      >
        <Home className="w-5 h-5" />
      </motion.button>
    </div>
  );
};

export default LoginPage;