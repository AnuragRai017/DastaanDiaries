import { Cloudinary } from '@cloudinary/url-gen';

export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: 'dckv73izl'
  }
});

export const getOptimizedImageUrl = (publicId: string, width = 500, height = 500) => {
  return cloudinary
    .image(publicId)
    .format('auto')
    .quality('auto')
    .thumbnail({ width: width, height: height, gravity: "auto" })
    .toURL();
};
