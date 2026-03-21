import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveTemplatePath(template) {
  const cleanTemplate = String(template || '').trim().replace(/^[/\\]+/, '');
  return path.join(__dirname, 'layouts', 'LISBONWHISPER', cleanTemplate);
}

function resolvePartialPath(partialName) {
  const cleanName = String(partialName || '')
    .trim()
    .replace(/^partials[\\/]/i, '')
    .replace(/^[/\\]+/, '');
  const fileName = cleanName.endsWith('.html') ? cleanName : `${cleanName}.html`;
  return path.join(__dirname, 'layouts', 'LISBONWHISPER', 'partials', fileName);
}

function renderPartials(html, depth = 0) {
  if (!html || depth > 5) return html || '';

  return html.replace(/\{\{\s*>\s*([^\s}]+)\s*\}\}/g, (match, partialName) => {
    const partialPath = resolvePartialPath(partialName);
    if (!fs.existsSync(partialPath)) return '';

    const partialHtml = fs.readFileSync(partialPath, 'utf8');
    return renderPartials(partialHtml, depth + 1);
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function renderEmail({ template, variables = {} }) {
  const templatePath = resolveTemplatePath(template);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Email template not found: ${templatePath}`);
  }

  let html = fs.readFileSync(templatePath, 'utf8');
  html = renderPartials(html);

  Object.entries(variables).forEach(([key, rawValue]) => {
    const value = rawValue == null ? '' : String(rawValue);
    html = html.replace(new RegExp(`\\{\\{${escapeRegExp(key)}\\}\\}`, 'g'), value);
  });

  return html;
}
