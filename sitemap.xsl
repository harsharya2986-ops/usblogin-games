<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns="http://www.w3.org/1999/xhtml" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <title>XML Sitemap | US Blog</title>
      <meta name="robots" content="noindex"/>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          max-width: 1200px; margin: 0 auto; padding: 30px 20px; 
          background: #f0f4f8; color: #1a1a2e; 
        }
        h1 { 
          color: #0a1e2f; 
          border-bottom: 4px solid #0a1e2f; 
          padding-bottom: 12px; 
          font-size: 2.2rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .stats {
          background: white;
          padding: 16px 24px;
          border-radius: 12px;
          margin: 20px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          display: flex;
          gap: 30px;
          flex-wrap: wrap;
        }
        .stats span { font-weight: 600; color: #0a1e2f; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 16px rgba(0,0,0,0.06); 
          margin-top: 20px;
        }
        th { 
          background: #0a1e2f; 
          color: white; 
          padding: 14px 18px; 
          text-align: left; 
          font-weight: 600; 
          font-size: 0.9rem;
        }
        td { 
          padding: 12px 18px; 
          border-bottom: 1px solid #e8edf4; 
          vertical-align: middle;
        }
        tr:hover { background: #f5f9ff; }
        .priority-high { color: #0a7a0a; font-weight: 600; }
        .priority-med { color: #d4872b; font-weight: 500; }
        .priority-low { color: #7f8c8d; }
        .url-link { 
          color: #0a1e2f; 
          text-decoration: none; 
          font-weight: 500;
          word-break: break-all;
        }
        .url-link:hover { text-decoration: underline; color: #1a4b7c; }
        .badge { 
          background: #e2eaf3; 
          padding: 3px 14px; 
          border-radius: 40px; 
          font-size: 0.7rem; 
          font-weight: 600;
          color: #1a3349; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-daily { background: #d4edda; color: #155724; }
        .badge-weekly { background: #d1ecf1; color: #0c5460; }
        .badge-monthly { background: #fff3cd; color: #856404; }
        .badge-yearly { background: #f8d7da; color: #721c24; }
        .footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #e2e8f0; 
          text-align: center; 
          color: #64748b;
          font-size: 0.9rem;
        }
        .search-box {
          margin: 20px 0;
          padding: 12px 20px;
          border: 2px solid #dce5ef;
          border-radius: 40px;
          width: 100%;
          max-width: 400px;
          font-size: 1rem;
          transition: 0.2s;
        }
        .search-box:focus {
          border-color: #0a1e2f;
          outline: none;
        }
        .count-badge {
          background: #0a1e2f;
          color: white;
          padding: 4px 16px;
          border-radius: 40px;
          font-size: 0.9rem;
        }
        @media (max-width: 768px) {
          table { font-size: 0.85rem; }
          th, td { padding: 10px 12px; }
          h1 { font-size: 1.6rem; }
        }
      </style>
    </head>
    <body>
      <h1>🗺️ US Blog Sitemap</h1>
      <div class="stats">
        <div>📄 Total URLs: <span><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span></div>
        <div>🔄 Last Updated: <span><xsl:value-of select="current-dateTime()"/></span></div>
        <div>🏷️ Domain: <span>usblog.in</span></div>
      </div>
      
      <input type="text" class="search-box" placeholder="🔍 Search URLs..." id="searchInput" onkeyup="filterTable()"/>
      
      <table>
        <thead>
          <tr>
            <th style="width:50%">URL</th>
            <th>Priority</th>
            <th>Last Modified</th>
            <th>Change Frequency</th>
          </tr>
        </thead>
        <tbody id="sitemapBody">
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td>
                <a href="{sitemap:loc}" class="url-link" target="_blank">
                  <xsl:value-of select="substring-after(sitemap:loc, 'https://www.usblog.in/')"/>
                  <xsl:if test="substring-after(sitemap:loc, 'https://www.usblog.in/') = ''">Home</xsl:if>
                </a>
              </td>
              <td>
                <span class="priority-{substring-before(sitemap:priority, '.')}">
                  <xsl:value-of select="sitemap:priority"/>
                </span>
              </td>
              <td><xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/></td>
              <td>
                <span class="badge badge-{sitemap:changefreq}">
                  <xsl:value-of select="sitemap:changefreq"/>
                </span>
              </td>
            </tr>
          </xsl:for-each>
        </tbody>
      </table>
      
      <div class="footer">
        <p>📧 Generated: <xsl:value-of select="current-dateTime()"/> | 🏠 US Blog - Gaming &amp; Tech Hub</p>
        <p style="margin-top:8px; font-size:0.8rem;">
          <a href="/" style="color:#0a1e2f; text-decoration:none;">Home</a> · 
          <a href="/privacy-policy" style="color:#0a1e2f; text-decoration:none;">Privacy</a> · 
          <a href="/contact" style="color:#0a1e2f; text-decoration:none;">Contact</a>
        </p>
      </div>

      <script>
        function filterTable() {
          const input = document.getElementById('searchInput');
          const filter = input.value.toLowerCase();
          const rows = document.querySelectorAll('#sitemapBody tr');
          rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
          });
        }
      </script>
    </body>
  </html>
</xsl:template>
</xsl:stylesheet>