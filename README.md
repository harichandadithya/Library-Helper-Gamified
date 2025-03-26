# Library Helper Game

A therapeutic VR-like game that helps users improve motor control and stability through book organization tasks. The game uses phone sensors (via HyperIMU app) for motion controls.

## 🎯 Features

- Motion-controlled gameplay using phone sensors
- Progressive difficulty levels
- Real-time stability tracking
- Therapeutic metrics monitoring
- Audio feedback system
- Debug console for development
- Adjustable sensitivity controls

## 🛠 Tech Stack

- React
- Three.js (via React Three Fiber)
- TypeScript
- Zustand (State Management)
- WebSocket/TCP Communication
- Tailwind CSS

## 📱 Prerequisites

- Node.js (v16 or higher)
- HyperIMU app installed on your phone
- Modern web browser
- Phone and computer on same network

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd library-helper-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the TCP server:
```bash
npm run server
```

4. Start the development server:
```bash
npm run dev
```

5. Configure HyperIMU app:
   - Open HyperIMU on your phone
   - Set TCP server IP to your computer's IP
   - Set port to 5556
   - Enable Accelerometer and Gyroscope
   - Start streaming

## 🎮 Controls

- **Phone Movement:**
  - Tilt left/right to move between tables
  - Tilt forward to pick up books
  - Tilt backward to place books

- **Sensitivity:** Adjust motion sensitivity in the control panel
- **Debug:** Press \` (backtick) to toggle debug console

## 📊 Therapeutic Metrics

- Stability Score
- Precision Score
- Completion Time
- Sequence Accuracy

## 🎯 Game Levels

1. **Basic Book Handling** - Learn basic controls
2. **Sequential Movement** - Time-based tasks
3. **Complex Organization** - Size-based sorting
4. **Speed Challenge** - Quick movements while maintaining stability
5. **Precision Master** - High stability requirements
6. **Time Trial** - Color-based sorting under time pressure

## 🔧 Configuration

Adjust game settings in the control panel:
- Movement sensitivity
- Sound volume
- Mock data toggle (for testing)

## 🐛 Debugging

- Toggle debug console with \` key
- Monitor sensor data in real-time
- Track game state and metrics
- View connection status

## 📝 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines]

## 📞 Support

[Your Support Information]
