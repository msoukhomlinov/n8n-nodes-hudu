import { describe, it, expect } from 'vitest';
import { convertHtmlToMarkdown } from '../htmlToMarkdown';

// A representative Hudu article HTML fixture: headings, a paragraph with bold
// + a link, a GFM table, a code block, and a bulleted list.
const fixture = `
<h1>Deploying the VPN Gateway</h1>
<p>Follow these steps to configure the <strong>site-to-site</strong> tunnel. See the
<a href="https://docs.example.com/vpn">vendor documentation</a> for background.</p>
<h2>Prerequisites</h2>
<table>
  <thead>
    <tr><th>Item</th><th>Value</th></tr>
  </thead>
  <tbody>
    <tr><td>Public IP</td><td>203.0.113.10</td></tr>
    <tr><td>Pre-shared key</td><td>stored in Passwords</td></tr>
  </tbody>
</table>
<h2>Configuration</h2>
<pre><code class="language-bash">config system ipsec
  set peer 203.0.113.10
  set psk-secret redacted
end</code></pre>
<ul>
  <li>Confirm firewall rules allow UDP 500/4500</li>
  <li>Verify routing table includes the remote subnet</li>
  <li>Test the tunnel with a ping across the link</li>
</ul>
`;

describe('convertHtmlToMarkdown snapshot', () => {
  it('matches the known-good conversion of a representative Hudu article', () => {
    expect(convertHtmlToMarkdown(fixture)).toMatchSnapshot();
  });
});
