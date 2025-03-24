# Leave Management System

## What's This All About?
This is a modern leave management system that helps teams handle employee time-off requests efficiently. It's built with Node.js and uses SQLite for data storage, making it lightweight and easy to set up.

## Quick Start Guide

### Running with Docker (The Easy Way)
1. Make sure you have Docker installed
2. Run this command:
   ```bash
   docker-compose up
   ```
3. That's it! The app will be running at http://localhost:3000

### Manual Setup
1. Install Node.js (version 18 or newer)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure
- `/db` - Database stuff (SQLite)
- `/k8s` - Kubernetes deployment files
- `/jenkins` - CI/CD pipeline setup
- `/__tests__` - Test files

## Deployment

### Docker Images
We have two main Docker images:
- Main API (`test-app`)
- Leave Request Service (`leave-request-service`)

### Kubernetes Deployment
The app is ready for Kubernetes deployment with:
- 2 replicas for high availability
- Resource limits and health checks configured
- Nginx ingress for routing

## Development Guidelines
1. Always write tests for new features
2. Follow the existing code style
3. Use the development environment with `docker-compose up`

## CI/CD Pipeline
We use Jenkins for automated:
- Code testing
- Docker image building
- Kubernetes deployment

The pipeline automatically builds and deploys when you push to the main branch.

## Need Help?
If you run into any issues:
1. Check the logs
2. Make sure all services are running
3. Verify your environment variables

Happy coding! 🚀