import React, { CSSProperties } from 'react';
import { z } from 'zod';

const COLOR_SCHEMA = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable()
  .optional();

const PADDING_SCHEMA = z
  .object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  })
  .optional()
  .nullable();

const FIXED_WIDTHS_SCHEMA = z
  .tuple([z.number().nullish(), z.number().nullish(), z.number().nullish()])
  .optional()
  .nullable();

const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
  padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : undefined;

export const ColumnsContainerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      fixedWidths: FIXED_WIDTHS_SCHEMA,
      columnsCount: z
        .union([z.literal(2), z.literal(3)])
        .optional()
        .nullable(),
      columnsGap: z.number().optional().nullable(),
      contentAlignment: z.enum(['top', 'middle', 'bottom']).optional().nullable(),
    })
    .optional()
    .nullable(),
});

type TColumn = JSX.Element | JSX.Element[] | null;
export type ColumnsContainerProps = z.infer<typeof ColumnsContainerPropsSchema> & {
  columns?: TColumn[];
};

const ColumnsContainerPropsDefaults = {
  columnsCount: 2,
  columnsGap: 0,
  contentAlignment: 'middle',
} as const;

export function ColumnsContainer({ style, columns, props }: ColumnsContainerProps) {
  const wStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
  };

  const blockProps = {
    columnsCount: props?.columnsCount ?? ColumnsContainerPropsDefaults.columnsCount,
    columnsGap: props?.columnsGap ?? ColumnsContainerPropsDefaults.columnsGap,
    contentAlignment: props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment,
    fixedWidths: props?.fixedWidths,
  };

  const padding = style?.padding ? getPadding(style.padding)!.split(' ') : [];

  return (
    <table
      align="center"
      width="100%"
      cellPadding="0"
      border={0}
      style={{ tableLayout: 'fixed', borderCollapse: 'collapse', width: '100%' }}
    >
      <tbody>
        {padding[0] && (
          <tr>
            {padding[3] && <td style={{ width: padding[3] }}></td>}
            <td style={{ height: padding[0] }}></td>
            {padding[1] && <td style={{ width: padding[1] }}></td>}
          </tr>
        )}
        <tr>
          {padding[3] && <td style={{ width: padding[3] }}></td>}
          <td style={{ width: '100%' }}>
            <div style={wStyle}>
              <table
                align="center"
                width="100%"
                cellPadding="0"
                border={0}
                style={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}
              >
                <tbody style={{ width: '100%' }}>
                  <tr style={{ width: '100%' }}>
                    <TableCell index={0} props={blockProps} columns={columns} />
                    <TableCell index={1} props={blockProps} columns={columns} />
                    <TableCell index={2} props={blockProps} columns={columns} />
                  </tr>
                </tbody>
              </table>
            </div>
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

type Props = {
  props: {
    fixedWidths: z.infer<typeof FIXED_WIDTHS_SCHEMA>;
    columnsCount: 2 | 3;
    columnsGap: number;
    contentAlignment: 'top' | 'middle' | 'bottom';
  };
  index: number;
  columns?: TColumn[];
};
function TableCell({ index, props, columns }: Props) {
  const contentAlignment = props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment;
  const columnsCount = props?.columnsCount ?? ColumnsContainerPropsDefaults.columnsCount;

  if (columnsCount === 2 && index === 2) {
    return null;
  }

  const style: CSSProperties = {
    boxSizing: 'content-box',
    verticalAlign: contentAlignment,
    paddingLeft: getPaddingBefore(index, props),
    paddingRight: getPaddingAfter(index, props),
    width: props.fixedWidths?.[index] ?? undefined,
  };
  const children = (columns && columns[index]) ?? null;
  return <td style={style}>{children}</td>;
}

function getPaddingBefore(index: number, { columnsGap, columnsCount }: Props['props']) {
  if (index === 0) {
    return 0;
  }
  if (columnsCount === 2) {
    return columnsGap / 2;
  }
  if (index === 1) {
    return columnsGap / 3;
  }
  return (2 * columnsGap) / 3;
}

function getPaddingAfter(index: number, { columnsGap, columnsCount }: Props['props']) {
  if (columnsCount === 2) {
    if (index === 0) {
      return columnsGap / 2;
    }
    return 0;
  }

  if (index === 0) {
    return (2 * columnsGap) / 3;
  }
  if (index === 1) {
    return columnsGap / 3;
  }
  return 0;
}
