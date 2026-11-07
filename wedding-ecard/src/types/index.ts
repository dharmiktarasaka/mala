export interface CoupleInfo {
  groomName: string;
  brideName: string;
  groomPhoto: string;
  bridePhoto: string;
  loveStory: string;
  weddingDate: string;
  weddingTime: string;
  coupleHashtag?: string;
}

export interface WeddingEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  mapLink: string;
  attire?: string;
}

export interface FamilyInfo {
  groomFather: string;
  groomMother: string;
  brideFather: string;
  brideMother: string;
  familyPhotos: string[];
  blessingsNote?: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
  type: 'couple' | 'pre-wedding';
}

export interface TemplateTheme {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  previewImage: string;
  features: string[];
  vibe: string;
}

export interface WeddingFormData {
  couple: CoupleInfo;
  events: WeddingEvent[];
  family: FamilyInfo;
  gallery: GalleryPhoto[];
  selectedTemplate: string;
  rsvpDeadline?: string;
  contactPhone?: string;
}

