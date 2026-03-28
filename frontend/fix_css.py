import re

with open(r"d:\MCP\Campus-Notice\frontend\src\pages\AboutPage.css", "r", encoding='utf-8') as f:
    css = f.read()

# Replace variables block
old_vars = """  --g-bg: #050510;
  --g-bg2: #0a0a1a;
  --g-bg3: #0d0d20;
  --g-primary: #7c3aed;
  --g-primary-light: #a78bfa;
  --g-secondary: #06b6d4;
  --g-accent: #f472b6;
  --g-green: #10b981;
  --g-text: #e2e8f0;
  --g-text-dim: #94a3b8;
  --g-border: rgba(124, 58, 237, 0.25);
  --g-glass: rgba(255, 255, 255, 0.04);
  --g-radius: 16px;
  --g-radius-lg: 24px;
"""
new_vars = """  --g-bg: var(--bg-color);
  --g-bg2: var(--card-bg);
  --g-bg3: var(--card-bg);
  --g-primary: var(--primary-color);
  --g-primary-light: var(--primary-light);
  --g-secondary: var(--secondary-color);
  --g-accent: var(--accent-color);
  --g-green: var(--status-low);
  --g-text: var(--text-primary);
  --g-text-dim: var(--text-secondary);
  --g-border: var(--border-color);
  --g-glass: var(--glass-bg);
  --g-radius: var(--radius-md);
  --g-radius-lg: var(--radius-lg);
"""
css = css.replace(old_vars, new_vars)

# Fix white text colors
css = css.replace("color: #fff;", "color: var(--g-text);")
css = css.replace("color: #ffffff;", "color: var(--g-text);")

# Fix specific white background opacity (which becomes invisible on light background)
css = css.replace("rgba(255, 255, 255, 0.04)", "var(--g-glass)")
css = css.replace("rgba(255,255,255,0.04)", "var(--g-glass)")
css = css.replace("rgba(255,255,255,0.05)", "var(--g-glass)")
css = css.replace("rgba(255, 255, 255, 0.05)", "var(--g-glass)")
css = css.replace("rgba(255,255,255,0.06)", "var(--g-glass)")
css = css.replace("rgba(255, 255, 255, 0.06)", "var(--g-glass)")
css = css.replace("rgba(255,255,255,0.03)", "var(--g-glass)")
css = css.replace("rgba(255, 255, 255, 0.03)", "var(--g-glass)")
css = css.replace("rgba(255,255,255,0.02)", "var(--g-glass)")
css = css.replace("rgba(255, 255, 255, 0.02)", "var(--g-glass)")
css = css.replace("rgba(255,255,255,0.1)", "var(--g-glass)")
css = css.replace("rgba(255,255,255,0.15)", "var(--g-glass)")


with open(r"d:\MCP\Campus-Notice\frontend\src\pages\AboutPage.css", "w", encoding='utf-8') as f:
    f.write(css)

print("Replacement Complete")
