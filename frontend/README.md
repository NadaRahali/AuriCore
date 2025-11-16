# AURICORE Frontend

A React Native mobile application for migraine prediction and management, built with Expo.

## Features

- **Migraine Prediction** - AI-powered risk assessment using health data, weather, and calendar
- **Health Data Integration** - HealthKit, location, calendar, and wearable device data
- **Dashboard** - Real-time migraine risk, weather insights, and calendar analysis
- **Brain Meditation** - Breathing exercises and meditation for migraine relief
- **Community & Support** - Safe space for sharing experiences and support
- **Insights** - Sleep stages, nutrition tracking, and doctor reports
- **Premium Features** - Prescription management and nutritionist consultations

## Tech Stack

- **React Native** with Expo
- **Supabase** - Backend and authentication
- **Firebase** - Additional data storage
- **React Navigation** - Screen navigation
- **Expo Linear Gradient** - UI gradients
- **OpenWeatherMap API** - Weather data

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
```

## Environment Setup

Configure the following in your environment:

- Supabase URL and keys
- Firebase configuration
- OpenWeatherMap API key (configured in `config/app.js`)

## Project Structure

```
frontend/
├── screens/          # App screens
├── navigation/       # Navigation configuration
├── lib/              # Services and utilities
├── config/           # Theme and app configuration
├── components/       # Reusable components
└── supabase/         # Database migrations
```

## Development

The app uses Supabase for authentication and data storage, with Firebase for additional health data synchronization.

