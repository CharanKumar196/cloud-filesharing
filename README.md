# Cloud File Sharing System

A full-stack web application for securely uploading, managing, and sharing files in the cloud. Built as a college project with the vision of launching as a real product.

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### Core Functionality
- **User Authentication**: Secure signup/login with email verification and OTP
- **File Management**: Upload, download, rename, delete, and archive files
- **Folder System**: Organize files into folders with breadcrumb navigation
- **File Preview**: View images, PDFs, and videos directly in the browser
- **Public Sharing**: Generate shareable links for public file access
- **Storage Dashboard**: Visual breakdown of storage usage with interactive cards

### Security & Performance
- **Authentication**: JWT-based token system with password hashing (bcrypt)
- **File Storage**: AWS S3 integration with signed URLs for secure access
- **Database**: Supabase (PostgreSQL) for reliable data management
- **Email Notifications**: Automated email verification and password reset

### UI/UX
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Feedback**: File upload progress tracking
- **Modal Components**: Profile editing, password change, feedback submission
- **Golden Ratio Design**: Professionally designed dashboard layout

---

## 🛠 Tech Stack

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Node.js v24.17.0**

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Supabase** - Backend-as-a-Service (PostgreSQL database)
- **AWS S3** - Cloud file storage
- **Nodemon** - Development server auto-reload

### Database & Services
- **Supabase (PostgreSQL)** - User data, files, folders
- **AWS S3** - File storage and CDN
- **Email Service** - Password reset and verification

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway

---

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** v14+ and **npm** installed
- **Git** for version control
- **Supabase** account (free tier available)
- **AWS S3** credentials for file storage
- **SMTP** credentials for email service (Gmail or similar)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vishwas-44/cloud-file-sharing.git
cd cloud-file-sharing
```

### 2. Set Up Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_REGION=us-east-1

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Server
PORT=5000
JWT_SECRET=your_jwt_secret_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Start the backend server:

```bash
npm start
```

Server runs on `http://localhost:5000`

### 3. Set Up Frontend

In a new terminal, navigate to the frontend:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```
REACT_APP_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm start
```

Frontend runs on `http://localhost:3000`

---

## 📁 Project Structure

```
cloud-file-sharing/
├── backend/
│   ├── config/
│   │   └── supabase.js          # Supabase client setup
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── fileController.js    # File operations
│   │   └── folderController.js  # Folder operations
│   ├── models/
│   │   ├── File.js              # File schema
│   │   ├── Folder.js            # Folder schema
│   │   ├── User.js              # User schema
│   │   └── Feedback.js          # Feedback schema
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── files.js             # File endpoints
│   │   └── folders.js           # Folder endpoints
│   ├── services/
│   │   ├── s3Service.js         # AWS S3 integration
│   │   └── emailService.js      # Email notifications
│   ├── middleware/
│   │   └── auth.js              # JWT verification
│   ├── .env                     # Environment variables
│   ├── index.js                 # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── PreviewModal.jsx # File preview
│   │   │   ├── SharedFileView.jsx # Public file view
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js           # API calls
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── public/
│
└── README.md                    # This file
```

---

## 🔑 Environment Variables Guide

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon public key | `eyJhbGciOi...` |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | `my-cloud-storage` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | Secret for JWT signing | `your_secret_key` |
| `EMAIL_USER` | Email for sending notifications | `your@gmail.com` |
| `EMAIL_PASSWORD` | App password (not regular password) | |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000` |

---

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email with OTP

### Files
- `GET /api/files` - Get all user files
- `POST /api/files/upload` - Upload a file
- `GET /api/files/:id` - Get file details
- `PATCH /api/files/:id` - Rename/archive file
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/:id/download` - Download file
- `POST /api/files/:id/share` - Generate share link
- `GET /api/public/files/:shareToken` - Access shared file

### Folders
- `GET /api/folders` - Get all folders
- `POST /api/folders` - Create folder
- `DELETE /api/folders/:id` - Delete folder
- `PATCH /api/folders/:id` - Update folder

### User
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile
- `PATCH /api/user/password` - Change password
- `GET /api/user/storage` - Get storage info

---

## 🔐 Security Notes

⚠️ **Important:**
1. **Never commit `.env` files** to GitHub (already in `.gitignore`)
2. **Rotate AWS credentials** if accidentally exposed
3. **Use HTTPS** in production
4. **Validate all inputs** on backend before processing
5. **Implement rate limiting** for authentication endpoints
6. **Use environment variables** for all sensitive data

---

## 🚢 Deployment

### Deploy Frontend (Vercel)

```bash
cd frontend
npm run build
vercel deploy
```

### Deploy Backend (Railway)

```bash
cd backend
# Connect to Railway via CLI or dashboard
railway up
```

**Set environment variables** in your deployment platform's dashboard for:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `AWS_*` credentials
- Email service credentials

---

## 🐛 Troubleshooting

### "Cannot find module 'cors'"
```bash
cd backend
npm install
```

### "Missing Supabase URL or Key"
Ensure your `.env` file has `SUPABASE_URL` and `SUPABASE_KEY` set correctly.

### "AWS S3 access denied"
Check AWS IAM permissions and ensure credentials have S3 access.

### CORS errors
Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL.

### Email not sending
- Verify email service credentials
- For Gmail: Use [App Passwords](https://support.google.com/accounts/answer/185833), not your regular password

---

## 📈 Roadmap

- [ ] File versioning
- [ ] Real-time collaboration
- [ ] End-to-end encryption
- [ ] Team workspaces
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] File compression
- [ ] Automated backups

---

## 📝 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 👨‍💻 Author

**Vishwas** - BCA Student at Sri Sai Vidya First Grade College

- GitHub: [@vishwas-44](https://github.com/vishwas-44)
- GitHub: [@charankumar196](http://github.com/CharanKumar196)
- Project Repo: [cloud-file-sharing](https://github.com/vishwas-44/cloud-file-sharing)

---

## 💬 Support & Feedback

Found a bug or have suggestions? 

- Open an [Issue](https://github.com/vishwas-44/cloud-file-sharing/issues)
- Submit a [Pull Request](https://github.com/vishwas-44/cloud-file-sharing/pulls)
- Use the in-app Feedback modal

---

## 📚 Resources

- [Supabase Documentation](https://supabase.io/docs)
- [AWS S3 Guide](https://docs.aws.amazon.com/s3/)
- [Express.js](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Happy uploading! ☁️**
