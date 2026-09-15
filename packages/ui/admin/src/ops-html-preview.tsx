'use client';

import { useLayoutEffect, useRef } from 'react';
import { cn } from '@community/ui';

function paintHtml(iframe: HTMLIFrameElement, html: string) {
  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.srcdoc = html;
    return;
  }
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const nextHead = parsed.head;
  const nextBody = parsed.body;
  if (!doc.head || !doc.body || !nextHead || !nextBody) {
    doc.open();
    doc.write(html);
    doc.close();
    return;
  }
  doc.head.replaceChildren(...Array.from(nextHead.childNodes, (node) => doc.importNode(node, true)));
  doc.body.replaceChildren(...Array.from(nextBody.childNodes, (node) => doc.importNode(node, true)));
  const style = nextBody.getAttribute('style');
  if (style) {
    doc.body.setAttribute('style', style);
  } else {
    doc.body.removeAttribute('style');
  }
}

export function OpsHtmlPreview({
  title,
  html,
  className,
}: {
  title: string;
  html: string;
  className?: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useLayoutEffect(() => {
    const iframe = frameRef.current;
    if (!iframe || !html) {
      return;
    }
    paintHtml(iframe, html);
  }, [html]);

  return (
    <iframe
      ref={frameRef}
      title={title}
      src="about:blank"
      className={cn('h-[36rem] w-full rounded-md border border-border bg-background', className)}
    />
  );
}
