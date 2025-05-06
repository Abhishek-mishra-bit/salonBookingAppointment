# Salon Appointment Booking System API Documentation

## Authentication API

### Register User
- **Endpoint**: POST `/api/auth/register`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "phone": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "string"
  }
  ```

### Login User
- **Endpoint**: POST `/api/auth/login`
- **Description**: Login user
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "string"
  }
  ```

### Get User Profile
- **Endpoint**: GET `/api/users/profile`
- **Description**: Get user profile information
- **Headers**:
  - Authorization: Bearer <token>
- **Response**:
  ```json
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string"
  }
  ```

## Service Management API

### Get All Services
- **Endpoint**: GET `/api/services`
- **Description**: Get list of all services
- **Headers**:
  - Authorization: Bearer <token>
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "duration": "number",
      "staff": [
        {
          "id": "string",
          "name": "string",
          "specialization": "string"
        }
      ]
    }
  ]
  ```

### Create Service
- **Endpoint**: POST `/api/services`
- **Description**: Create a new service
- **Headers**:
  - Authorization: Bearer <token>
  - Role: admin
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "price": "number",
    "duration": "number",
    "staffIds": ["string"]
  }
  ```

## Staff Management API

### Get All Staff
- **Endpoint**: GET `/api/staff`
- **Description**: Get list of all staff members
- **Headers**:
  - Authorization: Bearer <token>
- **Response**:
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "specialization": "string",
      "availability": [
        {
          "day": "string",
          "start_time": "string",
          "end_time": "string"
        }
      ]
    }
  ]
  ```

### Create Staff
- **Endpoint**: POST `/api/staff`
- **Description**: Create a new staff member
- **Headers**:
  - Authorization: Bearer <token>
  - Role: admin
- **Request Body**:
  ```json
  {
    "name": "string",
    "specialization": "string",
    "availability": [
      {
        "day": "string",
        "start_time": "string",
        "end_time": "string"
      }
    ]
  }
  ```

## Booking Management API

### Create Booking
- **Endpoint**: POST `/api/bookings`
- **Description**: Create a new booking
- **Headers**:
  - Authorization: Bearer <token>
- **Request Body**:
  ```json
  {
    "serviceId": "string",
    "staffId": "string",
    "date": "string",
    "time": "string"
  }
  ```

### Get User Bookings
- **Endpoint**: GET `/api/bookings/user`
- **Description**: Get user's bookings
- **Headers**:
  - Authorization: Bearer <token>
- **Response**:
  ```json
  [
    {
      "id": "string",
      "service": {
        "name": "string",
        "price": "number"
      },
      "staff": {
        "name": "string",
        "specialization": "string"
      },
      "date": "string",
      "time": "string",
      "status": "string",
      "paymentStatus": "string",
      "amountPaid": "number"
    }
  ]
  ```

### Cancel Booking
- **Endpoint**: PATCH `/api/bookings/cancel/:id`
- **Description**: Cancel a booking
- **Headers**:
  - Authorization: Bearer <token>

### Reschedule Booking
- **Endpoint**: PATCH `/api/bookings/reschedule/:id`
- **Description**: Reschedule a booking
- **Headers**:
  - Authorization: Bearer <token>
- **Request Body**:
  ```json
  {
    "date": "string",
    "time": "string"
  }
  ```

## Payment API

### Create Payment
- **Endpoint**: POST `/api/payment/create-order`
- **Description**: Create a payment order
- **Headers**:
  - Authorization: Bearer <token>
- **Request Body**:
  ```json
  {
    "bookingId": "string"
  }
  ```

### Update Payment Status
- **Endpoint**: POST `/api/payment/update-status`
- **Description**: Update payment status
- **Headers**:
  - Authorization: Bearer <token>
- **Request Body**:
  ```json
  {
    "bookingId": "string",
    "success": "boolean",
    "orderId": "string",
    "payment_id": "string"
  }
  ```

## Review API

### Create Review
- **Endpoint**: POST `/api/reviews`
- **Description**: Create a new review
- **Headers**:
  - Authorization: Bearer <token>
- **Request Body**:
  ```json
  {
    "bookingId": "string",
    "rating": "number",
    "comment": "string"
  }
  ```

### Get Service Reviews
- **Endpoint**: GET `/api/reviews/service/:serviceId`
- **Description**: Get reviews for a service
- **Response**:
  ```json
  {
    "averageRating": "number",
    "reviews": [
      {
        "id": "string",
        "user": {
          "name": "string"
        },
        "rating": "number",
        "comment": "string",
        "createdAt": "string"
      }
    ]
  }
  ```
