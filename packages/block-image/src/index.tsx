import React from 'react';
import { z } from 'zod';

const PADDING_SCHEMA = z
  .object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  })
  .optional()
  .nullable();

const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
  padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : undefined;

export const ImagePropsSchema = z.object({
  style: z
    .object({
      padding: PADDING_SCHEMA,
      backgroundColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional()
        .nullable(),
      textAlign: z.enum(['center', 'left', 'right']).optional().nullable(),
    })
    .optional()
    .nullable(),
  props: z
    .object({
      width: z.number().optional().nullable(),
      height: z.number().optional().nullable(),
      imageType: z.enum(['url', 'image', 'propertyCustomField']).optional().nullable(),
      url: z.string().optional().nullable(),
      imageID: z.number().optional().nullable(),
      propertyCustomFieldID: z.number().optional().nullable(),
      alt: z.string().optional().nullable(),
      linkHref: z.string().optional().nullable(),
      contentAlignment: z.enum(['top', 'middle', 'bottom']).optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type ImageProps = z.infer<typeof ImagePropsSchema>;

export function Image({ style, props }: ImageProps) {
  const linkHref = props?.linkHref ?? null;
  const width = props?.width ?? undefined;
  const height = props?.height ?? undefined;

  const padding = style?.padding ? getPadding(style.padding)!.split(' ') : [];

  const imageElement = (
    <img
      alt={props?.alt ?? ''}
      src={props?.url ?? ''}
      width={width}
      height={height}
      style={{
        width,
        height,
        outline: 'none',
        border: 'none',
        textDecoration: 'none',
        verticalAlign: props?.contentAlignment ?? 'middle',
        display: 'inline-block',
        maxWidth: '100%',
      }}
    />
  );

  return (
    <table
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      border={0}
      style={{ borderCollapse: 'collapse', width: '100%' }}
    >
      <tbody>
        {padding[0] && (
          <tr>
            <td colSpan={3} style={{ height: padding[0] }}></td>
          </tr>
        )}
        <tr>
          {padding[3] && <td style={{ width: padding[3] }}></td>}
          <td style={{ textAlign: style?.textAlign ?? undefined }}>
            {linkHref ? (
              <a href={linkHref} style={{ textDecoration: 'none' }} target="_blank">
                {imageElement}
              </a>
            ) : (
              imageElement
            )}
          </td>
          {padding[1] && <td style={{ width: padding[1] }}></td>}
        </tr>
        {padding[2] && (
          <tr>
            <td colSpan={3} style={{ height: padding[2] }}></td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
