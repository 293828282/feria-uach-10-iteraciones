async function check() {
  const res = await fetch('https://feria-uach-10-iteraciones.vercel.app');
  const html = await res.text();
  console.log('HTTP Status:', res.status);
  
  const title = html.match(/<title>([^<]+)<\/title>/);
  console.log('Title:', title ? title[1] : 'No title');

  const ogMatches = html.match(/<meta property="og:[^"]+" content="[^"]*"/g) || [];
  console.log('OG Metas:');
  ogMatches.forEach(m => console.log('  ', m));

  const twitterMatches = html.match(/<meta name="twitter:[^"]+" content="[^"]*"/g) || [];
  console.log('Twitter Metas:');
  twitterMatches.forEach(m => console.log('  ', m));

  const iconMatches = html.match(/<link rel="[^"]*icon[^"]*"[^>]+>/g) || [];
  console.log('Icon Links:');
  iconMatches.forEach(m => console.log('  ', m));

  // Check if /opengraph-image is 200 OK
  const ogImgRes = await fetch('https://feria-uach-10-iteraciones.vercel.app/opengraph-image');
  console.log('OpenGraph Image Status:', ogImgRes.status, ogImgRes.headers.get('content-type'));

  // Check if /favicon.ico is 200 OK
  const favRes = await fetch('https://feria-uach-10-iteraciones.vercel.app/favicon.ico');
  console.log('Favicon Status:', favRes.status, favRes.headers.get('content-type'));
}

check().catch(console.error);
