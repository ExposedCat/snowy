<h1 align="center">
  SNOWY<br>
  <img style="width:512px" src="./preview.png" alt="Screenshot">
</h1>  
<p align="center"><strong>Make you festive mood with falling snow on your GNOME DE system</strong></p>

<div align="center">
  
  [![](https://img.shields.io/badge/author%20blog%20on-Telegram-informational?style=for-the-badge&logo=telegram&logoColor=26A5E4&color=26A5E4)](https://t.me/ExposedCatDev)
  [![](https://img.shields.io/badge/author-Reddit-informational?style=for-the-badge&logo=reddit&logoColor=FF5700&color=FF5700)](https://www.reddit.com/user/ExposedCatDev)
</div>

<br>
<h1>Installation</h1>
<h2>GNOME website (recommended)</h2>
<a href="https://extensions.gnome.org/extension/3921/snowy/">
  <!-- Button SVG by Just Perfection developer -->
  <img src="./download-from-ego.svg" height="80">
</a>
<h2>Build from source</h2>
1. Download extension
<pre language="bash">
<code>git clone https://github.com/ExposedCat/snowy.git
</code></pre>
2. Add extension to system
<pre language="bash">
<code>mv snowy ~/.local/share/gnome-shell/extensions/snowy@exposedcat
</code></pre>
3. Build extension schemas
<pre language="bash">
<code>export GSETTINGS_SCHEMA_DIR=~/.local/share/gnome-shell/extensions/snowy@exposedcat/schemas 
glib-compile-schemas ~/.local/share/gnome-shell/extensions/snowy@exposedcat/schemas</code></pre>
4. Logout and login again

## License

Snowy Gnome Shell extension is distributed under the terms of the GNU General Public License,
version 2 or later.
