import urls from '@/config/urls';

export default (url) => {
  return `${urls.uploads}${url.split('\\').join('/').replace('../', '/')}`;
};
