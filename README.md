# PeepsDB

The people database (PeepsDB) integrates data from multple sources to help remotely distributed freelancer teams collaborate on software projects using cloud based technology.

- This project is being tracked with Work Items in the Azure DevOps Project - https://dev.azure.com/sjultra/VzxyTools/_git/peepsdb-backend

| Backend | Framework | Database |
| ------- | --------- | -------- |
| NodeJS  | Express   | MongoDB  |

# Requirements

1.  NodeJS >= 10.0
1.  Express
1.  MongoDB (we are using an online instance)

# Getting Started

In the project directory, run:

`npm install`

Create a file called .env in PeepsDB folder and add the following variables in order to test it locally:

1. GOOGLE_CLIENT_ID
2. GOOGLE_CLIENT_SECRET
3. GITHUB_CLIENT_ID
4. GITHUB_CLIENT_SECRET
5. GITHUB_TEST_CLIENT_ID
6. GITHUB_TEST_CLIENT_SECRET
7. MICROSOFT_CLIENT_ID
8. MICROSOFT_CLIENT_SECRET
9. FRONTEND_URL
10. BACKEND_URL
11. MONGO_URI
12. JWT_SECRET
13. AZURE_TENANT_ID
14. AZURE_CLIENT_ID
15. AZURE_CLIENT_SECRET
16. PORT
17. JWT_SECRET
18. FRONTEND_URL
19. FRONTEND_TEST_URL

## Start Application

In the project directory, run:

`npm run server`

Backend runs on [http://localhost:5000](http://localhost:5000)
