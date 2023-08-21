# Overview
This repo is the server-side code for Lecture: Client Side Auth

## Installation

1. Install packages
    - `npm i`
2. Create .env file
    - `cp .env.example .env`
3. Run server
    - `npm run dev`


## Endpoints
```
POST /login
Body: {
    username
    password
}
```
```
GET /posts
Headers: {
    Authorization: Bearer {token}
}
```