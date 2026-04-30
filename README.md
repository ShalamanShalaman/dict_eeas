**DICT EAAS**

This repository contains the DICT Employee Attendance and Accomplishment System (EAAS) built with a Laravel backend, React frontend, and a Python processing module.

**Branches**
eaas_laravel
Main development branch used for local testing.
laravel_deploy
Branch used for deployment / hosting.

Make sure you are on the correct branch before running or pushing changes.

**Architecture Overview**
The system is divided into three main parts:

1. Frontend
Built with React + Vite
Handles UI, forms, and user interactions
Communicates with Laravel via API

2. Backend
Built with Laravel
Handles:
Authentication
Role-based access (Employee, Reviewer, Admin)
Workflow logic (submission, review, approval)
API endpoints
Logging and notifications

3. Processing Module
Built with Python
Responsible for:
Parsing biometric attendance PDFs
Generating DTRs
Generating reports
Merging PDFs
Typical Workflow (Dev Perspective)
Upload biometric PDF (frontend → backend)
Backend sends file to Python module
Python processes and returns generated files
Laravel stores and manages outputs
Frontend displays and handles submission flow

**Project Structure**
The project is split into three main directories: (eaas_laravel and laravel_deploy branches)

eaas_laravel    # Laravel backend (API, auth, workflow)
eaas_frontend   # React + Vite frontend
eaas_python     # Python processing module (PDF parsing, generation)
Local Setup

Note: Setup may vary depending on your environment. The steps below reflect the current development setup used by the team.

1. Clone the Repository
git clone <repo-url>
cd <repo-folder>

git checkout eaas_laravel
2. Setup Python Module (Required First)
cd eaas_python

# create virtual environment
python -m venv venv

# activate venv
# Linux / Mac
source venv/bin/activate

# Windows
venv\Scripts\activate

# install dependencies
pip install -r requirements.txt

3. Run Laravel Backend

Run this while the Python virtual environment is active (based on current setup)

cd ../eaas_laravel

composer install
cp .env.example .env
php artisan key:generate
php artisan storage:link
php artisan migrate
php artisan db:seed
php artisan serve

4. Run Frontend
cd ../eaas_frontend

npm install
npm run dev
Deployment Notes
Local development uses:
php artisan serve (Laravel)
Vite dev server (frontend)
Python venv for processing module

**Production deployment may differ:**
Example setup used:
Nginx
PHP-FPM
Ubuntu (AWS server)

**Deployment configuration is environment-dependent and may require additional setup (process managers, environment variables, file permissions, etc.).**

Important Notes
Ensure all .env files are properly configured
Backend and Python module must be able to communicate (check ports / endpoints if issues occur)
