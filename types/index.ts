export interface Stock {
    symbol: string;
    quantity: number;
    name: string;
  }

export type FormData = {
  username: string;
  profilePicture: string;
  primaryColor: string;
  backgroundStyle:
    | 'gradient'
    | 'wallpaper-0'
    | 'wallpaper-1'
    | 'wallpaper-2'
    | 'wallpaper-3'
    | 'wallpaper-4'
    | 'wallpaper-5';
  zipCode: string;
};

export type ColorOption = {
  label: string
  value: string
}

export type BackgroundStyleOption = {
  label: string
  value: string
}