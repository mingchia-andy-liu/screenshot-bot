const fetch = require('node-fetch');
const FormData = require('form-data');

exports.upload = async (img, title) => {
  const IMGUR_URI = 'https://api.imgur.com/3/upload';
  const form = new FormData();
  form.append('image', img);
  form.append('title', title);
  if (process.env.IMGUR_ALBUM_ID) {
    console.log('Adding the image to an album:', process.env.IMGUR_ALBUM_ID);
    form.append('album', process.env.IMGUR_ALBUM_ID)
  }
  const options = {
    method: 'POST',
    headers: {
      // anonymous
      // 'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`,

      // auth, refresh this periodically. See README
      'Authorization': `Bearer ${process.env.IMGUR_ACCESS_TOKEN}`,
    },
    body: form,
  };

  const res = await fetch(IMGUR_URI, options);
  const json = await res.json();
  if (!json || !json.success) {
    console.log(json);
    throw Error('Request failed:' + json.data.error);
  }
  console.log('uploaded:', title);
  return json;
};
