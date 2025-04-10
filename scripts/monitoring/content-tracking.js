const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * ContentTracker - Tracks content status and validation for website pages
 * Includes schema for content tracking with Islamic content validation
 */
class ContentTracker {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'scripts', 'monitoring', 'data');
    this.contentStatusFile = path.join(this.dataDir, 'content-status.json');
    this.pagesDir = path.join(process.cwd(), 'src', 'pages');
    this.ensureDirectories();
    
    // Default schema for page content tracking
    this.contentSchema = {
      pages: {
        index: {
          title: 'Home',
          sections: ['Hero', 'Featured Content', 'Latest Updates'],
          contentStatus: 'pending',
          validation: { 
            islamicContent: 'pending',
            lastChecked: null
          },
          lastUpdated: null
        },
        about: {
          title: 'About Us',
          sections: ['Mission', 'Vision', 'Team'],
          contentStatus: 'pending',
          validation: { 
            islamicContent: 'pending',
            lastChecked: null
          },
          lastUpdated: null
        },
        community: {
          title: 'Community',
          sections: ['Forums', 'Events', 'Resources'],
          contentStatus: 'pending',
          validation: { 
            islamicContent: 'pending',
            lastChecked: null
          },
          lastUpdated: null
        },
        content: {
          title: 'Islamic Content',
          sections: ['Articles', 'Videos', 'Resources'],
          contentStatus: 'pending',
          validation: { 
            islamicContent: 'pending',
            lastChecked: null
          },
          lastUpdated: null
        },
        events: {
          title: 'Events',
          sections: ['Upcoming', 'Past', 'Calendar'],
          contentStatus: 'pending',
          validation: { 
            islamicContent: 'pending',
            lastChecked: null
          },
          lastUpdated: null
        },
        shop: {
          title: 'Shop',
          sections: ['Products', 'Categories', 'Cart'],
          contentStatus: 'pending',
          validation: { 
            islamicContent: 'pending',
            lastChecked: null
          },
          lastUpdated: null
        }
      },
      
      features: {
        authentication: {
          status: 'completed',
          tests: 'passing',
          lastUpdated: new Date().toISOString()
        },
        contentManagement: {
          status: 'in_progress',
          completion: '60%',
          lastUpdated: new Date().toISOString()
        },
        community: {
          status: 'planned',
          priority: 'high',
          lastUpdated: new Date().toISOString()
        },
        ecommerce: {
          status: 'in_progress',
          completion: '30%',
          lastUpdated: new Date().toISOString()
        }
      },
      
      lastScan: null,
      _meta: {
        version: '1.0.0',
        scanCount: 0
      }
    };
    
    // Load existing content data or use default schema
    this.loadContentData();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }
  
  /**
   * Load existing content data or initialize with default schema
   */
  loadContentData() {
    try {
      if (fs.existsSync(this.contentStatusFile)) {
        const data = JSON.parse(fs.readFileSync(this.contentStatusFile, 'utf8'));
        this.contentData = data;
        
        // Ensure schema is up to date by merging with defaults
        this.contentData = this.mergeWithDefaults(this.contentData, this.contentSchema);
      } else {
        this.contentData = JSON.parse(JSON.stringify(this.contentSchema));
      }
    } catch (error) {
      console.error('Error loading content data:', error);
      this.contentData = JSON.parse(JSON.stringify(this.contentSchema));
    }
  }
  
  /**
   * Merge existing data with default schema to ensure all fields exist
   */
  mergeWithDefaults(existingData, defaultData) {
    const result = { ...defaultData };
    
    // Recursively merge objects
    for (const [key, value] of Object.entries(existingData)) {
      if (key === '_meta') {
        // Keep metadata but increment version if needed
        result._meta = { 
          ...result._meta, 
          ...value,
          version: value.version || '1.0.0'
        };
      } 
      else if (typeof value === 'object' && value !== null && !Array.isArray(value) && defaultData[key]) {
        result[key] = this.mergeWithDefaults(value, defaultData[key]);
      } 
      else {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Analyze content in pages directory and update status
   */
  async analyzeContent() {
    try {
      if (!fs.existsSync(this.pagesDir)) {
        console.warn('Pages directory not found:', this.pagesDir);
        return this.contentData;
      }
      
      const pageFiles = fs.readdirSync(this.pagesDir);
      const scanTimestamp = new Date().toISOString();
      
      // Update status for each page
      for (const pageFile of pageFiles) {
        // Skip _app.js, _document.js and other special files
        if (pageFile.startsWith('_')) continue;
        
        const pageName = pageFile.replace(/\.(js|jsx|ts|tsx)$/, '');
        if (this.contentData.pages[pageName]) {
          const pageFilePath = path.join(this.pagesDir, pageFile);
          const stats = fs.statSync(pageFilePath);
          const pageContent = fs.readFileSync(pageFilePath, 'utf8');
          
          // Update last modified timestamp
          this.contentData.pages[pageName].lastUpdated = stats.mtime.toISOString();
          
          // Analyze content completeness
          const contentStatus = this.determineContentStatus(pageContent, pageName);
          this.contentData.pages[pageName].contentStatus = contentStatus;
          
          // Check Islamic content validation
          const validationStatus = this.validateIslamicContent(pageContent, pageName);
          this.contentData.pages[pageName].validation = {
            islamicContent: validationStatus,
            lastChecked: scanTimestamp
          };
        }
      }
      
      // Update scan metadata
      this.contentData.lastScan = scanTimestamp;
      this.contentData._meta.scanCount += 1;
      
      // Save content tracking data
      this.saveContentData();
      return this.contentData;
    } catch (error) {
      console.error('Error analyzing content:', error);
      return this.contentData;
    }
  }
  
  /**
   * Determine content status based on file content
   * Uses heuristics like file size, component complexity, etc.
   */
  determineContentStatus(content, pageName) {
    // Simple heuristic: Content length and component complexity
    const componentCount = (content.match(/function\s+\w+\(/g) || []).length + 
                            (content.match(/const\s+\w+\s*=\s*\(/g) || []).length;
    const hasDataFetching = content.includes('getStaticProps') || 
                            content.includes('getServerSideProps') ||
                            content.includes('useEffect');
    const contentLength = content.length;
    
    // Check for completed sections based on page type
    const expectedSections = this.contentData.pages[pageName]?.sections || [];
    let sectionsImplemented = 0;
    
    for (const section of expectedSections) {
      // Look for section identifiers in comments, component names, or div ids
      if (content.includes(`section="${section}"`) || 
          content.includes(`id="${section}"`) ||
          content.includes(`/* ${section} */`) ||
          content.includes(`// ${section} Section`) ||
          content.includes(`${section.replace(/\s+/g, '')}Section`)) {
        sectionsImplemented++;
      }
    }
    
    const sectionCompletionRatio = expectedSections.length > 0 ? 
                                  sectionsImplemented / expectedSections.length : 0;
                                  
    // Determine status based on multiple factors
    if (contentLength > 1500 && componentCount >= 3 && 
        hasDataFetching && sectionCompletionRatio > 0.7) {
      return 'completed';
    } else if (contentLength > 800 && componentCount >= 2 && 
              sectionCompletionRatio > 0.3) {
      return 'in_progress';
    } else if (contentLength > 400) {
      return 'started';
    }
    
    return 'pending';
  }
  
  /**
   * Validate Islamic content authenticity based on content analysis
   * This is a basic implementation and would be enhanced with proper validation logic
   */
  validateIslamicContent(content, pageName) {
    // Keywords that might indicate Islamic content
    const islamicKeywords = [
      'Quran', 'Hadith', 'Allah', 'Prophet', 'Muhammad', 'Islam', 'Muslim',
      'Salah', 'Prayer', 'Dua', 'Mosque', 'Masjid', 'Fiqh', 'Shariah'
    ];
    
    // Check for Islamic content references
    const keywordsFound = islamicKeywords.filter(keyword => 
      new RegExp(`\\b${keyword}\\b`, 'i').test(content)
    );
    
    // For content and about pages, we expect more Islamic content
    const isIslamicFocusedPage = ['content', 'about'].includes(pageName);
    
    if (keywordsFound.length >= (isIslamicFocusedPage ? 4 : 2)) {
      return 'verified';
    } else if (keywordsFound.length > 0) {
      return 'partial';
    }
    
    // Default to pending for pages that should have Islamic content
    return isIslamicFocusedPage ? 'pending' : 'not_applicable';
  }

  /**
   * Save content tracking data to JSON file
   */
  saveContentData() {
    fs.writeFileSync(this.contentStatusFile, JSON.stringify(this.contentData, null, 2));
    console.log(`Content tracking data saved to ${this.contentStatusFile}`);
  }

  /**
   * Get current content status with fresh analysis
   */
  async getContentStatus() {
    try {
      // Run a quick analysis to ensure data is current
      await this.analyzeContent();
      return this.contentData;
    } catch (error) {
      console.error('Error getting content status:', error);
      return this.contentData;
    }
  }
  
  /**
   * Get summary of content status for reporting
   */
  getContentSummary() {
    const pages = this.contentData.pages;
    const features = this.contentData.features;
    
    const pageStatuses = Object.values(pages).reduce((acc, page) => {
      // Count "started" as "in_progress"
      const status = page.contentStatus === 'started' ? 'in_progress' : page.contentStatus;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const featureStatuses = Object.values(features).reduce((acc, feature) => {
      acc[feature.status] = (acc[feature.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      pages: {
        total: Object.keys(pages).length,
        completed: pageStatuses.completed || 0,
        in_progress: (pageStatuses.in_progress || 0) + (pageStatuses.started || 0),
        pending: pageStatuses.pending || 0
      },
      features: {
        total: Object.keys(features).length,
        completed: featureStatuses.completed || 0,
        in_progress: featureStatuses.in_progress || 0,
        planned: featureStatuses.planned || 0
      },
      islamicContentValidation: {
        verified: Object.values(pages).filter(p => p.validation.islamicContent === 'verified').length,
        partial: Object.values(pages).filter(p => p.validation.islamicContent === 'partial').length,
        pending: Object.values(pages).filter(p => p.validation.islamicContent === 'pending').length,
        not_applicable: Object.values(pages).filter(p => p.validation.islamicContent === 'not_applicable').length
      },
      lastUpdated: this.contentData.lastScan
    };
  }
}

module.exports = new ContentTracker();

// If running directly, analyze content
if (require.main === module) {
  console.log('Starting content analysis...');
  const contentTracker = module.exports;
  contentTracker.analyzeContent()
    .then(() => {
      console.log('Content analysis complete');
      console.log('Summary:', JSON.stringify(contentTracker.getContentSummary(), null, 2));
    })
    .catch(error => {
      console.error('Content analysis failed:', error);
    });
}

