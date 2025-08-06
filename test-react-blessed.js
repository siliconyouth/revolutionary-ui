const blessed = require('blessed');
const React = require('react');
const { render } = require('react-blessed');

// Simple test component
class App extends React.Component {
  render() {
    return React.createElement('box', {
      top: 'center',
      left: 'center',
      width: '50%',
      height: '50%',
      border: { type: 'line' },
      style: { border: { fg: 'cyan' } }
    }, React.createElement('text', {
      top: 'center',
      left: 'center',
      content: 'React-Blessed is working with React 18!'
    }));
  }
}

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'React-Blessed Test'
});

// Render
try {
  render(React.createElement(App), screen);
  console.log('React version:', React.version);
  
  // Exit on q
  screen.key(['q', 'C-c'], () => {
    process.exit(0);
  });
} catch (error) {
  console.error('Error:', error.message);
  console.error('React version:', React.version);
  process.exit(1);
}