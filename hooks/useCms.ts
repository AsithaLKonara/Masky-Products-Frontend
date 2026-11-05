import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, HeroConfig, HeroSlide, Banner, HomepageSection, StaticPage } from '../services/cms.service';

export function useCms() {
  const queryClient = useQueryClient();

  // Hero Configuration (Slider / Video / Photo)
  const { data: heroConfig, isLoading: isLoadingHeroConfig } = useQuery<HeroConfig>({
    queryKey: ['heroConfig'],
    queryFn: async () => {
      const res = await cmsService.getHeroConfig();
      return res.data;
    },
    staleTime: 0,
  });

  const updateHeroConfig = useMutation({
    mutationFn: (data: Partial<HeroConfig>) => cmsService.updateHeroConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroConfig'] });
    }
  });

  // Hero Slides
  const { data: heroSlides = [], isLoading: isLoadingHero } = useQuery({
    queryKey: ['heroSlides'],
    queryFn: async () => {
      const res = await cmsService.getHeroSlides();
      return res.data;
    }
  });

  const createHeroSlide = useMutation({
    mutationFn: (data: Partial<HeroSlide>) => cmsService.createHeroSlide(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['heroSlides'] })
  });

  const updateHeroSlide = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<HeroSlide> }) => cmsService.updateHeroSlide(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['heroSlides'] })
  });

  const deleteHeroSlide = useMutation({
    mutationFn: (id: string) => cmsService.deleteHeroSlide(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['heroSlides'] })
  });

  // Banners
  const { data: banners = [], isLoading: isLoadingBanners } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await cmsService.getBanners();
      return res.data;
    }
  });

  const createBanner = useMutation({
    mutationFn: (data: Partial<Banner>) => cmsService.createBanner(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] })
  });

  const updateBanner = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Banner> }) => cmsService.updateBanner(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] })
  });

  const deleteBanner = useMutation({
    mutationFn: (id: string) => cmsService.deleteBanner(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] })
  });

  // Homepage Sections
  const { data: sections = [], isLoading: isLoadingSections } = useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const res = await cmsService.getHomepageSections();
      return res.data;
    }
  });

  const createHomepageSection = useMutation({
    mutationFn: (data: Partial<HomepageSection>) => cmsService.createHomepageSection(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] })
  });

  const updateHomepageSection = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<HomepageSection> }) => cmsService.updateHomepageSection(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] })
  });

  const reorderHomepageSections = useMutation({
    mutationFn: (orders: { id: string; order: number }[]) => cmsService.reorderHomepageSections(orders),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] })
  });

  const resetHomepageSections = useMutation({
    mutationFn: () => cmsService.resetHomepageSections(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] })
  });

  const deleteHomepageSection = useMutation({
    mutationFn: (id: string) => cmsService.deleteHomepageSection(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] })
  });

  // Static Pages
  const { data: pages = [], isLoading: isLoadingPages } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const res = await cmsService.getStaticPages();
      return res.data;
    }
  });

  const createStaticPage = useMutation({
    mutationFn: (data: Partial<StaticPage>) => cmsService.createStaticPage(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] })
  });

  const updateStaticPage = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<StaticPage> }) => cmsService.updateStaticPage(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] })
  });

  const deleteStaticPage = useMutation({
    mutationFn: (id: string) => cmsService.deleteStaticPage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pages'] })
  });

  return {
    heroConfig, isLoadingHeroConfig, updateHeroConfig,
    heroSlides, isLoadingHero, createHeroSlide, updateHeroSlide, deleteHeroSlide,
    banners, isLoadingBanners, createBanner, updateBanner, deleteBanner,
    sections, isLoadingSections, createHomepageSection, updateHomepageSection, deleteHomepageSection, reorderHomepageSections, resetHomepageSections,
    pages, isLoadingPages, createStaticPage, updateStaticPage, deleteStaticPage
  };
}
