# 🚀 WECode – Full-Stack Competitive Coding Platform

WECode is a full-featured competitive programming platform, built with a modern full-stack architecture. It allows users to solve coding problems, run code in real-time, and get AI-powered assistance — all within a single platform.

---

## ✨ Key Features

### 🧠 AI-Powered Coding Assistant

* Contextual hints without revealing answers
* Full solutions with explanations when stuck

### ⚡ Real-Time Code Execution

* Integrated with **Judge0 API**
* Supports multiple programming languages
* Executes code against test cases instantly

### 📚 Problem Library & Tracking

* coding problems
* Personal solve history
* Revisit previous submissions anytime

### 💰 Monetized Video Solutions

* Admin-uploaded premium video explanations
* Payment-based access (real-world product feature)

### 🔐 Authentication & Security

* JWT-based authentication
* **Redis token blacklisting** for secure logout
* Role-Based Access Control (RBAC)
* Email services via SendGrid

### 📊 Admin Dashboard

* Manage problems and content
* Upload video solutions
* Monitor submission analytics

### 🔄 Real-Time Feedback

* Powered by **Socket.IO**
* Instant result updates without refresh

---

## 🛠️ Tech Stack

| Technology               | Usage                        |
| ------------------------ | ---------------------------- |
| **React.js**             | Frontend UI                  |
| **Node.js + Express.js** | Backend API                  |
| **MongoDB**              | Database                     |
| **Redis**                | Token blacklisting & caching |
| **Socket.IO**            | Real-time communication      |
| **Judge0 API**           | Code execution engine        |
| **SendGrid**             | Email services               |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/abhinandansharma11/LetsCode.git
cd LetsCode
```

### 2️⃣ Install dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

---

### 3️⃣ Environment Variables

Create a `.env` file inside the **backend** folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
REDIS_URL=your_redis_url
SENDGRID_API_KEY=your_sendgrid_key
JWT_SECRET=your_secret_key
```

---

### 4️⃣ Run the Project

#### Start backend

```bash
cd backend
npm run dev
```

#### Start frontend

```bash
cd frontend
npm npm run dev
```

---



## 🔁 System Flow

```
User → Writes Code → Backend → Judge0 API
     → Execution → Result via Socket.IO → UI Update
```

---

## 🚀 What Makes WECode Unique

* ✅ Real sandboxed code execution
* 🤖 Practical AI integration in workflow
* 💰 Monetization feature (rare in student projects)
* 🔐 Production-level security with Redis
* 📈 Scalable architecture with real-time systems

---

## 👨‍💻 Author

**Abhinandan Kumar Sharma**
GitHub: https://github.com/abhinandansharma11

---

## ⭐ Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull request.

---

## 📜 License

This project is licensed under the MIT License.
