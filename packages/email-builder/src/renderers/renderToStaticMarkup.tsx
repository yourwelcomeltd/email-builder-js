import React from 'react';
import { renderToStaticMarkup as baseRenderToStaticMarkup } from 'react-dom/server';

import TranslationsContext, { TranslationsContextType } from '@usewaypoint/translations';

import Reader, { TReaderDocument } from '../Reader/core';

type TOptions = {
  rootBlockId: string;
  translationLanguage?: string;
  wrapInHtml?: boolean;
};
export default function renderToStaticMarkup(document: TReaderDocument, { rootBlockId, translationLanguage, wrapInHtml }: TOptions) {
  const translationContext: TranslationsContextType = {
    useTranslations: Boolean(translationLanguage),
    getCurrentLanguage: () => translationLanguage || 'en',
  };

  const content = (
    <TranslationsContext.Provider value={translationContext}>
      <Reader document={document} rootBlockId={rootBlockId} />
    </TranslationsContext.Provider>
  );

  return wrapInHtml == null || wrapInHtml ?
    '<!DOCTYPE html>' +
    baseRenderToStaticMarkup(
      <html>
        <body>
          {content}
        </body>
      </html>
    ) :
    baseRenderToStaticMarkup(content);
}
