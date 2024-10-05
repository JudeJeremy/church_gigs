# Church Gigs Marketplace

This is a full-stack web app for a church-focused gig marketplace, similar to Airtasker but specifically tailored to church-related services. The app allows people to post gigs with budgets and receive offers from service providers.

## Features

- User Authentication (Sign up and Log in)
- User Profiles
- Gig Listings (Create, Read, Update, Delete) with budgets and time frames
- Offer System (Make offers on gigs, accept offers)
- Service Offerings (Create, Read, Update, Delete)
- Booking and Scheduling System
- Real-time Notifications
- Messaging System for Bookings
- Rating and Review System for completed gigs
- Dashboard for managing gigs, offers, services, bookings, and reviews
- Search functionality for gigs and services

## Technologies Used

- Next.js 13 (with App Router)
- React
- TypeScript
- Tailwind CSS
- Supabase (Authentication, Database, and Real-time subscriptions)

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/your-username/church-gigs-marketplace.git
   cd church-gigs-marketplace
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your Supabase project:
   - Create a new project on [Supabase](https://supabase.com)
   - Get your project URL and API keys

4. Create a `.env.local` file in the root directory with the following content:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
   Replace the placeholder values with your actual Supabase credentials.

5. Set up the database tables:
   - Go to the SQL editor in your Supabase dashboard
   - Copy the contents of the `supabase/setup.sql` file
   - Paste the SQL into the SQL editor and run the query

   This will create the necessary tables, functions, and policies for your project.

6. Run the development server:
   ```
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Gig Creation and Offer System

The application includes an Airtasker-like gig and offer system:

- Users can create gigs by providing a title, description, date, time frame (start time and end time), and budget.
- Other users can view available gigs and make offers with their proposed price.
- Gig creators can view offers on their gigs and accept them.
- The gig status changes to "assigned" when an offer is accepted.

## Rating and Review System

The application now includes a rating and review system for completed gigs:

- After a gig is marked as completed, both the gig creator and the service provider can leave reviews for each other.
- Reviews include a rating (1-5 stars) and a comment.
- The average rating for each user is displayed on their gigs and offers.
- Users can view their received reviews on their profile page.

## Dashboard

The dashboard provides a comprehensive view of a user's activity:

- Posted Gigs: View your created gigs, their details, received offers, and the ability to mark gigs as completed.
- Your Offers: See the offers you've made on other users' gigs and their status.
- Your Services: Manage the services you offer.
- Your Bookings: View and manage your booked services.
- Reviews: Leave reviews for completed gigs and view reviews you've received.

## Notification System

The application includes a real-time notification system:

- Users receive notifications when they receive offers on their gigs.
- Notifications appear in real-time on the user's dashboard.
- Users can mark notifications as read.

## Messaging System

The application includes a real-time messaging system for bookings:

- Users can send and receive messages related to specific bookings.
- The messaging interface is available on the dashboard for each booking.
- Messages are updated in real-time using Supabase's real-time subscriptions.

## Security

We've implemented the following security measures:

- Authentication using Supabase Auth.
- Row Level Security (RLS) policies for all database tables to ensure users can only access and modify their own data.
- Server-side checks for user authentication and authorization.

## Deployment

This project can be easily deployed on platforms like Vercel or Netlify. Make sure to set up the environment variables in your deployment platform's settings.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Troubleshooting

If you encounter any issues:

1. Make sure your Supabase project URL and API keys are correctly set in the `.env.local` file.
2. Ensure that the Supabase project's authentication settings allow signups and logins with email/password.
3. Check the browser console and server logs for any error messages.
4. If you need to reset the database or apply new changes, you can run the `supabase/setup.sql` file again in the Supabase SQL editor.

## TODO

- Implement search and filter functionality for gigs
- Add pagination for gigs and services listings
- Implement user ratings and reviews for services
- Add payment integration for successful gig completions
- Implement an admin dashboard for managing users and content
- Add email notifications for new offers, accepted offers, and messages
- Enhance user profiles with skills, portfolio, and availability calendar
- Implement categories for gigs and services
- Add a dispute resolution system
- Implement a recommendation system for gigs based on user skills and history
