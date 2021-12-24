<h1 align="center">
  SNOWY<br>
  <img style="width:512px" src="./preview.png" alt="Screenshot">
</h1>

<p align="center"><strong>Make you festive mood with falling snow on your GNOME DE system</strong></p>

<br>
<h1>Installation</h1>
<h2>GNOME Extensions website (recommended)</h2>
<a href="https://extensions.gnome.org/extension/3921/snowy/">
  <img src="https://micheleg.github.io/dash-to-dock/media/get-it-on-ego.png" height="80">
</a>
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
<h1>Configuration</h1>
GUI settings are still in development (<b>contribution is highly appreciated</b>), but you can tweak nearly everything using <code>gsettings</code> command:<br>
<pre language="bash">
  gsettings --schemadir \
  ~/.local/share/gnome-shell/extensions/snowy@exposedcat/schemas \
  set org.gnome.shell.extensions.snowy \
  GSKEY VALUE
</pre>
To see list of current settings values use following command:<br>
<pre language="bash">
  gsettings --schemadir \
  ~/.local/share/gnome-shell/extensions/snowy@exposedcat/schemas \
  list-recursively org.gnome.shell.extensions.snowy
</pre>
Here <code>GSKEY</code> is <b>GSettings Key</b> of setting and <code>VALUE</code> is setting value.<br>
All available tweaks listed here:
<br>
<br>
<table>
  <thead>
    <tr>
      <th>
        <em> Description </em>
      </th>
      <th>
        <em> GSettings Key </em>
      </th>
      <th>
        <em> Default value </em>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <div> Snowflake icons list </div>
      </td>
      <td>
        <code> flake-icons </code>
      </td>
      <td>
        <code> ❅,❆,❄ </code>
      </td>
    </tr>
    <tr>
      <td>
        <div> Minimal size of snowflake </div>
      </td>
      <td>
        <code> min-size </code>
      </td>
      <td>
        <code> 20 </code>
      </td>
    </tr>
    <tr>
      <td>
        <div> Minimal size of snowflake </div>
      </td>
      <td>
        <code> max-size </code>
      </td>
      <td>
        <code> 30 </code>
      </td>
    </tr>
    <tr>
      <td>
        <div> Snow falling interval in ms (less = higher drop rate) </div>
      </td>
      <td>
        <code> interval </code>
      </td>
      <td>
        <code> 2000 </code>
      </td>
    </tr>
    <tr>
      <td>
        <div> Minimal snowflakes number per one fall </div>
      </td>
      <td>
        <code> min-flakes </code>
      </td>
      <td>
        <code> 1 </code>
      </td>
    </tr>
    <tr>
      <td>
        <div> Maximal snowflakes number per one fall </div>
      </td>
      <td>
        <code> max-flakes </code>
      </td>
      <td>
        <code> 5 </code>
      </td>
    </tr>
    <tr>
      <td>
        <div> Maximal snowflakes number on the screen (max-flakes restriction). Re-enable extension to apply </div>
      </td>
      <td>
        <code> flakes-limit </code>
      </td>
      <td>
        <code> 30 </code>
      </td>
    </tr>
  </tbody>
</table>
<br>

## License
Snowy Gnome Shell extension is distributed under the terms of the GNU General Public License,
version 2 or later.
