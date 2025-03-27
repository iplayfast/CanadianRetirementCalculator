import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto' 
    }}>
      <h1>Canadian Retirement Planner</h1>
      <p>This is a simplified debug version to test rendering.</p>
      <button 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#1976d2', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
        onClick={() => alert('Button clicked!')}
      >
        Test Button
      </button>
    </div>
  );
}

export default App;
