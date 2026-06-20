# GyanSetu — AI-Powered Mathematics Assessment & Feedback System

**Technical Challenge Submission**

An AI-powered assessment platform for **Class 10 Mathematics (Quadratic Equations)** that supports multi-modal answer submission, step-wise AI grading, weak-topic identification, and role-based reporting for students, teachers, and parents.

---

## Project Overview

Traditional mathematics assessments often provide delayed feedback and limited insight into student understanding. GyanSetu aims to bridge this gap by evaluating student responses using AI, awarding partial marks for correct methods, identifying weak areas, and generating actionable reports for teachers and parents.

This implementation focuses on a single topic:

**Subject:** Mathematics
**Chapter:** Quadratic Equations

---

## Tech Stack

| Layer            | Technology                  |
| ---------------- | --------------------------- |
| Frontend         | React + Vite + Tailwind CSS |
| Backend          | FastAPI (Python)            |
| Database         | Supabase PostgreSQL         |
| Authentication   | Supabase Auth               |
| Storage          | Supabase Storage            |
| AI Engine        | Gemini 2.5 Flash            |
| Image Evaluation | Gemini Vision               |

---

## Features

### Question Bank

* 40 curated Class 10 Mathematics questions
* Focused on Quadratic Equations
* Questions tagged by marks (1, 2, 3, and 4 marks)
* Importance / Hot Question indicators
* Coverage across:

  * Factorization
  * Quadratic Formula
  * Completing the Square
  * Nature of Roots
  * Word Problems

### AI Grading Engine

* Gemini 2.5 Flash powered evaluation
* Rubric-based grading
* Step-wise assessment
* Partial marks support
* Detailed feedback generation
* Confidence scoring
* Error identification and improvement suggestions

### Input Modes

#### Typed Answers

* Fully implemented and validated
* Step-wise grading supported

#### Handwritten Image Answers

* Gemini Vision based extraction
* Handwritten solution evaluation
* Partial marks supported
* Step-wise feedback generation

#### Voice Input

* Speech-to-text pipeline integrated
* Basic functionality available
* Requires additional validation for mathematical dictation accuracy

### Analytics

* Weak-topic detection
* Topic-wise performance analysis
* Recent attempts tracking
* Student progress monitoring
* Performance summaries

### Dashboards

#### Student Dashboard

* Practice interface
* Performance overview
* Weak-topic insights
* Reports access

#### Teacher Dashboard

* Student monitoring
* Performance summaries
* Report generation
* Learning analytics

#### Parent Dashboard

* Child progress tracking
* Performance reports
* Topic-wise summaries

### Reports

* Teacher performance reports
* Parent progress reports
* Student analytics summaries
* AI-generated observations

### Learning Support

* Cheat Sheet
* Formula reference
* Concept summaries
* Weak-topic recommendations

---

## Challenge Deliverables

### Implemented

* Cheat Sheet
* 40 Question Bank
* Marks Allocation (1, 2, 3, 4)
* Importance Tags
* Typed Answer Evaluation
* Handwritten Answer Evaluation
* AI Step-wise Grading
* Partial Marks Support
* Weak Topic Analytics
* Student Dashboard
* Teacher Dashboard
* Parent Dashboard
* Teacher Reports
* Parent Reports

### Partially Implemented

* Voice Input Pipeline (additional testing and optimization required)

---

## Project Structure

```text
gyansetu/
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
│
├── server/
│   ├── app/
│   ├── tests/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── database/
│   ├── migrations/
│   ├── seed/
│   └── rls_policies.sql
│
├── docs/
│   ├── api_reference.md
│   └── setup.md
│
└── README.md
```

---

## Quick Start

### Prerequisites

* Node.js 20+
* Python 3.11+
* Supabase Account
* Gemini API Key

---

### 1. Clone Repository

```bash
git clone <repository-url>
cd gyansetu
```

### 2. Configure Environment Variables

Create:

```text
client/.env
server/.env
```

Use the values from:

```text
server/.env.example
```

and replace the placeholders with your own credentials.

---

### 3. Setup Supabase

1. Create a new Supabase project.
2. Run migration scripts from:

```text
database/migrations/
```

3. Apply:

```text
database/rls_policies.sql
```

4. Create a storage bucket named:

```text
student-uploads
```

---

### 4. Start Backend

```bash
cd server

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

---

### 5. Start Frontend

```bash
cd client

npm install

npm run dev
```

---

### 6. Open Application

```text
http://localhost:5173
```

---

## Demonstration

The project includes:

* Source Code
* Presentation Slides
* Demonstration Video

Demonstrated workflows include:

* Student answer submission
* Typed answer grading
* Handwritten answer grading
* Step-wise AI feedback
* Partial marking
* Teacher reporting
* Parent reporting
* Weak-topic analytics

---

## Current Limitations

* Voice-answer evaluation requires further testing and optimization for mathematical dictation.
* Current implementation focuses only on the Quadratic Equations chapter.
* Question bank is limited to 40 questions for the challenge scope.
* Additional mathematics chapters are not yet included.

---

## Future Enhancements

### Chapter Expansion

* Support additional Class 10 Mathematics chapters.

### Voice Recognition

* Improve mathematical speech-to-text accuracy.
* Better support for equations and symbols.

### Adaptive Practice

* Personalized question recommendations.
* Dynamic weak-topic reinforcement.

### Enhanced Analytics

* Long-term learning insights.
* Teacher performance dashboards.
* Comparative student analytics.

---

## Summary

GyanSetu demonstrates a functional AI-powered assessment pipeline for secondary school mathematics.

The platform combines:

* Multi-modal answer submission
* AI-based rubric grading
* Partial marks evaluation
* Weak-topic analytics
* Teacher reporting
* Parent reporting

into a single learning and assessment workflow.

Core challenge objectives have been successfully implemented, with voice-input accuracy and chapter expansion identified as the primary future improvements.
