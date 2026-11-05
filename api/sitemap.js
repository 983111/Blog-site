module.exports = async function handler(req, res) {
  const base = 'https://vishwajeet-blog-psi.vercel.app';
  const supabaseUrl = 'https://osuyauxwckklzawezmed.supabase.co';
  const supabaseKey = 'sb_publishable_Agi6vATEifraKAMuD25tag_eUFut8iD';

  try {
    const response = await fetch(
      supabaseUrl + '/rest/v1/posts?select=slug,created_at&order=created_at.desc',
      { headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey } }
    );
    if (!response.ok) throw new Error('Supabase returned ' + response.status);
    const posts = await response.json();
    const urls = [
      '  <url><loc>' + base + '/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>'
    ];

    for (const post of posts) {
      if (!post.slug) continue;
      const slug = encodeURIComponent(String(post.slug));
      const lastmod = post.created_at
        ? '<lastmod>' + new Date(post.created_at).toISOString().slice(0, 10) + '</lastmod>'
        : '';
      urls.push(
        '  <url><loc>' + base + '/posts/' + slug + '</loc>' + lastmod +
        '<changefreq>monthly</changefreq><priority>0.7</priority></url>'
      );
    }

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.join('\n') + '\n</urlset>'
    );
  } catch (error) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send('Unable to generate sitemap: ' + error.message);
  }
};
