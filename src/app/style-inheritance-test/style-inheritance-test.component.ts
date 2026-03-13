import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChildAComponent } from './child-a/child-a.component';
import { ChildCComponent } from './child-c/child-c.component';
import { ChildDComponent } from './child-d/child-d.component';
import { ChildEComponent } from './child-e/child-e.component';

/**
 * Test Page Component
 *
 * Compares different approaches to style inheritance:
 * 1. styleUrls array (duplicates styles)
 * 2. Single styleUrl (missing base styles)
 * 3. Adopted StyleSheets (NO duplication!) ✨
 */
@Component({
    selector: 'app-style-inheritance-test',
    template: `
        <div class="test-page">
            <h1>Style Inheritance Test - Comparing Approaches</h1>
            
            <p class="description">
                This page compares different ways to handle style inheritance in Angular when
                child components extend a base component. <strong>The base component is NOT rendered
                directly</strong> - only child components are used.
            </p>

            <!-- APPROACH 1: styleUrls array -->
            <section class="test-section duplicated">
                <h2>📋 Approach 1: styleUrls Array</h2>
                <p class="approach-tag">Child A</p>
                
                <div class="approach-description">
                    <p>
                        This is the <strong>native Angular solution</strong>. You include the base component's 
                        CSS file in the child's <code>styleUrls</code> array alongside the child's own styles.
                    </p>
                    <pre class="code-block">&#64;Component(&#123;
    styleUrls: [
        '../base/base.component.css',  // Base styles
        './child-a.component.css'       // Child styles
    ]
&#125;)</pre>
                </div>

                <div class="pros-cons">
                    <div class="pros">
                        <h4>✅ Pros</h4>
                        <ul>
                            <li>Native Angular API - no extra code needed</li>
                            <li>Works with default emulated encapsulation</li>
                            <li>Full browser support</li>
                            <li>Styles are properly scoped to component</li>
                        </ul>
                    </div>
                    <div class="cons">
                        <h4>❌ Cons</h4>
                        <ul>
                            <li><strong>Duplicates styles</strong> in each child's CSS bundle</li>
                            <li>Increases bundle size with many children</li>
                            <li>Must manually include base styles in every child</li>
                        </ul>
                    </div>
                </div>

                <div class="references">
                    <h4>📚 References</h4>
                    <ul>
                        <li><a href="https://angular.dev/guide/components/styling" target="_blank">Angular Docs: Component Styling</a></li>
                        <li><a href="https://angular.dev/api/core/Component#styleUrls" target="_blank">Angular API: &#64;Component styleUrls</a></li>
                    </ul>
                </div>

                <div class="demo">
                    <h4>Demo:</h4>
                    <app-child-a />
                </div>
            </section>

            <!-- APPROACH 2: Single styleUrl (broken) -->
            <section class="test-section failure">
                <h2>❌ Approach 2: Single styleUrl (No Inheritance)</h2>
                <p class="approach-tag">Child C</p>
                
                <div class="approach-description">
                    <p>
                        This demonstrates what happens when you <strong>don't include base styles</strong>.
                        Angular does NOT inherit styles through TypeScript class extension. The 
                        <code>&#64;Component</code> decorator metadata (template, styles) is NOT inherited.
                    </p>
                    <pre class="code-block">&#64;Component(&#123;
    styleUrl: './child-c.component.css'  // Only child styles!
&#125;)
export class ChildCComponent extends BaseComponent &#123;&#125;
// BaseComponent styles are NOT inherited!</pre>
                </div>

                <div class="pros-cons">
                    <div class="pros">
                        <h4>✅ Pros</h4>
                        <ul>
                            <li>Smallest bundle size (no extra styles)</li>
                            <li>Simple configuration</li>
                        </ul>
                    </div>
                    <div class="cons">
                        <h4>❌ Cons</h4>
                        <ul>
                            <li><strong>Base styles are missing!</strong></li>
                            <li>Component renders without expected styling</li>
                            <li>Not a viable solution for style inheritance</li>
                        </ul>
                    </div>
                </div>

                <div class="references">
                    <h4>📚 References</h4>
                    <ul>
                        <li><a href="https://angular.dev/guide/components/inheritance" target="_blank">Angular Docs: Component Inheritance</a></li>
                        <li><a href="https://github.com/angular/angular/issues/7773" target="_blank">GitHub Issue: Style inheritance discussion</a></li>
                    </ul>
                </div>

                <div class="demo">
                    <h4>Demo: (Notice missing padding, borders, button styles)</h4>
                    <app-child-c />
                </div>
            </section>

            <!-- APPROACH 3: Adopted StyleSheets (THE SOLUTION!) -->
            <section class="test-section adopted">
                <h2>✨ Approach 3: Adopted StyleSheets (Recommended)</h2>
                <p class="approach-tag">Child D & E</p>
                
                <div class="approach-description">
                    <p>
                        The <strong>Constructable StyleSheets API</strong> (<code>adoptedStyleSheets</code>) 
                        allows you to create a <code>CSSStyleSheet</code> object once and share the 
                        <strong>same instance</strong> across multiple Shadow DOMs. No duplication!
                    </p>
                    <pre class="code-block">// Service creates stylesheet ONCE
const sheet = new CSSStyleSheet();
sheet.replaceSync('.base &#123; padding: 20px; &#125;');

// Share SAME instance (not a copy!)
childD.shadowRoot.adoptedStyleSheets = [sheet];
childE.shadowRoot.adoptedStyleSheets = [sheet];</pre>
                </div>

                <div class="pros-cons">
                    <div class="pros">
                        <h4>✅ Pros</h4>
                        <ul>
                            <li><strong>No style duplication</strong> - same object shared</li>
                            <li>True style encapsulation via Shadow DOM</li>
                            <li>Performant - browser optimizes shared sheets</li>
                            <li>Can dynamically update styles at runtime</li>
                            <li>Used by Lit, Stencil, Shoelace, and other modern libraries</li>
                        </ul>
                    </div>
                    <div class="cons">
                        <h4>❌ Cons</h4>
                        <ul>
                            <li>Requires <code>ViewEncapsulation.ShadowDom</code></li>
                            <li>More complex setup (service + directive)</li>
                            <li>Shadow DOM can complicate global styling</li>
                            <li>Older browser support (Chrome 73+, Firefox 101+, Safari 16.4+)</li>
                        </ul>
                    </div>
                </div>

                <div class="references">
                    <h4>📚 References</h4>
                    <ul>
                        <li><a href="https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets" target="_blank">MDN: adoptedStyleSheets</a></li>
                        <li><a href="https://web.dev/articles/constructable-stylesheets" target="_blank">web.dev: Constructable Stylesheets</a></li>
                        <li><a href="https://developers.google.com/web/updates/2019/02/constructable-stylesheets" target="_blank">Google Developers: Constructable Stylesheets</a></li>
                        <li><a href="https://lit.dev/docs/components/styles/" target="_blank">Lit Docs: Styles (uses adoptedStyleSheets)</a></li>
                        <li><a href="https://caniuse.com/mdn-api_document_adoptedstylesheets" target="_blank">Can I Use: adoptedStyleSheets</a></li>
                    </ul>
                </div>

                <div class="demo">
                    <h4>Demo: (Both components share the SAME base stylesheet instance)</h4>
                    <div class="adopted-demo">
                        <app-child-d />
                        <app-child-e />
                    </div>
                    <p class="solution-note">
                        🔍 <strong>Verify in DevTools:</strong> Elements → Expand shadow root → 
                        Both have identical <code>adoptedStyleSheets[0]</code> object reference.
                    </p>
                </div>
            </section>

            <!-- Summary comparison table -->
            <section class="summary-section">
                <h2>📊 Summary Comparison</h2>
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Approach</th>
                            <th>Duplication</th>
                            <th>Encapsulation</th>
                            <th>Complexity</th>
                            <th>Browser Support</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><code>styleUrls</code> array</td>
                            <td class="bad">❌ Yes</td>
                            <td class="good">✅ Emulated</td>
                            <td class="good">⭐ Easy</td>
                            <td class="good">✅ All</td>
                        </tr>
                        <tr>
                            <td>Single <code>styleUrl</code></td>
                            <td class="good">✅ None</td>
                            <td class="good">✅ Emulated</td>
                            <td class="good">⭐ Easy</td>
                            <td class="good">✅ All</td>
                        </tr>
                        <tr class="highlight">
                            <td><strong>Adopted StyleSheets</strong></td>
                            <td class="good">✅ None</td>
                            <td class="good">✅ Shadow DOM</td>
                            <td class="neutral">⭐⭐ Medium</td>
                            <td class="neutral">⚠️ Modern</td>
                        </tr>
                        <tr>
                            <td>Global styles</td>
                            <td class="good">✅ None</td>
                            <td class="bad">❌ None</td>
                            <td class="good">⭐ Easy</td>
                            <td class="good">✅ All</td>
                        </tr>
                        <tr>
                            <td>CSS Custom Properties</td>
                            <td class="good">✅ None*</td>
                            <td class="good">✅ Yes</td>
                            <td class="neutral">⭐⭐ Medium</td>
                            <td class="good">✅ All</td>
                        </tr>
                    </tbody>
                </table>
                <p class="table-note">* CSS Custom Properties don't duplicate variable definitions, but you still need to write the property declarations in each component.</p>
            </section>

            <!-- Other approaches -->
            <section class="other-approaches">
                <h2>🔧 Other Approaches Worth Mentioning</h2>
                
                <div class="approach-card">
                    <h4>CSS Custom Properties (Variables)</h4>
                    <p>Define variables globally, use in components. No value duplication, but declaration duplication remains.</p>
                    <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties" target="_blank">MDN: CSS Custom Properties →</a>
                </div>

                <div class="approach-card">
                    <h4>Global Styles (styles.scss)</h4>
                    <p>Put shared styles in global stylesheet. No duplication but no encapsulation either.</p>
                    <a href="https://angular.dev/guide/components/styling#global-styles" target="_blank">Angular: Global Styles →</a>
                </div>

                <div class="approach-card">
                    <h4>ViewEncapsulation.None</h4>
                    <p>Disable encapsulation so styles "leak" globally. Simple but risky for large apps.</p>
                    <a href="https://angular.dev/api/core/ViewEncapsulation" target="_blank">Angular: ViewEncapsulation →</a>
                </div>

                <div class="approach-card">
                    <h4>Sass Mixins / &#64;use</h4>
                    <p>Reusable style mixins at build time. Convenient but DOES duplicate output CSS.</p>
                    <a href="https://sass-lang.com/documentation/at-rules/mixin/" target="_blank">Sass: Mixins →</a>
                </div>
            </section>
        </div>
    `,
    styles: [`
        .test-page {
            padding: 20px;
            max-width: 1100px;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        h1 { color: #1a1a1a; margin-bottom: 10px; }
        h2 { margin-top: 0; font-size: 1.3rem; margin-bottom: 15px; }
        h4 { margin: 0 0 10px 0; font-size: 1rem; }
        
        .description {
            color: #555;
            margin-bottom: 30px;
            background: #e3f2fd;
            padding: 15px 20px;
            border-radius: 8px;
            line-height: 1.6;
        }
        
        .approach-tag {
            display: inline-block;
            background: #333;
            color: white;
            padding: 3px 12px;
            border-radius: 4px;
            font-size: 0.8rem;
            margin-bottom: 15px;
        }
        
        .test-section {
            margin-bottom: 40px;
            padding: 25px;
            background: #fafafa;
            border-radius: 12px;
        }
        .test-section.duplicated {
            border-left: 5px solid #ff9800;
        }
        .test-section.duplicated h2 { color: #e65100; }
        .test-section.failure {
            border-left: 5px solid #f44336;
        }
        .test-section.failure h2 { color: #c62828; }
        .test-section.adopted {
            border-left: 5px solid #4caf50;
            background: #f1f8e9;
        }
        .test-section.adopted h2 { color: #2e7d32; }
        
        .approach-description {
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        .approach-description p { margin: 0 0 10px 0; color: #444; }
        .approach-description code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
            color: #d32f2f;
        }
        
        .code-block {
            background: #263238;
            color: #aed581;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 0.85rem;
            font-family: 'Fira Code', 'Consolas', monospace;
            margin: 10px 0 0 0;
        }
        
        .pros-cons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .pros, .cons {
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
        }
        .pros { border-top: 3px solid #4caf50; }
        .cons { border-top: 3px solid #f44336; }
        .pros h4 { color: #2e7d32; }
        .cons h4 { color: #c62828; }
        .pros ul, .cons ul {
            margin: 0;
            padding-left: 20px;
            color: #555;
            line-height: 1.8;
        }
        
        .references {
            background: #fff8e1;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .references h4 { color: #f57c00; }
        .references ul {
            margin: 0;
            padding-left: 20px;
            line-height: 1.8;
        }
        .references a {
            color: #1976d2;
            text-decoration: none;
        }
        .references a:hover { text-decoration: underline; }
        
        .demo {
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            border: 1px dashed #ccc;
        }
        .demo h4 { color: #666; font-weight: 500; }
        
        .adopted-demo {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .solution-note {
            margin-top: 15px;
            padding: 12px 15px;
            background: #c8e6c9;
            border-radius: 6px;
            font-size: 0.9rem;
            color: #1b5e20;
        }
        .solution-note code {
            background: rgba(0,0,0,0.1);
            padding: 2px 6px;
            border-radius: 4px;
        }
        
        .summary-section {
            background: #f5f5f5;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 40px;
        }
        .summary-section h2 { color: #333; }
        
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .comparison-table th, .comparison-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        .comparison-table th {
            background: #333;
            color: white;
            font-weight: 500;
        }
        .comparison-table tr:last-child td { border-bottom: none; }
        .comparison-table tr.highlight { background: #e8f5e9; }
        .comparison-table code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.85em;
        }
        .comparison-table .good { color: #2e7d32; }
        .comparison-table .bad { color: #c62828; }
        .comparison-table .neutral { color: #f57c00; }
        
        .table-note {
            margin-top: 10px;
            font-size: 0.85rem;
            color: #666;
            font-style: italic;
        }
        
        .other-approaches {
            background: #fafafa;
            padding: 25px;
            border-radius: 12px;
        }
        .other-approaches h2 { color: #333; margin-bottom: 20px; }
        
        .approach-card {
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid #9e9e9e;
        }
        .approach-card h4 { color: #333; margin-bottom: 8px; }
        .approach-card p { 
            color: #666; 
            margin: 0 0 10px 0;
            line-height: 1.5;
        }
        .approach-card a {
            color: #1976d2;
            text-decoration: none;
            font-size: 0.9rem;
        }
        .approach-card a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
            .pros-cons {
                grid-template-columns: 1fr;
            }
            .adopted-demo {
                flex-direction: column;
            }
        }
    `],
    imports: [ChildAComponent, ChildCComponent, ChildDComponent, ChildEComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StyleInheritanceTestComponent {}

