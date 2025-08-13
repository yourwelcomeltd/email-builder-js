import insane, { AllowedTags } from 'insane';
import { marked, Renderer } from 'marked';
import React, { CSSProperties, useContext, useEffect, useMemo } from 'react';

import { ImageProviderContext } from '@usewaypoint/block-image';

const ALLOWED_TAGS: AllowedTags[] = [
  'a',
  'article',
  'b',
  'blockquote',
  'br',
  'caption',
  'code',
  'del',
  'details',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'ins',
  'kbd',
  'li',
  'main',
  'ol',
  'p',
  'pre',
  'section',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
];
const GENERIC_ALLOWED_ATTRIBUTES = ['style', 'title'];

function sanitizer(html: string): string {
  return insane(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      ...ALLOWED_TAGS.reduce<Record<string, string[]>>((res, tag) => {
        res[tag] = [...GENERIC_ALLOWED_ATTRIBUTES];
        return res;
      }, {}),
      img: ['src', 'srcset', 'alt', 'width', 'height', ...GENERIC_ALLOWED_ATTRIBUTES],
      table: ['width', ...GENERIC_ALLOWED_ATTRIBUTES],
      td: ['align', 'width', ...GENERIC_ALLOWED_ATTRIBUTES],
      th: ['align', 'width', ...GENERIC_ALLOWED_ATTRIBUTES],
      a: ['href', 'target', ...GENERIC_ALLOWED_ATTRIBUTES],
      ol: ['start', ...GENERIC_ALLOWED_ATTRIBUTES],
      ul: ['start', ...GENERIC_ALLOWED_ATTRIBUTES],
    },
  });
}

class CustomRenderer extends Renderer {
  table(header: string, body: string) {
    return `<table width="100%">
<thead>
${header}</thead>
<tbody>
${body}</tbody>
</table>`;
  }

  link(href: string, title: string | null, text: string) {
    if (!title) {
      return `<a href="${href}" target="_blank">${text}</a>`;
    }
    return `<a href="${href}" title="${title}" target="_blank">${text}</a>`;
  }

  image(href: string, title: string | null, text: string) {
    let out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += '>';
    return out;
  }
}

function renderMarkdownString(str: string): string {
  const html = marked.parse(str, {
    async: false,
    breaks: true,
    gfm: true,
    pedantic: false,
    silent: false,
    renderer: new CustomRenderer(),
  });
  if (typeof html !== 'string') {
    throw new Error('marked.parse did not return a string');
  }
  return sanitizer(html);
}

type Props = {
  style: CSSProperties;
  markdown: string;
};
export default function EmailMarkdown({ markdown, ...props }: Props) {
  const imageProvider = useContext(ImageProviderContext);
  const [imageURLCache, setImageURLCache] = React.useState<Map<string, string>>(new Map());
  const [loadingImageIDs, setLoadingImageIDs] = React.useState<Set<string>>(new Set());
  useEffect(() => {
    if (markdown && imageProvider) {
      const matches = [...markdown.matchAll(/{{_images.\[(.*?)\]}}/g)];
      if (imageProvider && matches) {
        for (const match of matches) {
          const imageID = match[1];
          if (imageURLCache.has(imageID) || loadingImageIDs.has(imageID)) {
            continue; // Skip if already cached
          }

          setLoadingImageIDs((prev) => new Set(prev).add(imageID));
          imageProvider
            .loadImage(imageID)
            .then((url) => {
              setLoadingImageIDs((prev) => {
                const newSet = new Set(prev);
                newSet.delete(imageID);
                return newSet;
              });
              setImageURLCache((prev) => new Map(prev).set(imageID, url));
            })
            .catch(() => {
              setLoadingImageIDs((prev) => {
                const newSet = new Set(prev);
                newSet.delete(imageID);
                return newSet;
              });
              setImageURLCache((prev) => new Map(prev).set(imageID, ''));
            });
        }
      }

      // Clean up cache for images not in markdown
      const currentImageIDs = new Set(matches.map((match) => match[1]));
      if (!Array.from(imageURLCache.keys()).every((key) => currentImageIDs.has(key))) {
        // If there are images in the cache that are not in the current markdown,
        // remove them from the cache
        setImageURLCache((prev) => {
          const newCache = new Map(prev);
          for (const [key] of newCache) {
            if (!currentImageIDs.has(key)) {
              newCache.delete(key);
            }
          }
          return newCache;
        });
      }
    } else {
      if (imageURLCache.size > 0) {
        setImageURLCache(new Map());
      }
    }
  }, [imageProvider, markdown, imageURLCache, loadingImageIDs]);

  const processedData = useMemo(() => {
    if (!markdown) return '';

    const processedMarkdown = markdown.replace(/{{_images.\[(.*?)\]}}/g, (match, imageID) => {
      const url = imageURLCache.get(imageID) || `ywimage://${imageID}`;
      return url;
    });

    const data = renderMarkdownString(processedMarkdown);
    return data;
  }, [markdown, imageURLCache]);

  return <div {...props} dangerouslySetInnerHTML={{ __html: processedData }} />;
}
