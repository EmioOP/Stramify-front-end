# StreamHub Frontend

A modern video streaming platform frontend built with Next.js 15, React 19, and shadcn/ui components. This frontend is designed to work with your Express.js backend.

## Features

✨ **Authentication**
- User registration and login
- Secure JWT-based authentication
- Automatic token refresh
- User logout

🎥 **Video Management**
- Browse and discover videos
- Upload videos with thumbnails
- Watch videos with a built-in player
- View count tracking

💬 **Social Features**
- Like/unlike videos
- Comment on videos
- View channel profiles
- Subscribe to channels

🔍 **Discovery**
- Search videos
- Browse video feed with pagination
- View trending content

⚙️ **User Settings**
- Update profile information
- Change avatar
- Update password
- Channel customization

## Prerequisites

- Node.js 18+ 
- npm or pnpm
- Express.js backend running (default: http://localhost:8000)

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone or download the project
cd your-project-directory

# Install dependencies
pnpm install
# or npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

> **Note:** If your Express backend runs on a different port, update the URL accordingly.

### 3. Start the Development Server

```bash
pnpm dev
# or npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
app/
├── page.tsx                 # Home page with video feed
├── login/page.tsx          # Login page
├── register/page.tsx       # Registration page
├── upload/page.tsx         # Video upload page
├── watch/[id]/page.tsx     # Video player page
├── channel/[id]/page.tsx   # User channel page
├── search/page.tsx         # Search results page
├── settings/page.tsx       # User settings page
├── layout.tsx              # Root layout with auth provider
└── globals.css             # Global styles and theme

components/
├── Header.tsx              # Top navigation bar
├── VideoCard.tsx           # Video card component

context/
└── AuthContext.tsx         # Authentication state management

lib/
└── api.ts                  # Axios API client with interceptors
```

## API Integration

The frontend communicates with your Express backend using Axios. All API calls are configured in `lib/api.ts` which handles:

- Bearer token authentication
- Automatic token refresh on 401 responses
- Request/response interceptors
- Base URL configuration

### Expected Backend Routes

The frontend expects your Express backend to have these routes:

**Users**
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `GET /api/v1/users/current-user` - Get current user
- `PATCH /api/v1/users/update-details` - Update user profile
- `PATCH /api/v1/users/update-avatar` - Update user avatar
- `PATCH /api/v1/users/change-password` - Change password
- `POST /api/v1/users/refresh-token` - Refresh access token
- `GET /api/v1/users/:id` - Get user channel info

**Videos**
- `GET /api/v1/videos` - Get all videos (with pagination)
- `GET /api/v1/videos/:id` - Get video details
- `POST /api/v1/videos/video` - Upload video
- `POST /api/v1/videos/:id/view` - Increment view count

**Likes**
- `POST /api/v1/likes/like/:id` - Toggle video like

**Comments**
- `POST /api/v1/comments/comment/:id` - Add comment
- `GET /api/v1/comments/:id` - Get video comments

**Playlists**
- `POST /api/v1/playlists/` - Create playlist
- `POST /api/v1/playlists/:playlistId/video/:videoId` - Add video to playlist
- `DELETE /api/v1/playlists/:playlistId/video/:videoId` - Remove video from playlist
- `GET /api/v1/playlists/:playlistId` - Get playlist videos

## Theme & Design

The app uses a modern dark theme with:
- **Primary Color:** Cyan (`hsl(190, 100%, 50%)`)
- **Background:** Dark gray (`hsl(0, 0%, 5%)`)
- **Cards:** Lighter dark gray (`hsl(0, 0%, 12%)`)
- **Font:** Geist (headings and body)

All colors are configured in `app/globals.css` using CSS custom properties.

## Key Components

### Header
Sticky top navigation with:
- Logo/branding
- Search functionality
- Upload button (authenticated users)
- User menu with profile/settings/logout

### VideoCard
Reusable card component displaying:
- Video thumbnail
- Title (max 2 lines)
- Channel avatar and name
- View count and upload date

### AuthContext
Manages:
- User authentication state
- Login/register/logout functions
- Current user data
- Token management

## Authentication Flow

1. User registers or logs in
2. Backend returns `accessToken` and `refreshToken`
3. Tokens stored in localStorage
4. AccessToken sent with all API requests via Authorization header
5. On 401 response, refresh token used to get new accessToken
6. User automatically logged out if refresh fails

## Troubleshooting

### Cannot connect to backend
- Verify your backend is running on `http://localhost:8000`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend CORS allows requests from `http://localhost:3000`

### Login/registration fails
- Check if user data format matches your backend expectations
- Verify form field names match API requirements
- Check browser console for detailed error messages

### Video upload not working
- Ensure thumbnails are in image format (JPG, PNG, WebP)
- Video file size must be under 4GB
- Check backend file upload configuration

### Videos not displaying
- Verify video URLs in database are accessible
- Check CORS settings if videos hosted on different domain
- Ensure video format is supported (MP4, WebM, Ogg)

## Building for Production

```bash
pnpm build
pnpm start
```

Make sure to set `NEXT_PUBLIC_API_URL` to your production backend URL in your deployment environment.

## Environment Setup for Deployment

When deploying (e.g., to Vercel, Railway, etc.), set:

```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
```

This ensures the frontend connects to your production backend.

## Common Modifications

### Change API URL
Edit `NEXT_PUBLIC_API_URL` in `.env.local`

### Update theme colors
Edit CSS variables in `app/globals.css` under `.dark` class

### Modify video grid layout
Edit grid columns in components/VideoCard.tsx or app/page.tsx

### Add features
Most features follow similar patterns - check existing code for examples

## Support & Next Steps

1. **Test with your backend:** Ensure all API routes are implemented
2. **Configure storage:** Update video/thumbnail URLs to point to your storage (Cloudinary, S3, etc.)
3. **Add more features:** The codebase is structured to easily add playlists, subscriptions, etc.
4. **Deploy:** Once working locally, deploy both frontend and backend to production

## Need Help?

- Check the component implementations for usage patterns
- Review API calls in components to understand data flow
- Ensure your backend routes match the expected formats
- Check browser console and network tab for debugging
