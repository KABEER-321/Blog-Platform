import os
import django
import random
from datetime import datetime, timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Profile
from posts.models import Category, Post, PostLike, Bookmark
from comments.models import Comment

def seed():
    print("Clearing database tables...")
    Comment.objects.all().delete()
    PostLike.objects.all().delete()
    Bookmark.objects.all().delete()
    Post.objects.all().delete()
    Category.objects.all().delete()
    
    # Delete non-superuser seeded authors to start fresh
    User.objects.filter(is_superuser=False).delete()
    
    # Check or create superuser admin
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        print("Creating admin user...")
        admin_user = User.objects.create_superuser(
            username='admin@blogsphere.com',
            email='admin@blogsphere.com',
            password='admin123',
            first_name='Admin',
            last_name='Sphere'
        )
    else:
        # Reset password to ensure consistency
        admin_user.set_password('admin123')
        admin_user.save()
        
    Profile.objects.get_or_create(
        user=admin_user,
        defaults={
            'phone': '+1 (555) 010-0000',
            'bio': 'System administrator and editor-in-chief at BlogSphere.'
        }
    )

    print("Creating author accounts...")
    authors = [
        {
            'username': 'author1@blogsphere.com',
            'email': 'author1@blogsphere.com',
            'password': 'author123',
            'first_name': 'Alex',
            'last_name': 'Rivera',
            'bio': 'Software Architect. Writing about cloud scalability, serverless architectures, and advanced backend systems.',
            'phone': '+1 (555) 011-1111'
        },
        {
            'username': 'author2@blogsphere.com',
            'email': 'author2@blogsphere.com',
            'password': 'author123',
            'first_name': 'Sarah',
            'last_name': 'Chen',
            'bio': 'Full Stack Developer & Devops enthusiast. Love exploring React internals, CSS tricks, and containerized deployments.',
            'phone': '+1 (555) 022-2222'
        },
        {
            'username': 'author3@blogsphere.com',
            'email': 'author3@blogsphere.com',
            'password': 'author123',
            'first_name': 'Marcus',
            'last_name': 'Johnson',
            'bio': 'AI Research Engineer. Sharing thoughts on ML pipelines, neural network models, and the future of generative artificial intelligence.',
            'phone': '+1 (555) 033-3333'
        },
        {
            'username': 'author4@blogsphere.com',
            'email': 'author4@blogsphere.com',
            'password': 'author123',
            'first_name': 'Elena',
            'last_name': 'Petrova',
            'bio': 'Cybersecurity Specialist and open source contributor. Passionate about system hardening, network protocols, and secure coding practices.',
            'phone': '+1 (555) 044-4444'
        }
    ]

    seeded_users = [admin_user]
    for auth_info in authors:
        u = User.objects.create_user(
            username=auth_info['username'],
            email=auth_info['email'],
            password=auth_info['password'],
            first_name=auth_info['first_name'],
            last_name=auth_info['last_name']
        )
        Profile.objects.create(
            user=u,
            phone=auth_info['phone'],
            bio=auth_info['bio']
        )
        seeded_users.append(u)
        print(f"Created user: {u.email}")

    print("Creating categories...")
    categories_data = [
        {"name": "Programming", "description": "Core software concepts, patterns, algorithms, and syntax guidelines."},
        {"name": "Web Development", "description": "Modern frontend frameworks, responsive layouts, API designs, and browser standardizations."},
        {"name": "Artificial Intelligence", "description": "Machine learning insights, large language models, datasets, and cognitive compute."},
        {"name": "Cyber Security", "description": "InfoSec standards, penetration testing, cryptography, and network vulnerabilities."},
        {"name": "Cloud Computing", "description": "Infrastructure automation, AWS, containerized orchestration, and serverless computing."},
        {"name": "Mobile Development", "description": "Building native and cross-platform apps for iOS and Android."},
        {"name": "Career", "description": "Professional growth strategies, tech interviews, networking, and engineering leadership."},
        {"name": "Open Source", "description": "FOSS contributions, git guides, repository maintenance, and licensing rules."}
    ]

    seeded_categories = {}
    for cat_info in categories_data:
        c = Category.objects.create(name=cat_info['name'], description=cat_info['description'])
        seeded_categories[c.name] = c
        print(f"Created category: {c.name}")

    print("Creating blog posts...")
    
    posts_data = [
        # Programming
        {
            "category": seeded_categories["Programming"],
            "title": "Mastering Design Patterns in Modern Software Architecture",
            "summary": "An in-depth exploration of behavioral, structural, and creational patterns to write clean, reusable, and maintainable object-oriented systems.",
            "content": """# Design Patterns in Modern Development

Design patterns are reusable solutions to common software design problems. By applying these patterns, developers write code that is clean, decoupled, and easy to maintain.

## 1. Creational Patterns: The Singleton & Factory
Creational patterns handle object instantiation processes.

### Factory Method
The **Factory Method** defines an interface for creating objects but allows subclasses to decide which class to instantiate:
```python
class Creator:
    def factory_method(self):
        pass

    def some_operation(self):
        product = self.factory_method()
        return f"Creator: Working with {product.operation()}"
```

## 2. Structural Patterns: The Adapter Pattern
Structural patterns simplify relationships between entities.

- **Adapter**: Acts as a bridge between two incompatible interfaces.
- **Decorator**: Dynamically attaches new responsibilities to an object.

## 3. Behavioral Patterns: The Observer Pattern
Behavioral patterns deal with communication between objects. In the Observer Pattern, dependents are notified when a subject changes state.

> [!NOTE]
> Choosing the correct design pattern requires analyzing trade-offs. Over-engineering code with patterns is a common anti-pattern.

### Benefits of Patterns
1. Reusability of solutions.
2. Standardized terminology among teams.
3. Enhanced code readability.
""",
            "image_url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        {
            "category": seeded_categories["Programming"],
            "title": "Understanding Memory Management in Python",
            "summary": "Deep dive into garbage collection, reference counting, and optimization tricks in CPython.",
            "content": """# Python Memory Management Details

Python uses reference counting and garbage collection to allocate and deallocate variables automatically.

## Reference Counting
Every Python object tracks its reference count. When a variable goes out of scope or is reassigned, its reference count decrements. When it hits `0`, memory is freed.

```python
import sys
x = []
print(sys.getrefcount(x)) # Counts references
```

## The Cyclic Garbage Collector
Reference counts fail when circular references occur. Python resolves this with a generational garbage collector:
1. **Generation 0**: Newly allocated objects.
2. **Generation 1**: Objects surviving one GC cycle.
3. **Generation 2**: Long-lived objects.

*Always avoid global variables where local scopes can serve the same purpose.*
""",
            "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
            "published": True
        },

        # Web Development
        {
            "category": seeded_categories["Web Development"],
            "title": "Optimizing React Performance for Low-Bandwidth Networks",
            "summary": "Learn to reduce bundle size, code split with dynamic imports, and utilize virtualization libraries to maintain smooth framerates.",
            "content": """# Optimizing React Performance

Building fast web apps means optimizing client-side performance, especially under constraint environments.

## Core Performance Strategies

### 1. Code Splitting via Dynamic Imports
Using `React.lazy` and `Suspense` allows loading components asynchronously:
```jsx
import React, { Suspense, lazy } from 'react';
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function MyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 2. Preventing Unnecessary Renderings
Wrap components in `React.memo` and utilize `useMemo` / `useCallback` hook memoization to bypass redundant tree evaluations.

### 3. List Virtualization
When rendering tables with thousands of items, utilize virtualizers like `react-window` to only compile visible items into the DOM.
""",
            "image_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        {
            "category": seeded_categories["Web Development"],
            "title": "A Complete Guide to CSS Grid and Flexbox Layouts",
            "summary": "Master flexible inline alignments and 2-dimensional structures using modern CSS specifications.",
            "content": """# Grid vs Flexbox: When to Use Which?

CSS offers two layout engines that solve different design requirements.

## 1-Dimensional: Flexbox
Use **Flexbox** to layout elements in a single row or column. Perfect for headers, sidebars, and input buttons.
```css
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

## 2-Dimensional: Grid
Use **Grid** for complex multi-row and multi-column designs like image galleries and dashboard tables.
```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
```
""",
            "image_url": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        {
            "category": seeded_categories["Web Development"],
            "title": "Understanding CORS and Secure Header Configurations",
            "summary": "Prevent unauthorized domain API requests and secure headers on DRF servers.",
            "content": """# Navigating Cross-Origin Resource Sharing (CORS)

CORS is a browser-enforced security mechanism restricting scripts on one domain from querying resources on another.

### How CORS Works
Browsers send a preflight request (`OPTIONS`) before executing mutating endpoints. The server responds with headers declaring permitted hosts:
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Methods`

> [!WARNING]
> Setting `CORS_ALLOW_ALL_ORIGINS = True` is convenient in local development, but must be replaced by explicit domain lists in production!
""",
            "image_url": "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80",
            "published": False # Draft
        },

        # Artificial Intelligence
        {
            "category": seeded_categories["Artificial Intelligence"],
            "title": "Introduction to Large Language Models and Tokenization",
            "summary": "An analysis of transformers, token encoding, attention weights, and context lengths.",
            "content": """# Understanding Transformers and LLMs

Large Language Models (LLMs) rely on the **Transformer Architecture** introduced in 2017.

## Tokenization Process
LLMs process text by translating strings into discrete token IDs. Common algorithms include:
1. **Byte-Pair Encoding (BPE)**: Used by GPT models.
2. **WordPiece**: Used by BERT models.

### Multi-Head Attention
Attention mechanisms calculate mathematical correlation weights between tokens, permitting the network to evaluate contextual definitions.
\[\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V\]
""",
            "image_url": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        {
            "category": seeded_categories["Artificial Intelligence"],
            "title": "Building Your First Neural Network with PyTorch",
            "summary": "A step-by-step tutorial creating linear layers, loss functions, and optimizing weights on backpropagation.",
            "content": """# PyTorch Foundations

PyTorch offers dynamic graphs for constructing machine learning pipelines.

## Linear Regression Model
Here is a basic model definition:
```python
import torch
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(10, 1)

    def forward(self, x):
        return self.fc(x)
```
""",
            "image_url": "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80",
            "published": True
        },

        # Cyber Security
        {
            "category": seeded_categories["Cyber Security"],
            "title": "Understanding SQL Injection and How to Prevent It",
            "summary": "Avoid SQL injection attacks by sanitizing inputs, using parameterized queries, and employing ORM query sanitizers.",
            "content": """# Preventing SQL Injection (SQLi)

SQL Injection happens when untrusted user input is concatenated directly into SQL query strings.

## The Threat
An attacker can insert keywords like `' OR '1'='1` to bypass user logins:
```sql
SELECT * FROM users WHERE email = 'hacker@target.com' OR '1'='1';
```

## The Solution: Parameterized Queries
Always isolate queries from data parameters. ORMs like Django natively parameterize filters:
```python
# Safe ORM filter
User.objects.filter(email=user_email)
```
""",
            "image_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        {
            "category": seeded_categories["Cyber Security"],
            "title": "An Overview of JWT Security and Token Blacklisting",
            "summary": "Secure JWT tokens, manage secret keys, configure appropriate expirations, and implement blacklist registers.",
            "content": """# Securing JSON Web Tokens

JSON Web Tokens (JWT) store user credentials client-side. Ensuring their integrity is vital.

## Best Practices
1. **Short lifetimes**: Access tokens should expire within minutes.
2. **Refresh rotation**: Revoke refresh tokens on rotation to detect token hijacking.
3. **HTTPOnly Cookies**: Store tokens in HTTPOnly cookies where possible to block XSS access.
""",
            "image_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
            "published": True
        },

        # Cloud Computing
        {
            "category": seeded_categories["Cloud Computing"],
            "title": "Getting Started with Docker Containerization",
            "summary": "An introductory guide to writing Dockerfiles, managing images, and running containers.",
            "content": """# Containerization with Docker

Docker isolates applications in containers, solving dependency mismatch problems between systems.

## Writing a Dockerfile
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```
""",
            "image_url": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        {
            "category": seeded_categories["Cloud Computing"],
            "title": "A Beginner Guide to Kubernetes Pods and Deployments",
            "summary": "Learn orchestrations, cluster scaling, services load balancing, and rolling updates.",
            "content": """# Orchestrating Containers with Kubernetes

Kubernetes handles container lifecycle scheduling, failovers, and internal routing.

## Pods: The Smallest Unit
A **Pod** wraps one or more app containers, sharing network sockets and volumes.
- Use **Deployments** to manage replication state.
- Use **Services** to expose pods internally or externally.
""",
            "image_url": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=600&q=80",
            "published": True
        },

        # Mobile Development
        {
            "category": seeded_categories["Mobile Development"],
            "title": "Choosing Between React Native and Flutter in 2026",
            "summary": "A comparative analysis evaluating cross-platform compilation speeds, render engines, and community support.",
            "content": """# React Native vs Flutter

Cross-platform development speeds up mobile app shipping timelines.

## React Native
- Uses JavaScript/TypeScript.
- Renders to native UI components via a bridge or the new architecture (JSI).
- High layout flexibility.

## Flutter
- Uses Dart.
- Renders directly using Skia or Impeller graphics engines.
- Highly consistent UI components across all platforms.
""",
            "image_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        {
            "category": seeded_categories["Mobile Development"],
            "title": "Understanding State Management in Flutter",
            "summary": "Evaluate Provider, Bloc, and Riverpod patterns for managing active app widget states.",
            "content": """# Managing State in Flutter

State management keeps the UI sync'd with data layers.

## Provider vs Riverpod
- **Provider**: Leverages InheritedWidget underneath. Simple but has build-context limits.
- **Riverpod**: A rewrite of Provider, compile-safe, and independent of the widget tree structure.
""",
            "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
            "published": True
        },

        # Career
        {
            "category": seeded_categories["Career"],
            "title": "How to Prepare for Technical System Design Interviews",
            "summary": "A roadmap to mastering databases, cache layer implementations, load balancers, and CDN structures.",
            "content": """# Cracking System Design Interviews

System design interviews measure architectural skills.

## The Checklist
1. **Scope the system**: Clarify requirements and constraints.
2. **API definition**: Draft endpoints.
3. **High-Level Design**: Sketch components (Client, LB, Web Server, DB).
4. **Deep Dive**: Discuss scaling, partitioning, CDNs, and cache policies.
""",
            "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        {
            "category": seeded_categories["Career"],
            "title": "The Importance of Writing Clean Code and Documentation",
            "summary": "Writing code for humans. Coding patterns, self-documenting parameters, and robust docstrings.",
            "content": """# Clean Code Philosophy

Code is read far more often than it is written. Keep it readable.

> "Clean code is simple and direct. Clean code reads like well-written prose." — Grady Booch

## Key Guidelines
- **Use meaningful variable names**: e.g., `active_users` instead of `au`.
- **Functions should do one thing** and be relatively short.
- **Write unit tests** to document expectations.
""",
            "image_url": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
            "published": True
        },

        # Open Source
        {
            "category": seeded_categories["Open Source"],
            "title": "A Beginner Guide to Contributing to GitHub Projects",
            "summary": "Master git forks, branch management, pull requests, code reviews, and licenses.",
            "content": """# Contributing to Open Source

Open source builds developer portfolios.

## Step-by-Step Workflow
1. **Fork the repo** and clone it locally.
2. **Create a branch**: `git checkout -b feature/my-contribution`.
3. **Commit changes**: Keep messages concise.
4. **Open a Pull Request (PR)** against the upstream repository.
""",
            "image_url": "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        {
            "category": seeded_categories["Open Source"],
            "title": "Understanding Open Source Licensing options",
            "summary": "Compare permissive and copyleft licensing systems: MIT, Apache 2.0, and GPL.",
            "content": """# Open Source Licenses

Choose software licenses carefully.

## Permissive Licenses
- **MIT**: Clean, do-whatever-you-want license.
- **Apache 2.0**: Permissive, but includes patent rights declarations.

## Copyleft Licenses
- **GPL v3**: Forces derivative works to also be open source.
""",
            "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        
        # Extra posts to hit 22 total posts
        {
            "category": seeded_categories["Programming"],
            "title": "Deep Dive into Java Streams and Lamdas",
            "summary": "Master map-reduce filters, collections streaming, parallel processing, and performance benefits.",
            "content": """# Java functional interfaces and stream engines.

Use Streams to write concise database/collection transformations.
""",
            "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        {
            "category": seeded_categories["Web Development"],
            "title": "Next.js 15 Server Components Explained",
            "summary": "Understand React Server Components, server-side data fetches, hydration bounds, and dynamic layouts.",
            "content": """# Next.js Server Components

RSC fetches data directly on the server, saving roundtrips.
""",
            "image_url": "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        {
            "category": seeded_categories["Cloud Computing"],
            "title": "AWS Lambda and Serverless Patterns",
            "summary": "Build cheap, dynamic event-driven architectures with API Gateway and Lambda functions.",
            "content": """# AWS Lambda

Pay only for execution time. Scales out automatically.
""",
            "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
            "published": False # Draft
        },
        {
            "category": seeded_categories["Career"],
            "title": "Remote Tech Jobs: How to Succeed in Virtual Teams",
            "summary": "Tips on asynchronous updates, documentation, Slack channels, and timezone boundaries.",
            "content": """# Succeeding in Remote Teams

Communication is key. Always keep document updates clear.
""",
            "image_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
            "published": True
        },
        {
            "category": seeded_categories["Cyber Security"],
            "title": "Zero Trust Security Architecture Guide",
            "summary": "Implement continuous verification, least-privilege, and micro-segmentations.",
            "content": """# Never Trust, Always Verify

Zero Trust removes implicit corporate network trust.
""",
            "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
            "published": False # Draft
        }
    ]

    seeded_posts = []
    # Dates to distribute posts over the past month
    now = datetime.now()
    
    for idx, p_info in enumerate(posts_data):
        # Assign author dynamically (rotate through authors)
        author = seeded_users[idx % len(seeded_users)]
        
        post = Post.objects.create(
            author=author,
            category=p_info["category"],
            title=p_info["title"],
            summary=p_info["summary"],
            content=p_info["content"],
            image_url=p_info["image_url"],
            published=p_info["published"]
        )
        
        # Override auto_now_add creation date to simulate historical posts
        post.created_at = now - timedelta(days=idx, hours=idx * 2)
        post.save()
        
        seeded_posts.append(post)
        print(f"Seeded post: {post.title} (Published: {post.published})")

    print("Generating comments (50-60)...")
    comment_texts = [
        "This is an incredibly helpful article, thanks for sharing!",
        "Excellent write-up! I learned a lot from this.",
        "Could you clarify the section on performance? Are there any trade-offs?",
        "I've been working on a similar problem and this is a great solution.",
        "Simple, direct, and to the point. Great formatting too.",
        "This is cool, but is this production ready?",
        "Interesting thoughts, though I prefer a different approach.",
        "Thanks for the PyTorch code snippet, worked immediately!",
        "Bookmarked! This is a great reference guide.",
        "I run into this daily. Good to know how to resolve it safely.",
        "Great analysis of cross-platform framework performance.",
        "Design patterns are key. Thanks for explaining these clearly.",
        "Is there a GitHub repo containing these examples?",
        "Absolutely spot on! Clean code makes teams twice as fast.",
        "The SQL injection section was clean. Parametrized filters are critical.",
        "Great containerization tips, will utilize this Dockerfile immediately."
    ]

    # Target 55 comments total
    comments_count = 0
    published_posts = [p for p in seeded_posts if p.published]
    
    while comments_count < 55:
        post = random.choice(published_posts)
        user = random.choice(seeded_users)
        comment_text = random.choice(comment_texts)
        
        c = Comment.objects.create(
            post=post,
            user=user,
            comment=comment_text
        )
        c.created_at = post.created_at + timedelta(minutes=random.randint(15, 600))
        c.save()
        comments_count += 1

    print("Generating Likes & Bookmarks...")
    for post in published_posts:
        # Each post receives 0 to 4 likes
        likes_users = random.sample(seeded_users, k=random.randint(0, len(seeded_users)))
        for u in likes_users:
            PostLike.objects.create(user=u, post=post)

        # Each post receives 0 to 3 bookmarks
        bookmark_users = random.sample(seeded_users, k=random.randint(0, min(3, len(seeded_users))))
        for u in bookmark_users:
            Bookmark.objects.create(user=u, post=post)

    print("Seeding verification checks:")
    print(f"Total Users: {User.objects.count()}")
    print(f"Total Categories: {Category.objects.count()}")
    print(f"Total Posts: {Post.objects.count()} (Published: {Post.objects.filter(published=True).count()}, Drafts: {Post.objects.filter(published=False).count()})")
    print(f"Total Comments: {Comment.objects.count()}")
    print(f"Total Likes: {PostLike.objects.count()}")
    print(f"Total Bookmarks: {Bookmark.objects.count()}")
    print("Database seeding completed successfully.")

if __name__ == '__main__':
    seed()
