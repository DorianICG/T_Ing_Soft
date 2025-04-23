# Software Engineering Project

## Overview
This repository contains the files and resources for our Software Engineering project, which includes a mobile and web application built with Expo, as well as a backend and database package.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites
- Git installed on your system
- Node.js (v14 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For mobile testing: Expo Go app on your iOS/Android device or emulator

## Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/T_Ing_Soft.git
```

2. Navigate to the project directory:
```bash
cd T_Ing_Soft
```

3. Install dependencies:
```bash
# Install root dependencies
yarn install # or npm install

# Install backend dependencies
cd backend
yarn install
cd ..

# Install database package dependencies
cd packages/database
yarn install
cd ../..
```

## Running the Application
1. Start the backend:
```bash
cd backend
yarn start # or npm start
cd ..
```

2. Start the database (if needed separately):
```bash
cd packages/database
yarn start # or npm start
cd ../..
```

3. Start the Expo application:
```bash
# From the root directory
expo start
```

4. For the web version:
```bash
# Press 'w' in the Expo CLI or use:
expo start --web
```

5. For mobile testing:
  - Scan the QR code with the Expo Go app on your device
  - Press 'a' for Android emulator or 'i' for iOS simulator

## Features
- Cross-platform mobile and web application using Expo
- Robust backend API
- Structured database management
- [Add specific features of your application]

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.