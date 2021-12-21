<h1 align="center">
  SNOWY<br>
  <img style="width:512px" src="https://extensions.gnome.org/extension-data/screenshots/screenshot_3921.png" alt="Screenshot">
</h1>

<p align="center"><strong>Make you festive mood with falling snow on your GNOME DE system</strong></p>

<br>
<h1>Installation</h1>
<h2>GNOME Extensions website (recommended)</h2>
<a href="https://extensions.gnome.org/extension/3921/snowy/"><img src="https://micheleg.github.io/dash-to-dock/media/get-it-on-ego.png" height="80"></a>
<h2>Build from source</h2>
1. Download and build extension
<pre language="bash">
<code>git clone https://github.com/ExposedCat/snowy.git
glib-compile-schemas snowy/schemas
</code></pre>
2. Add extension to system
<pre language="bash">
<code>mv snowy ~/.local/share/gnome-shell/extensions/snowy@exposedcat
</code></pre>
3. Restart shell
<ul>
  <li>On X11: restart shell</li>
    <ol>
      <li>Press <code>Alt</code>+<code>F2</code></li>
      <li>Type <code>r</code></li>
      <li>Press <code>Return</code></li>
    </ol>
  <li>On Wayland: logout and login again</li>
</ul>

<br>

## License
Snowy Gnome Shell extension is distributed under the terms of the GNU General Public License,
version 2 or later.