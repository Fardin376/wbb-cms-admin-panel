export const landingPage = {
  html: `
  <div class="container">
    <div class="content-wrapper">
      <div class="left">
        <img src="https://via.placeholder.com/600x400" alt="Section Image" class="section-image">
      </div>
      
      <div class="right">
        <div class="text">
          <h2>History and Achievements</h2>
          <p>
            Work for a Better Bangladesh (WBB) Trust was founded in December 1998. 
            The initial programs of WBB Trust were tobacco control and environment 
            (discouraging polythene shopping bags and addressing noise pollution). 
            Over the years, WBB Trust added a program on gender (now under Economic 
            and Social Justice).  Our tobacco control program is now subsumed under 
            Health Rights, with a broader focus on non-communicable diseases. Our 
            environment work is now subsumed under Livable Cities, with a focus on 
            urban environments.
          </p>
        </div>
        <div class="link">
          <a href="#" class="custom-btn">Details</a>
        </div>
      </div>
    </div>
  </div>
`,

  css: `
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  color: #2B2B2B;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.content-wrapper {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  flex-direction: column-reverse;
}

.left, .right {
  width: 100%;
}

.section-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem 0;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 2.4375rem;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

p {
  line-height: 2rem;
  margin: 0;
}

.custom-btn {
  display: inline-block;
  padding: 0.625rem 1rem;
  border: 1px solid #008645;
  color: #008645;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1.75rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

.custom-btn:hover {
  background-color: #008645;
  color: white;
  box-shadow: 0px 8px 15px rgba(0, 134, 69, 0.3);
}

@media (min-width: 1024px) {
  .content-wrapper {
    flex-direction: row;
  }

  .left, .right {
    width: 50%;
  }

  .right {
    padding-left: 2.25rem;
    gap: 2.25rem;
  }
}
`,
};

export const blogPostLayout = {
  html: `
<article class="blog-post">
  <div class="container">
    <header class="post-header">
      <h1 class="post-title">Write your title here</h1>
      <div class="post-meta">
        <time class="post-date">January 1, 2024</time>
        <span class="post-author">By John Doe</span>
      </div>
    </header>

    <div class="post-content">
      <div class="post-featured-image">
        <img src="https://via.placeholder.com/1200x600" alt="Featured Image" data-gjs-type="image" class="featured-image"/>
      </div>

      <div class="content-body">
        <p>Start writing your content here...</p>
      </div>
    </div>
  </div>
</article>`,

  css: `
/* Base Styles */
.blog-post {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: #2c353d;
  line-height: 1.6;
  font-size: 1.125rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container {
  max-width: 820px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Header Styles */
.post-header {
  text-align: center;
  margin-bottom: 3rem;
}

.post-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 1rem;
  color: #1a202c;
  letter-spacing: -0.02em;
}

.post-meta {
  font-size: 0.95rem;
  color: #64748b;
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.post-meta > *:not(:last-child)::after {
  content: "•";
  margin-left: 1rem;
}

/* Featured Image Styles */
.post-featured-image {
  margin: 0 -1.5rem 3rem;
  position: relative;
}

.post-featured-image img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-featured-image figcaption {
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.75rem;
  padding: 0 1.5rem;
}

/* Content Styles */
.post-content {
  margin: 0 auto;
}

.content-body {
  max-width: 680px;
  margin: 0 auto;
}

.content-body p {
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

.content-body h2 {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 3rem 0 1.5rem;
  color: #1a202c;
  letter-spacing: -0.02em;
}

.content-body h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 2.5rem 0 1.25rem;
  color: #1a202c;
}

.content-body strong {
  font-weight: 600;
  color: #1a202c;
}

.content-body em {
  font-style: italic;
}

.content-body blockquote {
  margin: 2rem 0;
  padding: 1.5rem 2rem;
  border-left: 4px solid #3b82f6;
  background-color: #f8fafc;
  border-radius: 0 4px 4px 0;
}

.content-body blockquote p {
  margin: 0;
  font-style: italic;
  color: #334155;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 1.5rem 1rem;
  }

  .post-header {
    margin-bottom: 2rem;
  }

  .post-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .post-meta > *:not(:last-child)::after {
    display: none;
  }

  .post-featured-image {
    margin: 0 -1rem 2rem;
  }

  .content-body {
    font-size: 1rem;
  }

  .content-body h2 {
    font-size: 1.5rem;
    margin: 2rem 0 1rem;
  }

  .content-body h3 {
    font-size: 1.25rem;
    margin: 1.75rem 0 1rem;
  }

  .content-body blockquote {
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
  }
}

/* Print Styles */
@media print {
  .blog-post {
    font-size: 12pt;
  }

  .container {
    max-width: none;
    padding: 0;
  }

  .post-featured-image {
    margin: 2rem 0;
    page-break-inside: avoid;
  }

  .content-body {
    max-width: none;
  }

  .post-meta {
    color: #000;
  }
}`,
};

// Export layouts
export const defaultLayouts = {
  blogPost: {
    name: 'Blog Post Layout',
    description: 'Clean and responsive layout for blog articles and news',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Layout Center</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background-color: #f4f4f4;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .content {
      max-width: 800px;
      width: 100%;
      background: #fff;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }

    .about-section {
      text-align: center;
    }

    .about-section h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 20px;
    }

    .about-section p {
      font-size: 1.2rem;
      color: #555;
      margin-bottom: 15px;
    }

    .about-section img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="content">
    <div class="about-section">
      <h1>About Us</h1>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla interdum ligula at neque volutpat, in cursus magna laoreet.</p>
      <p>Proin at ligula nec sapien vehicula sodales a ac ligula. Aenean ut semper lacus.</p>
      <img src="https://via.placeholder.com/800x400" alt="About Image">
    </div>
  </div>
</body>
</html>
`,
    //     css: `
    // .blog-container {
    //   max-width: 920px;
    //   margin: 0 auto;
    //   padding: 2rem;
    //   font-family: 'Inter', sans-serif;
    //   color: #2B2B2B;
    // }

    // .blog-header {
    //   text-align: center;
    //   margin-bottom: 3rem;
    // }

    // .meta-info {
    //   display: flex;
    //   justify-content: center;
    //   gap: 1rem;
    //   color: #666;
    //   margin-bottom: 1rem;
    // }

    // .title {
    //   font-size: 2.5rem;
    //   font-weight: 800;
    //   line-height: 1.2;
    //   margin: 1rem 0;
    // }

    // .author-info {
    //   display: flex;
    //   align-items: center;
    //   justify-content: center;
    //   gap: 1rem;
    //   margin-top: 2rem;
    // }

    // .author-image {
    //   width: 50px;
    //   height: 50px;
    //   border-radius: 50%;
    // }

    // .author-details {
    //   text-align: left;
    // }

    // .author-name {
    //   display: block;
    //   font-weight: 600;
    // }

    // .author-role {
    //   font-size: 0.9rem;
    //   color: #666;
    // }

    // .featured-image {
    //   width: 100%;
    //   height: auto;
    //   border-radius: 8px;
    //   margin-bottom: 2rem;
    // }

    // .content {
    //   line-height: 1.8;
    //   font-size: 1.1rem;
    // }

    // .blog-footer {
    //   margin-top: 4rem;
    //   padding-top: 2rem;
    //   border-top: 1px solid #eee;
    // }

    // @media (max-width: 768px) {
    //   .blog-container {
    //     padding: 1rem;
    //   }

    //   .title {
    //     font-size: 2rem;
    //   }
    // }`,
  },
  landing: {
    name: 'Landing Page Layout',
    description: 'Modern landing page for showcasing content or services',
    html: `
  <div class="container">
    <div class="content-wrapper">
      <div class="left">
        <img src="https://via.placeholder.com/600x400" alt="Section Image" class="section-image">
      </div>
      
      <div class="right">
        <div class="text">
          <h2>History and Achievements</h2>
          <p>
            Work for a Better Bangladesh (WBB) Trust was founded in December 1998. 
            The initial programs of WBB Trust were tobacco control and environment 
            (discouraging polythene shopping bags and addressing noise pollution). 
            Over the years, WBB Trust added a program on gender (now under Economic 
            and Social Justice).  Our tobacco control program is now subsumed under 
            Health Rights, with a broader focus on non-communicable diseases. Our 
            environment work is now subsumed under Livable Cities, with a focus on 
            urban environments.
          </p>
        </div>
        <div class="link">
          <a href="#" class="custom-btn">Details</a>
        </div>
      </div>
    </div>
  </div>
`,

    css: `
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  color: #2B2B2B;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.content-wrapper {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.left, .right {
  width: 100%;
}

.section-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem 0;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 2.4375rem;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

p {
  line-height: 2rem;
  margin: 0;
}

.custom-btn {
  display: inline-block;
  padding: 0.625rem 1rem;
  border: 1px solid #008645;
  color: #008645;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 1.75rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

.custom-btn:hover {
  background-color: #008645;
  color: white;
  box-shadow: 0px 8px 15px rgba(0, 134, 69, 0.3);
}

@media (min-width: 1024px) {
  .content-wrapper {
    flex-direction: row;
  }

  .left, .right {
    width: 50%;
  }

  .right {
    padding-left: 2.25rem;
    gap: 2.25rem;
  }
}
`,
  },
};
