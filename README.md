# Ray-Ban Meta Glasses Website

A modern, responsive e-commerce website inspired by the Ray-Ban Meta Glasses official site.

## Features

- **Modern Design**: Clean, minimalist interface with gradient accents
- **Product Showcase**: Interactive product grid with filtering capabilities
- **Product Details**: Modal popups with detailed product information
- **Shopping Cart**: Add products to cart with visual feedback
- **AI Chatbot**: OpenAI-powered chatbot with vectorized knowledge base from Supabase
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Engaging transitions and hover effects

## Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- Google Fonts (Inter)
- Supabase (Vector Database & Edge Functions)
- OpenAI API (GPT-4o-mini & Embeddings)

## Getting Started

1. **Set up Supabase Edge Function Environment Variables:**
   - Go to your Supabase project dashboard
   - Navigate to Edge Functions → chatbot
   - Add the following environment variables:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `SUPABASE_URL`: Your Supabase project URL (automatically set)
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

2. **Open `index.html` in your web browser**
   - The chatbot widget will appear in the bottom-right corner
   - Click the contact button in the header to open the chatbot

## Chatbot Setup

The chatbot uses:
- **Vector Search**: Supabase pgvector for semantic search in the `ray_chat` table
- **OpenAI Embeddings**: `text-embedding-3-large` (3072 dimensions) for query embeddings
- **OpenAI Chat**: `gpt-4o-mini` for generating responses with context

The knowledge base is stored in the `ray_chat` table in Supabase with vectorized embeddings.

## Project Structure

```
ray-ban-meta-site/
├── index.html      # Main HTML structure
├── styles.css      # All styling and responsive design
├── script.js       # Interactive functionality
└── README.md       # This file
```

## Features Breakdown

### Navigation
- Sticky header with logo and navigation menu
- Search and cart icons
- Smooth scroll navigation

### Hero Section
- Eye-catching gradient title
- Call-to-action buttons
- Animated glasses showcase

### Products Section
- Filterable product grid (All, Gen 2, Gen 1, Aviator, Wayfarer, Round)
- Product cards with hover effects
- Quick add-to-cart functionality

### Product Modal
- Detailed product information
- Feature list
- Large product image
- Add to cart from modal

### Features Section
- Highlighted key features
- Icon-based presentation
- Hover animations

## Customization

You can easily customize:
- Colors in the `:root` CSS variables
- Products in the `products` array in `script.js`
- Styling in `styles.css`
- Content in `index.html`

## Browser Support

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## License

This is a demonstration project inspired by Ray-Ban Meta Glasses.
