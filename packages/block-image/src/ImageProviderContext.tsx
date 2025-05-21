import { createContext } from 'react';

export type ImageProviderContextType = {
  loadImage: (imageID: string) => Promise<string>;
};

const ImageProviderContext = createContext<ImageProviderContextType | undefined>(undefined);

export default ImageProviderContext;