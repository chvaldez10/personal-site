export type Database = {
  public: {
    Tables: {
      BrandLogo: {
        Row: {
          id: string;
          src: string;
          alt: string;
          referral_link?: string;
          label?: string;
          description: string;
          created: string;
          updated: string;
        };
        Insert: {
          id?: string;
          src: string;
          alt: string;
          referral_link?: string;
          label?: string;
          description: string;
        };
        Update: {
          id?: string;
          src?: string;
          alt?: string;
          referral_link?: string;
          label?: string;
          description?: string;
        };
      };
    };
  };
};

export type BrandLogo = Database["public"]["Tables"]["BrandLogo"]["Row"];
