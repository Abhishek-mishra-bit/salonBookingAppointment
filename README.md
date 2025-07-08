# Salon Booking Appointment System

This project is a full-stack web application for managing salon appointments. It provides a platform for clients to book appointments for various salon services and for administrators to manage the bookings, services, and clients.

## Key Features

- **User Authentication:** Secure user registration and login system using JSON Web Tokens (JWT) and password hashing with bcrypt.
- **Appointment Scheduling:** Clients can view available services and book appointments for their preferred date and time.
- **Admin Dashboard:** A dedicated dashboard for salon administrators to view, confirm, or cancel appointments, manage services, and view client information.
- **Payment Integration:** Integrated with Razorpay to handle online payments for booked services securely.
- **Email Notifications:** Automated email notifications (using Nodemailer) for appointment confirmations, reminders, and cancellations.
- **Database Management:** Uses Sequelize ORM for robust and easy management of the application's database (MySQL/PostgreSQL).
- **RESTful API:** A well-structured API for handling all the application's functionalities.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL / PostgreSQL with Sequelize ORM
- **Authentication:** JSON Web Tokens (JWT), bcrypt.js
- **Payments:** Razorpay
- **Email:** Nodemailer
- **Templating:** HTML (or a templating engine like EJS/Pug if used)

## Project Flow for Non-Technical Users

This application is like a digital receptionist for a salon. Here's how it works from start to finish:

1.  **Browsing Services**: A potential customer visits the website and can look through all the services offered by the salon, like haircuts, manicures, etc., without needing to log in.
2.  **Booking an Appointment**: To book a service, the customer needs to register and create an account. Once logged in, they can select a service, choose a preferred date and time, and book their appointment.
3.  **Making a Payment**: After booking, the system directs the customer to a secure payment page (powered by Razorpay) to pay for the service online.
4.  **Confirmation**: Once the payment is successful, the customer receives an email confirming their appointment details.
5.  **Salon Management**: The salon's staff and admin can log in to their own dashboards to see all the upcoming appointments. The admin has full control to manage services, staff, and view all bookings.

## User Roles

The application has three types of users:

1.  **Admin**: The owner or manager of the salon. The Admin has complete control over the application. They can:
    *   View and manage all appointments.
    *   Add, update, or remove salon services.
    *   Manage staff accounts.
    *   View all clients and their booking history.
    *   Oversee all payments and business analytics from the admin dashboard.

2.  **Staff**: The salon employees who provide the services. Each staff member has their own account and can:
    *   View the appointments assigned to them.
    *   Manage their schedule.
    *   Check details of the clients they will be serving.

3.  **User (Client)**: The customers of the salon. Users can:
    *   Create an account and manage their profile.
    *   Browse through the list of services.
    *   Book and pay for appointments online.
    *   View their past and upcoming appointments.
    *   Receive email notifications about their bookings.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js and npm installed
- A running instance of MySQL or PostgreSQL

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/salonBookingAppointment.git
    ```
2.  Navigate to the project directory
    ```sh
    cd salonBookingAppointment
    ```
3.  Install NPM packages
    ```sh
    npm install
    ```
4.  Create a `.env` file in the root directory and add your environment variables (database credentials, JWT secret, Razorpay keys, etc.). See `.env.example` for reference.

5.  Run the application
    ```sh
    npm start
    ```
    Or for development with auto-reloading:
    ```sh
    npm run dev
    ```

## Project Structure

```
/src
|-- /controllers       # Handles request logic
|-- /models            # Database schemas (Sequelize)
|-- /views             # HTML/EJS files
|-- /routes            # API routes
|-- /public            # Static assets (CSS, JS, images)
|-- /middlewares       # Custom middleware
|-- /utils             # Utility functions
app.js                 # Main application file
```
