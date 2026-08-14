# Deployment Guide: AWS Route 53 Console Clone

This guide provides step-by-step instructions to deploy this application locally, to a virtual private server (VPS), or to cloud hosting environments (Vercel, Render, and AWS).

---

## 🐳 Option 1: Deploy with Docker Compose (Recommended)

Docker Compose is the easiest way to launch the entire project (backend, database, frontend) with a single command.

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or Docker Engine with Docker Compose (Linux).

### Step-by-Step Launch
1. **Navigate to the project root**:
   Ensure you are in the directory containing `docker-compose.yml`.

2. **Build and start the containers**:
   Run this command to build the Docker images and start the services in detached (background) mode:
   ```bash
   docker compose up -d --build
   ```

3. **Verify the installation**:
   - **Frontend Console**: Open [http://localhost:3000](http://localhost:3000) in your browser. Log in using `admin@example.com` / `password123`.
   - **Backend API**: Open [http://localhost:8000/api/health](http://localhost:8000/api/health) to ensure it returns `{"status":"healthy"}`.
   - **Swagger Docs**: Available at [http://localhost:8000/docs](http://localhost:8000/docs).

4. **Persisted Data**:
   Database states are saved inside the persistent Docker volume named `sqlite_data`.

5. **Stop the services**:
   ```bash
   docker compose down
   ```

---

## ☁️ Option 2: Deploy to Vercel (Frontend) & Render (Backend)

For fully managed hosting, you can split the application by deploying the frontend to Vercel and the backend to Render.

### Step 1: Deploy Backend to Render
1. Sign up/log in at [Render.com](https://render.com/).
2. Create a new **Web Service** and link your repository (or push the `/backend` folder to a separate GitHub repo).
3. Set the following configuration details:
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add the following **Environment Variables**:
   - `DATABASE_URL`: `sqlite:///./data/route53.db` (Render provides persistent disk mounts for SQLite, or you can use a PostgreSQL instance).
   - `SECRET_KEY`: Choose a secure secret key for production JWT signatures.
5. Note the generated Render URL (e.g., `https://route53-backend.onrender.com`).

### Step 2: Deploy Frontend to Vercel
1. Sign up/log in at [Vercel.com](https://vercel.com/).
2. Import your repository.
3. Configure the Project Settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
4. Expand the **Environment Variables** section and add:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://route53-backend.onrender.com/api` (Use your Render backend URL with the `/api` suffix).
5. Click **Deploy**. Vercel will compile the frontend and serve it at a custom URL.

---

## ☁️ Option 3: Deploy to AWS (App Runner & Amplify)

To host the Route 53 clone inside AWS itself:

### Step 1: Deploy Backend to AWS App Runner
AWS App Runner is a fully managed service that makes it easy to build and run containerized web applications.
1. Build the backend container image and push it to **Amazon ECR (Elastic Container Registry)**.
2. In the AWS App Runner Console, create a new service:
   - Select **Container Registry** and choose the ECR image repository.
   - Set the port to `8000`.
   - Add environment variables (`DATABASE_URL`, `SECRET_KEY`).
3. Deploy the service and retrieve the generated service domain (e.g., `https://xxxx.us-east-1.awsapprunner.com`).

### Step 2: Deploy Frontend to AWS Amplify
1. Open the AWS Amplify Console.
2. Connect your Git repository.
3. Choose the `frontend` subfolder.
4. Add the environment variable `NEXT_PUBLIC_API_URL` containing your AWS App Runner URL with `/api` appended.
5. Deploy. Amplify will build, deploy, and host your Next.js frontend app.
