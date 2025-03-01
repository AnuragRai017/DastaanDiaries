import { BlogCategory } from './types';

interface CategoryConfig {
  keywords: string[];
  weight: number;
  synonyms?: string[];
  exclude?: string[];
}

// Enhanced category configuration with weights and relationships
const categoryConfig: Record<BlogCategory, CategoryConfig> = {
  'Technology': {
    keywords: ['software', 'hardware', 'programming', 'code', 'app', 'application', 'computer', 
      'tech', 'technology', 'digital', 'internet', 'open source','Openai','Claude' ,'Authropic','Deepseeek','web', 'mobile', 'smartphone', 
      'device', 'gadget', 'ai', 'artificial intelligence', 'machine learning', 'ml',
      'algorithm', 'data', 'cloud', 'server', 'network', 'cyber', 'security', 'encryption',
      'blockchain', 'crypto', 'cryptocurrency', 'bitcoin', 'javascript', 'python', 'java',
      'react', 'angular', 'vue', 'node', 'frontend', 'backend', 'fullstack', 'developer',
      'metaverse', 'vr', 'ar', 'quantum computing', 'robotics', '5g', 'edge computing', 
      'fintech', 'web3', 'open source', 'devops', 'api', 'microservices', 'iot', 
      'wearables', 'nanotech', 'biotech', 'chatbot', 'nocode', 'lowcode', 'ui/ux', 
      'agile', 'scrum', 'virtual reality', 'augmented reality', 'internet of things','AI Tools','IDE','Vscode','Cursor AI', 'Windsurf AI','GPT','Authropic'],
    weight: 1.3,
    synonyms: ['tech', 'innovation', 'digital', 'emerging tech', 'future tech'],
    exclude: []
  },
  'Lifestyle': {
    keywords: ['lifestyle', 'living', 'life', 'home', 'decor', 'decoration', 'interior', 'design',
      'fashion', 'style', 'trend', 'beauty', 'skincare', 'makeup', 'cosmetics', 'wellness',
      'self-care', 'mindfulness', 'meditation', 'yoga', 'hobby', 'diy', 'craft', 'garden',
      'gardening', 'plant', 'minimalism', 'sustainable', 'eco-friendly', 'green living',
      'slow living', 'hygge', 'van life', 'digital nomad', 'parenting', 'relationship advice', 
      'pet care', 'luxury', 'affordable living', 'decluttering', 'work-life balance', 
      'solo living', 'social media detox', 'festivals', 'rituals', 'life hacks',
      'personal development', 'productivity', 'organization'],
    weight: 1.1,
    synonyms: ['daily life', 'modern living', 'life balance', 'quality of life'],
    exclude: ['tech lifestyle']
  },
  'Food': {
    keywords: ['food', 'recipe', 'cooking', 'baking', 'meal', 'dish', 'cuisine', 'ingredient',
      'restaurant', 'chef', 'kitchen', 'diet', 'nutrition', 'healthy eating', 'vegan',
      'vegetarian', 'gluten-free', 'organic', 'dessert', 'breakfast', 'lunch', 'dinner',
      'snack', 'drink', 'beverage', 'cocktail', 'wine', 'beer', 'coffee', 'tea',
      'street food', 'fusion cuisine', 'food photography', 'fermentation', 'meal prep', 
      'food waste', 'food trucks', 'culinary tourism', 'food history', 'spices', 
      'superfoods', 'keto', 'paleo', 'food delivery', 'food influencers', 'food blog',
      'food styling', 'food science', 'food culture', 'food trends'],
    weight: 1.2,
    synonyms: ['gastronomy', 'culinary', 'foodie', 'dining', 'epicurean'],
    exclude: ['pet food']
  },
  'Travel': {
    keywords: ['travel', 'trip', 'journey', 'vacation', 'holiday', 'tourism', 'tourist', 'destination',
      'adventure', 'explore', 'backpacking', 'sightseeing', 'tour', 'guide', 'hotel', 'resort',
      'accommodation', 'flight', 'airline', 'airport', 'road trip', 'cruise', 'beach', 'mountain',
      'hiking', 'camping', 'passport', 'visa', 'international', 'domestic', 'local', 'foreign',
      'solo travel', 'digital nomad hotspots', 'eco-tourism', 'voluntourism', 'luxury travel', 
      'budget travel', 'hidden gems', 'cultural immersion', 'slow travel', 'workation', 
      'staycation', 'pilgrimage', 'food trails', 'photography spots', 'travel tips',
      'travel planning', 'travel insurance', 'travel photography'],
    weight: 1.2,
    synonyms: ['wanderlust', 'globetrotting', 'exploration', 'voyaging', 'world travel'],
    exclude: ['time travel']
  },
  'Society': {
    keywords: ['society', 'community', 'culture', 'tradition', 'social', 'people', 'population',
      'demographic', 'generation', 'millennial', 'gen z', 'boomer', 'urban', 'rural',
      'city', 'town', 'village', 'neighborhood', 'politics', 'government', 'policy',
      'law', 'regulation', 'rights', 'equality', 'inequality', 'diversity', 'inclusion',
      'feminism', 'lgbtq+', 'mental health stigma', 'climate activism', 'social justice', 
      'caste dynamics', 'urbanization', 'migration', 'religious harmony', 'rural development', 
      'youth movements', 'protests', 'volunteering', 'social change', 'activism',
      'human rights', 'social movements', 'social impact','mental health','men','women','suicide',"men's","women's",'depression','anxiety','stress','judgement'],
    weight: 1.2,
    synonyms: ['social issues', 'cultural', 'societal', 'community issues','suicide'],
    exclude: ['social media']
  },
  'Finance': {
    keywords: ['finance', 'money', 'investment', 'investor', 'stock', 'market', 'fund', 'banking',
      'bank', 'loan', 'credit', 'debt', 'mortgage', 'insurance', 'tax', 'taxation',
      'economy', 'economic', 'financial', 'budget', 'saving', 'expense', 'income',
      'revenue', 'profit', 'loss', 'wealth', 'asset', 'liability', 'portfolio',
      'fire movement', 'cryptocurrency trading', 'nft investments', 'passive income', 
      'side hustles', 'freelancing finances', 'retirement planning', 'esg investing', 
      'reits', 'microfinance', 'financial literacy', 'credit score hacks',
      'personal finance', 'wealth management', 'financial planning'],
    weight: 1.3,
    synonyms: ['fintech', 'monetary', 'financial markets', 'money management'],
    exclude: ['finance department']
  },
  'Anime': {
    keywords: ['anime', 'manga', 'japan', 'japanese', 'otaku', 'cosplay', 'character', 'series',
      'episode', 'season', 'studio', 'animation', 'animated', 'cartoon', 'comic',
      'shonen', 'shojo', 'seinen', 'josei', 'mecha', 'isekai', 'fantasy', 'naruto',
      'one piece', 'dragon ball', 'attack on titan', 'my hero academia', 'demon slayer',
      'voice actors', 'anime conventions', 'fan theories', 'anime merch', 'anime music', 
      'subbed vs dubbed', 'anime art styles', 'studio ghibli', 'anime awards', 
      'anime memes', 'anime streaming platforms', 'anime cosplay contests',
      'light novels', 'visual novels', 'anime culture'],
    weight: 1.3,
    synonyms: ['japanese animation', 'webtoon', 'animanga', 'japanese comics'],
    exclude: ['cartoon movie', 'western animation']
  },
  'Movies': {
    keywords: ['movie', 'film', 'cinema', 'theater', 'actor', 'actress', 'director', 'producer',
      'screenplay', 'script', 'scene', 'shot', 'camera', 'cinematography', 'editing',
      'special effects', 'visual effects', 'vfx', 'cgi', 'animation', 'documentary',
      'drama', 'comedy', 'action', 'thriller', 'horror', 'sci-fi', 'fantasy', 'romance',
      'imax', '3d', 'imax 3d', 'imax laser', 'imax vip', 'imax signature', 'imax with laser',
      'imax 70mm', 'imax 70mm film', 'imax film', 'imax format', 'imax screen',
      'imax projector', 'imax sound', 'imax theater', 'imax experience', 'imax ticket',
      'imax showtimes', 'imax schedule', 'imax movie', 'imax film festival', 'imax awards'],
    weight: 1.1,
    synonyms: ['cinematography', 'filmmaking', 'movies', 'films', 'cinema'],
    exclude: ['movie theater']
  },
  'Health': {
    keywords: ['health', 'healthcare', 'medical', 'medicine', 'doctor', 'physician', 'nurse',
      'hospital', 'clinic', 'patient', 'treatment', 'therapy', 'diagnosis', 'symptom',
      'disease', 'illness', 'condition', 'fitness', 'exercise', 'workout', 'gym',
      'diet', 'nutrition', 'mental health', 'psychology', 'psychiatry', 'wellbeing',
      'telemedicine', 'health insurance', 'medical billing', 'healthcare management',
      'medical research', 'clinical trials', 'health education', 'public health',
      'health promotion', 'disease prevention', 'health policy', 'health economics',
      'healthcare technology', 'medical devices', 'healthcare innovation'],
    weight: 1.2,
    synonyms: ['wellness', 'medical', 'healthcare', 'fitness'],
    exclude: ['health food']
  },
  'Science': {
    keywords: ['science', 'scientific', 'research', 'study', 'experiment', 'laboratory', 'lab',
      'hypothesis', 'theory', 'physics', 'chemistry', 'biology', 'astronomy', 'space',
      'planet', 'star', 'galaxy', 'universe', 'quantum', 'particle', 'atom', 'molecule',
      'cell', 'dna', 'gene', 'genetic', 'evolution', 'climate', 'environment', 'ecosystem',
      'stem', 'stem education', 'science education', 'science literacy', 'science communication',
      'science policy', 'science funding', 'science research', 'scientific method',
      'scientific inquiry', 'critical thinking', 'problem-solving', 'data analysis'],
    weight: 1.2,
    synonyms: ['scientific research', 'empirical', 'science', 'technology'],
    exclude: ['science fiction']
  },
  'Education': {
    keywords: ['education', 'school', 'university', 'college', 'academy', 'institute', 'student',
      'teacher', 'professor', 'lecturer', 'class', 'classroom', 'course', 'curriculum',
      'degree', 'diploma', 'certificate', 'learning', 'teaching', 'study', 'homework',
      'assignment', 'exam', 'test', 'grade', 'scholarship', 'academic', 'educational',
      'online learning', 'online education', 'distance learning', 'e-learning', 'mooc',
      'online course', 'online degree', 'online certification', 'online diploma',
      'online education platform', 'online learning platform', 'online course platform'],
    weight: 1.0,
    synonyms: ['learning', 'academic', 'education', 'schooling'],
    exclude: ['educational technology']
  },
  'Sports': {
    keywords: ['sport', 'sports', 'athlete', 'player', 'team', 'coach', 'training', 'competition',
      'tournament', 'championship', 'league', 'game', 'match', 'race', 'football', 'soccer',
      'basketball', 'baseball', 'tennis', 'golf', 'swimming', 'running', 'cycling', 'fitness',
      'workout', 'exercise', 'gym', 'stadium', 'arena', 'olympic', 'olympics', 'medal',
      'esports', 'gaming', 'virtual sports', 'fantasy sports', 'sports betting', 'sportsbook',
      'sports news', 'sports media', 'sports journalism', 'sports broadcasting',
      'sports marketing', 'sports management', 'sports business', 'sports law','cricket','IND','India','Virat Kohli'],
    weight: 1.1,
    synonyms: ['athletics', 'sporting', 'sports', 'fitness'],
    exclude: ['sports car']
  },
  'Business': {
    keywords: ['business', 'company', 'corporation', 'enterprise', 'startup', 'entrepreneur',
      'ceo', 'executive', 'manager', 'management', 'employee', 'employer', 'workplace',
      'office', 'remote work', 'market', 'marketing', 'sales', 'customer', 'client',
      'product', 'service', 'brand', 'strategy', 'innovation', 'leadership', 'success',
      'entrepreneurship', 'small business', 'small business owner', 'small business management',
      'small business marketing', 'small business finance', 'small business accounting',
      'small business operations', 'small business human resources', 'small business technology'],
    weight: 1.2,
    synonyms: ['entrepreneurship', 'corporate', 'business', 'company'],
    exclude: ['business casual']
  },
  'Art': {
    keywords: ['art', 'artist', 'artistic', 'painting', 'drawing', 'sculpture', 'gallery',
      'museum', 'exhibition', 'canvas', 'brush', 'color', 'design', 'illustration',
      'photography', 'photographer', 'digital art', 'graphic design', 'visual',
      'aesthetic', 'creative', 'creativity', 'expression', 'abstract', 'contemporary',
      'modern art', 'contemporary art', 'fine art', 'visual art', 'performing art',
      'music art', 'dance art', 'theater art', 'film art', 'literary art',
      'culinary art', 'fashion art', 'architecture', 'interior design'],
    weight: 1.0,
    synonyms: ['fine art', 'visual art', 'artistic', 'creative'],
    exclude: ['artificial intelligence']
  },
  'Music': {
    keywords: ['music', 'song', 'album', 'artist', 'band', 'musician', 'singer', 'vocalist',
      'composer', 'producer', 'instrument', 'guitar', 'piano', 'drum', 'bass', 'violin',
      'orchestra', 'symphony', 'concert', 'festival', 'performance', 'genre', 'rock',
      'pop', 'jazz', 'classical', 'hip hop', 'rap', 'electronic', 'indie', 'alternative',
      'music production', 'music recording', 'music engineering', 'music mixing',
      'music mastering', 'music publishing', 'music licensing', 'music royalties',
      'music streaming', 'music download', 'music education', 'music therapy'],
    weight: 1.1,
    synonyms: ['musical', 'audio', 'music', 'song'],
    exclude: ['music theory']
  },
  'Gaming': {
    keywords: ['gaming', 'esports', 'game development', 'streaming', 'twitch', 'gamer culture',
      'game reviews', 'speedrunning', 'retro gaming', 'VR gaming', 'MMORPG', 'FPS',
      'RPG', 'game design', 'gamification', 'gaming rigs', 'cheat codes', 'gaming merch',
      'gaming chair', 'gaming desk', 'gaming keyboard', 'gaming mouse', 'gaming monitor',
      'gaming headset', 'gaming controller', 'gaming console', 'gaming pc',
      'gaming laptop', 'gaming tablet', 'gaming smartphone', 'gaming handheld'],
    weight: 1.3,
    synonyms: ['video games', 'gameplay', 'gaming', 'esports'],
    exclude: ['board game']
  },
  'Parenting': {
    keywords: ['parenting', 'newborn care', 'teen challenges', 'co-sleeping',
      'positive discipline', 'screen time debates', 'homeschooling', 'special needs parenting',
      'parenting influencers', 'family travel', 'work-from-home parents', 'single parenting',
      'adoption', 'gender-neutral parenting', 'parenting styles', 'parenting tips',
      'parenting advice', 'parenting books', 'parenting blogs', 'parenting communities',
      'parenting support', 'parenting resources', 'parenting classes', 'parenting workshops'],
    weight: 1.0,
    synonyms: ['child-rearing', 'family', 'parenting', 'childcare'],
    exclude: ['parenting style']
  },
  'Books': {
    keywords: ['books', 'authors', 'book reviews', 'self-publishing', 'book clubs',
      'literary awards', 'bestsellers', 'classic literature', 'fanfiction', 'audiobooks',
      'reading challenges', 'library culture', 'bookstagram', 'book-to-screen adaptations',
      'book recommendations', 'book summaries', 'book analysis', 'book reviews',
      'book ratings', 'book awards', 'book festivals', 'book fairs', 'book conventions'],
    weight: 1.0,
    synonyms: ['literature', 'reading', 'books', 'authors'],
    exclude: ['bookshelf']
  },
  'Environment': {
    keywords: ['environment', 'climate change', 'zero waste', 'solar energy',
      'wildlife conservation', 'plastic pollution', 'carbon footprint', 'sustainable fashion',
      'green tech', 'eco-activism', 'reforestation', 'urban farming', 'climate refugees',
      'circular economy', 'sustainable living', 'eco-friendly', 'green living',
      'environmental protection', 'conservation', 'wildlife preservation',
      'sustainable development', 'eco-system', 'biodiversity', 'ecology'],
    weight: 1.2,
    synonyms: ['environmental', 'eco', 'green', 'sustainability'],
    exclude: ['environmental science']
  },
  'History': {
    keywords: ['history', 'archaeology', 'ancient civilizations', 'colonial history',
      'oral histories', 'historical fiction', 'museums', 'war history', 'cultural heritage',
      'genealogy', 'mythology', 'historical reenactments', 'lost cities',
      'history documentaries', 'historical events', 'historical figures',
      'historical places', 'historical cultures', 'ancient history', 'medieval history',
      'modern history', 'contemporary history', 'world history', 'american history'],
    weight: 1.0,
    synonyms: ['historical', 'ancient', 'history', 'heritage'],
    exclude: ['history book']
  },
  'Other': {
    keywords: ['miscellaneous', 'other', 'various', 'general', 'diverse', 'mixed', 'assorted'],
    weight: 0.5
  }
};

// Precomputed data structures for faster processing
const keywordMap = new Map<string, { category: BlogCategory; weight: number }>();
const categoryWeights: Record<BlogCategory, number> = {} as Record<BlogCategory, number>;

// Initialize lookup structures during app startup
Object.entries(categoryConfig).forEach(([category, config]) => {
  const processedKeywords = [
    ...config.keywords,
    ...(config.synonyms || [])
  ].map(k => k.toLowerCase().trim());

  processedKeywords.forEach(keyword => {
    keywordMap.set(keyword, { 
      category: category as BlogCategory, 
      weight: config.weight 
    });
  });

  categoryWeights[category as BlogCategory] = config.weight;
});

/**
 * Enhanced ML-based categorization service that analyzes text content
 * and determines the most likely category based on weighted keyword matching,
 * synonyms, exclusions, and TF-IDF-like scoring
 */
export const categorizeContent = (content: string): BlogCategory => {
  // Enhanced preprocessing
  const cleanContent = content
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .normalize("NFD") // Handle accented characters
    .replace(/[\u0300-\u036f]/g, "");

  // Tokenize with n-gram support (1-3 words)
  const tokens = new Set<string>();
  const words = cleanContent.split(/\W+/);
  
  // Generate n-grams
  for (let i = 0; i < words.length; i++) {
    tokens.add(words[i]);
    if (i < words.length - 1) tokens.add(`${words[i]}_${words[i+1]}`);
    if (i < words.length - 2) tokens.add(`${words[i]}_${words[i+1]}_${words[i+2]}`);
  }

  // Calculate scores with weights and exclusions
  const scores = new Map<BlogCategory, number>();
  const seenKeywords = new Set<string>();

  tokens.forEach(token => {
    const match = keywordMap.get(token);
    if (!match || seenKeywords.has(token)) return;

    const config = categoryConfig[match.category];
    // Check exclusions
    if (config.exclude?.some(ex => token.includes(ex))) return;

    scores.set(match.category, 
      (scores.get(match.category) || 0) + 
      (match.weight * categoryWeights[match.category])
    );
    seenKeywords.add(token);
  });

  // Apply TF-IDF like weighting
  const maxOccurrences = Math.max(...Array.from(scores.values()));
  Array.from(scores.entries()).forEach(([category, score]) => {
    scores.set(category, score * (1 + Math.log(maxOccurrences / (score + 1))));
  });

  // Threshold-based decision
  const sorted = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1]);

  // Confidence check and fallback
  if (sorted.length === 0) return 'Other';
  
  const [topCategory, topScore] = sorted[0];
  const secondScore = sorted[1]?.[1] || 0;
  
  // Minimum confidence threshold
  const confidenceThreshold = 0.3 * topScore;
  
  return (topScore - secondScore) > confidenceThreshold 
    ? topCategory 
    : 'Other';
};

// Get all available blog categories
export const getAllCategories = (): BlogCategory[] => {
  return Object.keys(categoryConfig) as BlogCategory[];
};

// Get category color for UI display
export const getCategoryColor = (category: BlogCategory): string => {
  const colors: Record<BlogCategory, string> = {
    'Technology': '#3B82F6', // Blue
    'Lifestyle': '#EC4899', // Pink
    'Food': '#F59E0B', // Yellow
    'Travel': '#10B981', // Green
    'Society': '#6366F1', // Indigo
    'Finance': '#059669', // Emerald
    'Anime': '#8B5CF6', // Purple
    'Movies': '#EF4444', // Red
    'Health': '#14B8A6', // Teal
    'Science': '#6366F1', // Indigo
    'Education': '#F59E0B', // Yellow
    'Sports': '#EF4444', // Red
    'Business': '#3B82F6', // Blue
    'Art': '#EC4899', // Pink
    'Music': '#8B5CF6', // Purple
    'Gaming': '#6366F1', // Indigo
    'Parenting': '#10B981', // Green
    'Books': '#8B5CF6', // Purple
    'Environment': '#10B981', // Green
    'History': '#6366F1', // Indigo
    'Other': '#6B7280', // Gray
  };
  return colors[category] || colors['Other'];
};
