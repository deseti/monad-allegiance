# Monad Allegiance Dashboard

![Monad Allegiance](public/logo.png)

A comprehensive real-time dashboard for monitoring Monad blockchain activity, featuring advanced token tracking, DApps monitoring, interactive house pledging system, and leaderboard functionality.

## 🌐 Live Demo

- **Frontend**: [https://monad-allegiance.vercel.app/](https://monad-allegiance.vercel.app/)

## 🌟 Features

### Real-time Blockchain Monitoring
- **Live Block Updates**: Continuous monitoring of new blocks and transactions
- **Transaction Analytics**: Detailed transaction count tracking and gas price visualization
- **Network Statistics**: Real-time network performance metrics

### Advanced Token Tracking
- **Popular Tokens Dashboard**: Real-time ranking of most active tokens
- **Transaction Volume Analysis**: Comprehensive tracking of token interactions
- **Animated Activity Indicators**: Visual feedback for token activity levels

### DApps Integration Hub
- **Popular DApps Monitoring**: Track the most active decentralized applications
- **Contract Interaction Analytics**: Monitor smart contract usage patterns
- **Activity-based Ranking**: Dynamic sorting based on real-time usage data

### Interactive House Pledging System
- **House Selection Interface**: Choose from Chog, Molandak, or Moyaki houses  
- **Real-time Pledge Tracking**: Live updates of community allegiances
- **Visual Feedback System**: Interactive animations and state management

## 🏗️ Architecture

### Frontend (React/TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Hooks and Context API
- **Blockchain Integration**: Viem for Web3 interactions
- **Deployment**: Vercel with automatic CI/CD

### Backend (Node.js/Express)
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with connection pooling
- **Blockchain Monitoring**: Custom transaction watcher service
- **API**: RESTful endpoints with JSON responses
- **Deployment**: AWS EC2 with PM2 process management

### Blockchain Integration
- **Network**: Monad Testnet
- **RPC Provider**: Custom Monad RPC endpoints
- **Real-time Updates**: WebSocket connections for live data
- **Transaction Monitoring**: Automated blockchain event processing

## 🛠️ Tech Stack

### Frontend Technologies
- **React** - Component-based UI framework
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Advanced animations and transitions
- **Viem** - TypeScript-first Web3 library
- **Vite** - Modern build tool and development server

### Backend Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database management
- **pg** - PostgreSQL client for Node.js
- **CORS** - Cross-origin resource sharing middleware

### DevOps & Deployment
- **Vercel** - Frontend hosting and deployment
- **AWS EC2** - Backend server hosting
- **PM2** - Production process manager
- **DDNS** - Dynamic DNS for backend access

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Git

### Local Development Setup

1. **Clone the repository**:
```bash
git clone https://github.com/deseti/monad-allegiance.git
cd monad-allegiance
```

2. **Install frontend dependencies**:
```bash
npm install
```

3. **Set up backend**:
```bash
cd monad-backend
npm install
```

4. **Configure environment variables**:
```bash
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:3001

# Backend (.env)
DATABASE_URL=postgresql://username:password@localhost:5432/monad_db
PORT=3001
MONAD_RPC_URL=https://testnet1.monad.xyz
```

5. **Set up PostgreSQL database**:
```sql
CREATE DATABASE monad_db;
CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    number INTEGER,
    timestamp BIGINT,
    transaction_count INTEGER,
    gas_price BIGINT
);

CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42),
    name VARCHAR(100),
    symbol VARCHAR(10),
    count INTEGER DEFAULT 0
);

CREATE TABLE dapps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    address VARCHAR(42),
    count INTEGER DEFAULT 0
);
```

6. **Start the development servers**:

Backend:
```bash
cd monad-backend
npm start
```

Frontend:
```bash
npm run dev
```

7. **Access the application**:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000)

## 📦 Project Structure

```
monad-allegiance/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── ChogHouse.tsx       # Chog house component
│   │   ├── DappsList.tsx       # DApps listing component
│   │   ├── GasPriceChart.tsx   # Gas price visualization
│   │   ├── MolandakHouse.tsx   # Molandak house component
│   │   ├── MoyakiHouse.tsx     # Moyaki house component
│   │   └── TokenList.tsx       # Token listing component
│   ├── App.tsx                 # Main application component
│   └── main.tsx               # Application entry point
├── monad-backend/              # Backend source code
│   ├── src/                   # Backend modules
│   │   ├── db.js             # Database configuration
│   │   └── watcher.js        # Blockchain transaction watcher
│   ├── index.js              # Express server setup
│   └── package.json          # Backend dependencies
├── public/                    # Static assets
│   ├── logos/                # Token and DApp logos
│   └── music/               # Audio assets
└── package.json              # Frontend dependencies
```

## 🔌 API Endpoints

### Data Endpoints
- `GET /api/data` - Retrieve general blockchain statistics
- `GET /api/popular-tokens` - Get most active tokens with transaction counts
- `GET /api/popular-dapps` - Get most active DApps with usage statistics

### Health Check
- `GET /health` - Server health status

## 🚢 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `VITE_API_BASE_URL=https://monad-backend.ddns.net`
3. Deploy automatically on push to main branch

### Backend (AWS EC2)
1. Launch an EC2 instance with Node.js
2. Clone repository and install dependencies
3. Set up PostgreSQL database
4. Configure PM2 for process management:
```bash
pm2 start index.js --name monad-backend
pm2 startup
pm2 save
```
5. Set up DDNS for domain access

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**:
```env
VITE_API_BASE_URL=https://monad-backend.ddns.net
```

**Backend (.env)**:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/monad_db
PORT=3001
MONAD_RPC_URL=https://testnet1.monad.xyz
```

## 🧪 Testing

Run tests locally:
```bash
# Frontend tests
npm test

# Backend tests  
cd monad-backend
npm test
```

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### How to Contribute
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Make your changes**: Implement your feature or fix
4. **Test thoroughly**: Ensure all tests pass
5. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
6. **Push to the branch**: `git push origin feature/AmazingFeature`
7. **Open a Pull Request**: Describe your changes in detail

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Add tests for new features
- Update documentation as needed
- Ensure responsive design principles

## 📈 Performance & Monitoring

- **Real-time Updates**: WebSocket connections for live data streaming
- **Database Optimization**: Connection pooling and query optimization  
- **Caching Strategy**: Efficient data caching for improved performance
- **Error Handling**: Comprehensive error handling and logging
- **Health Monitoring**: Server health checks and uptime monitoring

## 🔒 Security

- **CORS Configuration**: Properly configured cross-origin requests
- **Environment Variables**: Secure handling of sensitive configuration
- **Database Security**: Parameterized queries to prevent SQL injection
- **Input Validation**: Server-side validation of all user inputs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**DeSeti** - [@deseti](https://github.com/deseti)
- Web3 Developer & Blockchain Enthusiast
- Monad Ecosystem Contributor  
- Full-Stack Developer

## 🙏 Acknowledgments

- **Monad Team** - For providing excellent blockchain infrastructure and support
- **Open Source Community** - For tools and libraries that made this project possible
- **Contributors** - Everyone who has contributed to improving this project
- **Beta Testers** - Community members who provided valuable feedback

## 📞 Support

For support, questions, or suggestions:
- Create an issue on GitHub
- Contact: [@deseti](https://github.com/deseti)
- Community Discord: [Join our community](https://discord.gg/monad)

---

**Built with ❤️ for the Monad Community**

*Empowering blockchain transparency through real-time data visualization*
