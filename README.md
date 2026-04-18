# ConnectSphere

A modern, full-stack video sharing platform inspired by YouTube, built with the MERN stack (MongoDB, Express.js, React, Node.js). Users can upload videos, like/comment, subscribe to channels, and manage playlists.

## Features

- **User Authentication**: Secure signup, login, and OTP verification
- **Video Management**: Upload, stream, and manage videos with Cloudinary integration
- **Social Interactions**: Like videos, comment threads, and subscribe to channels
- **Playlists**: Create and manage custom playlists
- **Dashboard**: View stats, watch history, and liked videos
- **Responsive Design**: Modern UI with dark theme using Tailwind CSS
- **Real-time Updates**: Seamless user experience with React Query

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT tokens with HTTP-only cookies
- **File Storage**: Cloudinary for video/image uploads
- **Email**: Resend for notifications
- **Deployment**: Vercel (frontend), Render (backend)

## Try it out

Visit [ConnectSphere](https://connect-sphere-hardik7.vercel.app/login?email=hardiksindhu789@gmail.com&password=111111) to log in with guest credentials and explore the app.

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/connectsphere.git
   cd connectsphere
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Fill in the .env file with your values
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the app**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

### Environment Variables

Create `backend/.env` with:
- `MONGODB_URI`: Your MongoDB connection string
- `ACCESS_TOKEN_SECRET`: Secret for JWT access tokens
- `REFRESH_TOKEN_SECRET`: Secret for JWT refresh tokens
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials
- `RESEND_API_KEY`: Resend API key for emails
- `EMAIL_FROM`: Sender email address

## Deployment

### Backend on Render

1. Connect your GitHub repo to Render
2. Set build command: `npm ci`
3. Set start command: `node src/index.js`
4. Add environment variables as listed above, plus:
   - `NODE_ENV=production`
   - `PORT=8000`
   - `CORS_ORIGIN=https://your-frontend.vercel.app`

### Frontend on Vercel

1. Connect your GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please open an issue on GitHub.
