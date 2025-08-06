import React from 'react';
import { Box, Text } from 'ink';

interface GridCell {
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
  content: React.ReactNode;
}

interface DashboardGridProps {
  rows: number;
  cols: number;
  cells: GridCell[];
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ rows, cols, cells }) => {
  const cellWidth = 100 / cols;
  const cellHeight = 100 / rows;

  return (
    <Box flexDirection="column" width="100%" height="100%">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} flexDirection="row" height={`${cellHeight}%`}>
          {Array.from({ length: cols }).map((_, colIndex) => {
            const cell = cells.find(c => c.row === rowIndex && c.col === colIndex);
            if (cell) {
              return (
                <Box
                  key={`${rowIndex}-${colIndex}`}
                  width={`${cellWidth * (cell.colSpan || 1)}%`}
                  height="100%"
                  paddingRight={1}
                  paddingBottom={1}
                >
                  {cell.content}
                </Box>
              );
            }
            return null;
          })}
        </Box>
      ))}
    </Box>
  );
};