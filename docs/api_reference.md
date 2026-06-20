# GyanSetu — API Reference

See the [Architecture Recommendation](../GyanSetu_Architecture_Recommendation.md) for full system design context.

## Base URL

```
http://localhost:8000/api/v1
```

## Interactive Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Create role-specific profile after Supabase Auth signup |
| `POST` | `/auth/login` | Server-side login (admin only) |

### Questions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/questions` | List questions (filterable by subtopic, marks, difficulty, hot) |
| `GET` | `/questions/{id}` | Get question with rubric steps and metadata |
| `GET` | `/questions/weak-practice/{student_id}` | 20 questions from weakest subtopic |

### Attempts
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/attempts` | Submit an answer attempt |
| `GET` | `/attempts/{student_id}` | Get attempt history (paginated) |

### Grading
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/grade` | **Core** — AI grade an attempt |
| `GET` | `/evaluations/{attempt_id}` | Get stored evaluation |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/{student_id}/weak-topics` | Per-subtopic strength analytics |
| `GET` | `/analytics/{student_id}/performance` | Performance trend data |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/reports/teacher/{student_id}` | Generate teacher report |
| `GET` | `/reports/teacher/{student_id}` | Get latest teacher report |
| `POST` | `/reports/parent/{student_id}` | Generate parent report |
| `GET` | `/reports/parent/{student_id}` | Get latest parent report |
