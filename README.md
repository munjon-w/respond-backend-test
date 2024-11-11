# Respond Note With User Backend Test

A simple note taking backend that feature user and authentication.

All note operation require authenticated user, any note operation are only available for the owner.

Authentication rely on Json web token methods.

Frequently accessed note (more than 5 in a day) are cached for quicker retriever.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file placed at root of this project, example value are provided

`API_KEY`=mysql

`JWT_SECRET`=secret

### Optional env are listed below

`DB_NAME`

`DB_USER`

`DB_PASSWORD`

`DB_HOST`

`PORT`

## Installation

Require to install Docker

### Steps to launch

npm install

docker compose up

## API Reference

Default Dev Domain: http://localhost:5001

#### Refresh Access Token

```http
  GET /api/auth/refresh
```

| Cookie         | Type     | Description                      |
| :------------- | :------- | :------------------------------- |
| `refreshToken` | `string` | **Required**. Your Refresh token |

#### Register

```http
  PUT /api/auth/register
```

| Parameter     | Type     | Description                |
| :------------ | :------- | :------------------------- |
| `username`    | `string` | **Required**. Username     |
| `password`    | `string` | **Required**. Password     |
| `displayName` | `string` | **Required**. Display Name |

#### Login

```http
  POST /api/auth/login
```

| Parameter  | Type     | Description            |
| :--------- | :------- | :--------------------- |
| `username` | `string` | **Required**. Username |
| `password` | `string` | **Required**. Password |

#### Logout

```http
  POST /api/auth/logout
```

#### Get All Notes

```http
  GET /api/note/all
```

| Cookie        | Type     | Description                |
| :------------ | :------- | :------------------------- |
| `accessToken` | `string` | **Required**. Access token |

#### Get Specific Note

```http
  GET /api/note/:noteId
```

| Cookie        | Type     | Description                |
| :------------ | :------- | :------------------------- |
| `accessToken` | `string` | **Required**. Access token |

| URL Parameter | Type     | Description                  |
| :------------ | :------- | :--------------------------- |
| `noteId`      | `string` | **Required**. Note id e.g. 1 |

#### Create Note

```http
  PUT /api/note/create
```

| Cookie        | Type     | Description                |
| :------------ | :------- | :------------------------- |
| `accessToken` | `string` | **Required**. Access token |

| Parameter | Type     | Description                        |
| :-------- | :------- | :--------------------------------- |
| `type`    | `string` | **Required**. "work" or "personal" |
| `title`   | `string` | **Required**. Password             |
| `content` | `string` | **Required**. Password             |

#### Delete Note

```http
  DELETE /api/note/:noteId/delete
```

| Cookie        | Type     | Description                |
| :------------ | :------- | :------------------------- |
| `accessToken` | `string` | **Required**. Access token |

| URL Parameter | Type     | Description                  |
| :------------ | :------- | :--------------------------- |
| `noteId`      | `string` | **Required**. Note id e.g. 1 |

#### Update Note

```http
  PATCH /api/note/:noteId/update
```

| Cookie        | Type     | Description                |
| :------------ | :------- | :------------------------- |
| `accessToken` | `string` | **Required**. Access token |

| URL Parameter | Type     | Description                  |
| :------------ | :------- | :--------------------------- |
| `noteId`      | `string` | **Required**. Note id e.g. 1 |

| Parameter | Type     | Description                        |
| :-------- | :------- | :--------------------------------- |
| `type`    | `string` | **Required**. "work" or "personal" |
| `title`   | `string` | **Required**. Password             |
| `content` | `string` | **Required**. Password             |
