CareTrack – Patient Management System

A modern CRUD-based web application for managing patient records and appointments.

🌐 Live Application

https://caretrack-patient-management.ashok1007.workers.dev

📌 Project Overview

CareTrack is a web-based Patient Management System developed as a mini CRUD application. It provides a simple interface for managing patient information and appointments.

The application demonstrates the four fundamental CRUD operations:

Create – Add patients and appointments

Read – View and search records

Update – Edit existing records

Delete – Remove records

🎯 Objectives

Develop a practical CRUD-based web application.

Digitally manage patient information.

Manage patient appointments.

Connect the frontend with a cloud PostgreSQL database.

Provide validation and user-friendly feedback.

Deploy the application online using Cloudflare.

🛠️ Technology Stack

Technology

Purpose

React

Frontend user interface

TypeScript

Type-safe development

Tailwind CSS

Responsive UI styling

Vite

Development and build tool

Supabase

Database and authentication services

PostgreSQL

Relational database

Cloudflare Workers

Deployment and hosting

Git & GitHub

Version control

📂 Main Modules

Patient Management

Add patient

View patient records

Search/filter patients

Edit patient information

Delete patient records

Manage contact and medical information

Appointment Management

Create appointments

View appointments

Edit appointment details

Delete appointments

Assign appointments to patients

Manage appointment status

🗄️ Database

The application uses Supabase PostgreSQL for persistent data storage.

patients

Stores patient information including:

Patient ID

Full Name

Date of Birth

Gender

Blood Group

Phone

Email

Address

Emergency Contact

Medical Condition

Registration Date

appointments

Stores appointment information including:

Patient

Doctor

Appointment Date

Appointment Time

Reason

Status

Relationship

PATIENTS (1) ───────────── (M) APPOINTMENTS

One patient can have multiple appointments.

🔄 CRUD Operations

Operation

Patients

Appointments

Create

✅

✅

Read

✅

✅

Update

✅

✅

Delete

✅

✅

🏗️ System Architecture

                    USER
                     │
                     ▼
             React + TypeScript
                     │
                     ▼
              Supabase Client
                     │
              ┌──────┴──────┐
              ▼             ▼
        Supabase API    Authentication
              │
              ▼
        PostgreSQL Database
              │
       ┌──────┴──────┐
       ▼             ▼
   patients     appointments

                     ▲
                     │
              Cloudflare Workers
                 (Deployment)

🚀 Installation

Prerequisites

Node.js

npm

Git

Clone the repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Patient-Management-System

Install dependencies

npm install

Configure environment variables

Create a .env file in the project root:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

Do not commit .env or Supabase secret/service-role keys to GitHub.

Run locally

npm run dev

Build

npm run build

☁️ Cloudflare Deployment

The application is deployed using Cloudflare Workers and Wrangler.

npm run build
npx wrangler deploy

Production URL

https://caretrack-patient-management.ashok1007.workers.dev

🧪 Testing Checklist

Application loads successfully

Patient can be added

Patient records can be viewed

Patient can be edited

Patient can be deleted

Appointment can be created

Appointment can be viewed

Appointment can be edited

Appointment can be deleted

Search/filter works

Data remains after refreshing

Supabase contains saved records

Deployed application works correctly

🔐 Security

The frontend uses the Supabase project URL and publishable key.

Never expose or commit Supabase service_role or sb_secret_... keys in frontend code or GitHub.

🔮 Future Enhancements

Role-based access control

Separate doctor management

Medical history module

Prescription management

Appointment reminders

Dashboard analytics

PDF/CSV report generation

Audit logs

Advanced search and pagination

Email/SMS notifications

📸 Suggested Screenshots

Add these screenshots to your project documentation:

Patient Directory

Add Patient

Edit Patient

Appointment Management

Supabase patients table

Supabase appointments table

Deployed application

👨‍💻 Project Information

Project: CareTrack – Patient Management System
Type: Mini Web Application – CRUD-Based Web Application
Activity: VSB Skill Vault Activity 3
Deployment: Cloudflare Workers
Database: Supabase PostgreSQL

📄 Documentation

The project documentation covers:

Project overview

Problem statement

Objectives

Technology stack

System architecture

Database/ER diagram

UI screenshots

API documentation

CRUD implementation

Testing results

Installation steps

Challenges and solutions

Future enhancements

Repository and deployment details
