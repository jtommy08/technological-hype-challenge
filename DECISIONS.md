# 🧠 Technical Decisions

## 📌 General Approach

The solution was designed as a fullstack application with a clear separation between backend and frontend.

* The backend is responsible for processing and exposing data through a REST API.
* The frontend consumes this API and displays the information to the user.

This separation improves maintainability, scalability, and clarity of responsibilities.

---

## ⚙️ Key Technical Decisions

### Backend

* Chose NestJS for its modular architecture and scalability.
* Implemented a controller-service pattern to separate concerns.
* Exposed a REST endpoint (`/api/videos`) to serve processed data.

### Frontend

* Used React with TypeScript for type safety and maintainability.
* Used Vite for fast development and build performance.
* Structured components to keep logic and UI separated.

---

## 🗂️ Project Organization

The project is structured as a monorepo-style setup:

* `/technological-hype-api` → backend (NestJS)
* `/technological-hype-app` → frontend (React)

Each part is independent and can be run separately.

---

## 🧩 Assumptions & Simplifications

* Data is assumed to be valid and does not require complex validation.
* No authentication or authorization was implemented.
* Error handling is basic and focused on core functionality.
* Persistence layer (database) was not included, as it was not required.

---

## ⚠️ Challenges & Solutions

### Challenge: Connecting frontend and backend

* Solution: Standardized the API endpoint (`/api/videos`) and ensured consistent response structure.

### Challenge: Environment setup

* Solution: Used simple configuration and default ports to reduce complexity.

### Challenge: Time constraints

* Solution: Focused on delivering a clean and functional solution rather than over-engineering.

---

## 🤖 Use of AI Tools

AI tools were used to:

* Clarify technical concepts (e.g., project setup and configuration)
* Improve documentation (README and this document)
* Validate best practices

Examples of prompts used:

* "How to structure a NestJS backend for a simple API"
* "Best practices for React + TypeScript project structure"
* "How to connect frontend and backend in a local environment"

AI was used as a support tool, while all implementation decisions and final code structure were reviewed and adapted manually.

---

## 🎯 Final Notes

The main focus of this solution was clarity, simplicity, and correctness.
The goal was to deliver a maintainable and understandable implementation rather than a highly complex one.
