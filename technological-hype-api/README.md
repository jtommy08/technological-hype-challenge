# 🚀 Technological Hype API

## 📌 Description

Backend API built with NestJS to provide trending technology video data.

---

## ⚙️ Tech Stack

* NestJS
* Node.js
* TypeScript

---

## 📦 Installation

```bash
npm install
```

---

## ▶️ Running the Application

```bash
npm run start:dev
```

The server runs at:
http://localhost:3000

---

## 📡 Endpoints

### Get Videos

```http
GET /api/videos
```

### Example Response

```json
[
  {
    "title": "Video title",
    "url": "https://youtube.com/...",
    "views": 1000
  }
]
```

---

## 🔗 Frontend Integration

The frontend consumes data from:
http://localhost:3000/api/videos

---

## 🧪 Notes

* Root route `/` is not defined (returns 404)
* Ensure backend is running before frontend

---

## 👨‍💻 Author

Jose Tomas Suarez Acero
