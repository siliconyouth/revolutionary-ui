/**
 * Terminal UI System using blessed
 * Provides rich terminal widgets and layouts
 */

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import chalk from 'chalk';

export class TerminalUI {
  private screen: blessed.Widgets.Screen;
  private grid: any;
  private widgets: Map<string, any> = new Map();
  private theme = {
    primary: 'cyan',
    secondary: 'magenta',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    border: 'white',
    text: 'white',
    dim: 'gray'
  };

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Revolutionary UI - Terminal',
      fullUnicode: true,
      autoPadding: true,
      warnings: true
    });

    // Create grid layout
    this.grid = new contrib.grid({
      rows: 12,
      cols: 12,
      screen: this.screen
    });

    // Setup key bindings
    this.setupKeyBindings();
  }

  private setupKeyBindings() {
    // Global key bindings
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.destroy();
    });

    this.screen.key(['tab'], () => {
      this.focusNext();
    });

    this.screen.key(['S-tab'], () => {
      this.focusPrevious();
    });
  }

  /**
   * Create a box widget
   */
  createBox(options: {
    label: string;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
    content?: string;
  }) {
    const box = this.grid.set(
      options.row,
      options.col,
      options.rowSpan,
      options.colSpan,
      blessed.box,
      {
        label: ` ${options.label} `,
        content: options.content || '',
        tags: true,
        border: {
          type: 'line',
          fg: this.theme.border
        },
        style: {
          fg: this.theme.text,
          border: {
            fg: this.theme.border
          },
          label: {
            fg: this.theme.primary
          }
        },
        scrollable: true,
        alwaysScroll: true,
        scrollbar: {
          style: {
            bg: this.theme.dim
          }
        },
        keys: true,
        vi: true,
        mouse: true
      }
    );

    this.widgets.set(options.label, box);
    return box;
  }

  /**
   * Create a list widget
   */
  createList(options: {
    label: string;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
    items?: string[];
  }) {
    const list = this.grid.set(
      options.row,
      options.col,
      options.rowSpan,
      options.colSpan,
      blessed.list,
      {
        label: ` ${options.label} `,
        items: options.items || [],
        tags: true,
        border: {
          type: 'line',
          fg: this.theme.border
        },
        style: {
          fg: this.theme.text,
          border: {
            fg: this.theme.border
          },
          label: {
            fg: this.theme.primary
          },
          selected: {
            bg: this.theme.primary,
            fg: 'black'
          }
        },
        scrollable: true,
        alwaysScroll: true,
        scrollbar: {
          style: {
            bg: this.theme.dim
          }
        },
        keys: true,
        vi: true,
        mouse: true,
        interactive: true
      }
    );

    this.widgets.set(options.label, list);
    return list;
  }

  /**
   * Create a progress bar
   */
  createProgressBar(options: {
    label: string;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
  }) {
    const gauge = this.grid.set(
      options.row,
      options.col,
      options.rowSpan,
      options.colSpan,
      contrib.gauge,
      {
        label: ` ${options.label} `,
        stroke: this.theme.primary,
        fill: 'white',
        showLabel: true,
        percent: 0
      }
    );

    this.widgets.set(options.label, gauge);
    return gauge;
  }

  /**
   * Create a log/output widget
   */
  createLog(options: {
    label: string;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
  }) {
    const log = this.grid.set(
      options.row,
      options.col,
      options.rowSpan,
      options.colSpan,
      contrib.log,
      {
        label: ` ${options.label} `,
        tags: true,
        border: {
          type: 'line',
          fg: this.theme.border
        },
        style: {
          fg: this.theme.text,
          border: {
            fg: this.theme.border
          },
          label: {
            fg: this.theme.primary
          }
        },
        scrollable: true,
        alwaysScroll: true,
        scrollbar: {
          style: {
            bg: this.theme.dim
          }
        },
        keys: true,
        vi: true,
        mouse: true
      }
    );

    this.widgets.set(options.label, log);
    return log;
  }

  /**
   * Create a table widget
   */
  createTable(options: {
    label: string;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
    headers?: string[];
    data?: string[][];
  }) {
    const table = this.grid.set(
      options.row,
      options.col,
      options.rowSpan,
      options.colSpan,
      contrib.table,
      {
        label: ` ${options.label} `,
        keys: true,
        vi: true,
        mouse: true,
        fg: this.theme.text,
        selectedFg: 'white',
        selectedBg: this.theme.primary,
        interactive: true,
        columnSpacing: 2,
        columnWidth: options.headers?.map(() => 16) || [16, 16, 16],
        border: {
          type: 'line',
          fg: this.theme.border
        },
        style: {
          header: {
            fg: this.theme.primary,
            bold: true
          },
          cell: {
            fg: this.theme.text
          }
        }
      }
    );

    if (options.headers) {
      table.setData({
        headers: options.headers,
        data: options.data || []
      });
    }

    this.widgets.set(options.label, table);
    return table;
  }

  /**
   * Create a chart widget
   */
  createLineChart(options: {
    label: string;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
  }) {
    const line = this.grid.set(
      options.row,
      options.col,
      options.rowSpan,
      options.colSpan,
      contrib.line,
      {
        label: ` ${options.label} `,
        style: {
          line: this.theme.primary,
          text: this.theme.text,
          baseline: this.theme.dim
        },
        xLabelPadding: 3,
        xPadding: 5,
        showLegend: true,
        wholeNumbersOnly: false,
        border: {
          type: 'line',
          fg: this.theme.border
        }
      }
    );

    this.widgets.set(options.label, line);
    return line;
  }

  /**
   * Create a markdown widget
   */
  createMarkdown(options: {
    label: string;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
    content?: string;
  }) {
    const markdown = this.grid.set(
      options.row,
      options.col,
      options.rowSpan,
      options.colSpan,
      blessed.box,
      {
        label: ` ${options.label} `,
        content: options.content || '',
        tags: true,
        border: {
          type: 'line',
          fg: this.theme.border
        },
        style: {
          fg: this.theme.text,
          border: {
            fg: this.theme.border
          },
          label: {
            fg: this.theme.primary
          }
        },
        scrollable: true,
        alwaysScroll: true,
        scrollbar: {
          style: {
            bg: this.theme.dim
          }
        },
        keys: true,
        vi: true,
        mouse: true
      }
    );

    this.widgets.set(options.label, markdown);
    return markdown;
  }

  /**
   * Create a form widget
   */
  createForm(options: {
    label: string;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
  }) {
    const form = this.grid.set(
      options.row,
      options.col,
      options.rowSpan,
      options.colSpan,
      blessed.form,
      {
        label: ` ${options.label} `,
        border: {
          type: 'line',
          fg: this.theme.border
        },
        style: {
          fg: this.theme.text,
          border: {
            fg: this.theme.border
          },
          label: {
            fg: this.theme.primary
          }
        },
        keys: true,
        vi: true
      }
    );

    this.widgets.set(options.label, form);
    return form;
  }

  /**
   * Show a message box
   */
  showMessage(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const colors = {
      info: this.theme.primary,
      success: this.theme.success,
      warning: this.theme.warning,
      error: this.theme.error
    };

    const msg = blessed.message({
      parent: this.screen,
      border: 'line',
      height: 'shrink',
      width: 'half',
      top: 'center',
      left: 'center',
      label: ` ${title} `,
      tags: true,
      keys: true,
      hidden: true,
      vi: true,
      style: {
        border: {
          fg: colors[type]
        },
        label: {
          fg: colors[type]
        }
      }
    });

    msg.display(message, 0, () => {
      msg.destroy();
    });
  }

  /**
   * Show a loading spinner
   */
  showLoading(message: string) {
    const loading = blessed.loading({
      parent: this.screen,
      border: 'line',
      height: 'shrink',
      width: 'half',
      top: 'center',
      left: 'center',
      label: ` Loading `,
      tags: true,
      keys: true,
      hidden: false,
      vi: true,
      style: {
        border: {
          fg: this.theme.primary
        },
        label: {
          fg: this.theme.primary
        }
      }
    });

    loading.load(message);
    return loading;
  }

  /**
   * Update widget content
   */
  updateWidget(name: string, content: any) {
    const widget = this.widgets.get(name);
    if (widget) {
      if (widget.setContent) {
        widget.setContent(content);
      } else if (widget.setData) {
        widget.setData(content);
      } else if (widget.setPercent) {
        widget.setPercent(content);
      } else if (widget.log) {
        widget.log(content);
      }
      this.render();
    }
  }

  /**
   * Focus on a widget
   */
  focus(name: string) {
    const widget = this.widgets.get(name);
    if (widget) {
      widget.focus();
    }
  }

  /**
   * Focus next widget
   */
  focusNext() {
    this.screen.focusNext();
  }

  /**
   * Focus previous widget
   */
  focusPrevious() {
    this.screen.focusPrevious();
  }

  /**
   * Render the screen
   */
  render() {
    this.screen.render();
  }

  /**
   * Destroy the UI
   */
  destroy() {
    this.screen.destroy();
    process.exit(0);
  }

  /**
   * Get a widget by name
   */
  getWidget(name: string) {
    return this.widgets.get(name);
  }

  /**
   * Set theme colors
   */
  setTheme(theme: Partial<typeof this.theme>) {
    this.theme = { ...this.theme, ...theme };
  }
}