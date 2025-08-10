// Theme toggle functionality
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle")
  const themeIcon = document.getElementById("theme-icon")
  const html = document.documentElement

  // Check for saved theme preference or default to 'dark'
  const currentTheme = localStorage.getItem("theme") || "dark"
  html.setAttribute("data-theme", currentTheme)
  updateThemeIcon(currentTheme)

  themeToggle?.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    html.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
    updateThemeIcon(newTheme)
  })

  function updateThemeIcon(theme) {
    if (themeIcon) {
      themeIcon.textContent = theme === "dark" ? "☀️" : "🌙"
    }
  }

  // Header scroll behavior
  let lastScrollTop = 0
  const header = document.querySelector("header")

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down
      header.style.transform = "translateY(-100%)"
    } else {
      // Scrolling up
      header.style.transform = "translateY(0)"
    }

    lastScrollTop = scrollTop
  })

  // Copy code functionality with lava red styling
  document.querySelectorAll("pre").forEach((pre) => {
    // Remove any existing copy buttons (like Prism.js ones)
    const existingButtons = pre.querySelectorAll('.copy-to-clipboard-button, [data-copy]')
    existingButtons.forEach(btn => btn.remove())
    
    const button = document.createElement("button")
    button.style.cssText = `
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: #e74c3c;
      color: #0a0a0a;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.3s ease;
      cursor: pointer;
      font-family: 'Roboto Mono', monospace;
      z-index: 10;
      border: none;
    `
    button.textContent = "Copy"

    pre.style.position = "relative"
    pre.appendChild(button)

    pre.addEventListener("mouseenter", () => (button.style.opacity = "1"))
    pre.addEventListener("mouseleave", () => (button.style.opacity = "0"))

    button.addEventListener("click", () => {
      const code = pre.querySelector("code")
      navigator.clipboard.writeText(code.textContent).then(() => {
        button.textContent = "Copied!"
        button.style.background = "#27ae60"
        setTimeout(() => {
          button.textContent = "Copy"
          button.style.background = "#e74c3c"
        }, 2000)
      })
    })
  })

  // Mobile TOC toggle functionality
  const tocToggle = document.getElementById('toc-toggle')
  const tocSidebar = document.getElementById('toc-sidebar')
  
  if (tocToggle && tocSidebar) {
    tocToggle.addEventListener('click', () => {
      tocSidebar.classList.toggle('visible')
    })
    
    // Close TOC when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024 && 
          !tocSidebar.contains(e.target) && 
          !tocToggle.contains(e.target) && 
          tocSidebar.classList.contains('visible')) {
        tocSidebar.classList.remove('visible')
      }
    })
  }

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle")
  // Add mobile menu functionality here if needed

  // Generate Table of Contents and add anchor links
  const postContent = document.querySelector('.post-content')
  const tocContainer = document.getElementById('table-of-contents')
  
  if (postContent && tocContainer) {
    const headings = postContent.querySelectorAll('h1, h2, h3, h4, h5, h6')
    
    if (headings.length > 0) {
      // Generate TOC
      let tocHTML = '<ul>'
      let currentLevel = 0
      
      headings.forEach((heading, index) => {
        // Create ID from heading text if it doesn't have one
        if (!heading.id) {
          heading.id = heading.textContent
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
        }
        
        const level = parseInt(heading.tagName.charAt(1))
        const text = heading.textContent.replace('#', '').trim()
        
        if (level > currentLevel) {
          tocHTML += '<ul>'.repeat(level - currentLevel)
        } else if (level < currentLevel) {
          tocHTML += '</ul>'.repeat(currentLevel - level)
        }
        
        tocHTML += `<li><a href="#${heading.id}" data-heading="${heading.id}">${text}</a></li>`
        currentLevel = level
        
        // Create anchor link
        const anchor = document.createElement('a')
        anchor.href = `#${heading.id}`
        anchor.className = 'heading-anchor'
        anchor.innerHTML = '#'
        anchor.setAttribute('aria-label', 'Link to this heading')
        
        // Add click handler to update URL
        anchor.addEventListener('click', (e) => {
          e.preventDefault()
          window.history.pushState(null, null, `#${heading.id}`)
          heading.scrollIntoView({ behavior: 'smooth' })
        })
        
        // Add anchor to heading
        heading.style.position = 'relative'
        heading.appendChild(anchor)
      })
      
      tocHTML += '</ul>'.repeat(currentLevel)
      tocContainer.innerHTML = tocHTML
      
      // Add click handlers to TOC links
      const tocLinks = tocContainer.querySelectorAll('a')
      tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault()
          const targetId = link.getAttribute('href').substring(1)
          const targetElement = document.getElementById(targetId)
          if (targetElement) {
            window.history.pushState(null, null, `#${targetId}`)
            targetElement.scrollIntoView({ behavior: 'smooth' })
          }
        })
      })
      
      // Active section highlighting on scroll
      let activeLink = null
      
      function updateActiveLink() {
        const scrollPosition = window.scrollY + 150
        
        headings.forEach(heading => {
          const rect = heading.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          
          if (elementTop <= scrollPosition) {
            // Remove active class from all links
            tocLinks.forEach(link => link.classList.remove('active'))
            
            // Add active class to current section
            const currentLink = tocContainer.querySelector(`a[data-heading="${heading.id}"]`)
            if (currentLink) {
              currentLink.classList.add('active')
              activeLink = currentLink
            }
          }
        })
      }
      
      // Throttled scroll handler
      let ticking = false
      function onScroll() {
        if (!ticking) {
          requestAnimationFrame(updateActiveLink)
          ticking = true
          setTimeout(() => { ticking = false }, 10)
        }
      }
      
      window.addEventListener('scroll', onScroll)
      updateActiveLink() // Initial call
      
    } else {
      // Hide TOC if no headings
      const tocSidebar = document.querySelector('.toc-sidebar')
      if (tocSidebar) {
        tocSidebar.style.display = 'none'
      }
    }
  }
})
