import api from './api';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  eyebrow?: string;
  cta?: string;
  ctaLink?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryLink?: string;
  image: string;
  accentColor?: string;
  active: boolean;
  order: number;
}


export interface Banner {
  id: string;
  text: string;
  link?: string;
  bgColor: string;
  active: boolean;
  type: "PROMO" | "ANNOUNCEMENT" | "SALE";
  imageUrl?: string;
  showOverlay?: boolean;
}

export interface HomepageSection {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
  order: number;
  type?: string;
  config?: any;
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  lastEdited: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
}

export const cmsService = {
  // Hero Slides
  getHeroSlides: () => api.get<HeroSlide[]>('/cms/hero'),
  createHeroSlide: (data: Partial<HeroSlide>) => api.post<HeroSlide>('/cms/hero', data),
  updateHeroSlide: (id: string, data: Partial<HeroSlide>) => api.put<HeroSlide>(`/cms/hero/${id}`, data),
  deleteHeroSlide: (id: string) => api.delete(`/cms/hero/${id}`),

  // Banners
  getBanners: () => api.get<Banner[]>('/cms/banners'),
  createBanner: (data: Partial<Banner>) => api.post<Banner>('/cms/banners', data),
  updateBanner: (id: string, data: Partial<Banner>) => api.put<Banner>(`/cms/banners/${id}`, data),
  deleteBanner: (id: string) => api.delete(`/cms/banners/${id}`),

  // Homepage Sections
  getHomepageSections: () => api.get<HomepageSection[]>('/cms/sections'),
  createHomepageSection: (data: Partial<HomepageSection>) => api.post<HomepageSection>('/cms/sections', data),
  updateHomepageSection: (id: string, data: Partial<HomepageSection>) => api.put<HomepageSection>(`/cms/sections/${id}`, data),
  deleteHomepageSection: (id: string) => api.delete(`/cms/sections/${id}`),

  // Static Pages
  getStaticPages: () => api.get<StaticPage[]>('/cms/pages'),
  createStaticPage: (data: Partial<StaticPage>) => api.post<StaticPage>('/cms/pages', data),
  updateStaticPage: (id: string, data: Partial<StaticPage>) => api.put<StaticPage>(`/cms/pages/${id}`, data),
  deleteStaticPage: (id: string) => api.delete(`/cms/pages/${id}`),
};
