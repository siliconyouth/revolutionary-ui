import React from 'react';
import { Box, Text } from 'ink';

interface DataTableProps {
  data: Record<string, any>[];
  columns?: string[];
  title?: string;
  borderColor?: string;
  headerColor?: string;
  maxRows?: number;
}

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  title,
  borderColor = 'cyan',
  headerColor = 'cyan',
  maxRows = 10
}) => {
  const displayData = data.slice(0, maxRows);
  
  // If columns not specified, use all keys from first item
  const displayColumns = columns || Object.keys(data[0] || {});
  
  // Calculate column widths
  const columnWidths = displayColumns.reduce((acc, col) => {
    const maxLength = Math.max(
      col.length,
      ...displayData.map(row => String(row[col] || '').length)
    );
    acc[col] = Math.min(maxLength + 2, 20); // Cap at 20 chars
    return acc;
  }, {} as Record<string, number>);
  
  const formatCell = (value: any, width: number) => {
    const str = String(value || '');
    if (str.length > width - 2) {
      return str.substring(0, width - 5) + '...';
    }
    return str.padEnd(width - 2);
  };
  
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={borderColor} paddingX={1}>
      {title && (
        <Box marginBottom={1}>
          <Text color={headerColor} bold>{title}</Text>
        </Box>
      )}
      
      {/* Header row */}
      <Box>
        {displayColumns.map(col => (
          <Box key={col} width={columnWidths[col]} marginRight={1}>
            <Text color={headerColor} bold>
              {formatCell(col.toUpperCase(), columnWidths[col])}
            </Text>
          </Box>
        ))}
      </Box>
      
      {/* Separator */}
      <Box>
        <Text color={borderColor}>
          {displayColumns.map(col => '─'.repeat(columnWidths[col] - 2)).join('─')}
        </Text>
      </Box>
      
      {/* Data rows */}
      {displayData.map((row, index) => (
        <Box key={index}>
          {displayColumns.map(col => (
            <Box key={col} width={columnWidths[col]} marginRight={1}>
              <Text color="white">
                {formatCell(row[col], columnWidths[col])}
              </Text>
            </Box>
          ))}
        </Box>
      ))}
      
      {data.length > maxRows && (
        <Box marginTop={1}>
          <Text color="gray" dimColor>
            ... and {data.length - maxRows} more rows
          </Text>
        </Box>
      )}
    </Box>
  );
};