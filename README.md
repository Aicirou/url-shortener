# API Documentation

This repository contains a set of APIs for authentication, URL shortening, and analytics tracking. Below is the documentation for each Auth API endpoint to get access_token.

---

## Table of Contents

[Authentication APIs](#authentication-apis)

---

## Authentication APIs

### `/auth/google`
- **Description**: This URL needs to be pasted into any browser where there is a Google Mail session. After successful authentication, copy the access token and use it to authenticate requests to all other APIs.
- **Method**: `GET`
- **Authorization**: None required.
- **Response**:
  - On success: Redirects the user to the Google authentication flow.
  - On failure: Returns an error message.

---# url-shortener-docker
