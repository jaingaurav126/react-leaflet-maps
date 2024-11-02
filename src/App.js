// src/App.js
import React from 'react';
import MapComponent from './MapComponent';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports'; // Import the generated aws-exports.js

Amplify.configure(awsconfig); // Configure Amplify with the generated config

const App = () => {
  return (
    <div>
      <h1>Weather Detecter</h1>
      <MapComponent />
    </div>
  );
};

export default App;
