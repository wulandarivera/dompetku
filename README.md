# Cashflow Native App

A mobile application built with React Native and Expo for managing personal finances and tracking cash flow.

## 🚀 Features

- 📊 Financial tracking and management
- 💰 Income and expense tracking
- 📈 Visual charts and analytics
- 🔔 Push notifications
- 🔄 Real-time data synchronization
- 📱 Cross-platform (iOS & Android)

## 🛠 Tech Stack

- **Framework:** React Native with Expo
- **Database:** Supabase
- **State Management:** React Context
- **Authentication:** Supabase Auth
- **Charts:** react-native-chart-kit
- **Navigation:** React Navigation v6
- **Storage:** AsyncStorage
- **Environment Variables:** react-native-dotenv

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development, macOS only)

## 🚀 Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd cashflow-native-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Running the App

1. Start the development server:
```bash
npm start
# or
yarn start
```

2. Run on specific platforms:
```bash
# For Android
npm run android
# or
yarn android

# For iOS
npm run ios
# or
yarn ios
```

## 📁 Project Structure

```
cashflow-native-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── config/        # Configuration files
│   ├── constants/     # Constants and theme files
│   ├── context/       # React Context providers
│   ├── screens/       # Application screens
│   └── services/      # API and business logic
├── assets/           # Images, fonts, and other static files
├── .env             # Environment variables
└── App.js           # Application entry point
```

## 🔐 Environment Variables

The application uses the following environment variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Key Dependencies

- `@react-navigation/native` & `@react-navigation/native-stack`: Navigation
- `@supabase/supabase-js`: Database and authentication
- `@react-native-async-storage/async-storage`: Local storage
- `react-native-chart-kit`: Data visualization
- `expo-notifications`: Push notifications
- `expo-device`: Device information

## 🔄 State Management

The application uses React Context for state management, with the following main contexts:
- Authentication state
- User preferences
- Financial data

## 📱 Screens

- Login/Registration
- Dashboard
- Transaction Management
- Reports and Analytics
- Settings
- Profile

## 🛠 Development

### Code Style
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Follow the established project structure

### Testing
```bash
# Run tests
npm test
# or
yarn test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please contact [your-email] or open an issue in the repository.
