import { useEffect } from 'react';

export default function SeoHead({
  title,
  description,
  image,
  type = 'website', // 'website', 'article', 'news', 'blog', 'business', 'profile', 'job'
  url,
  schemaMarkup,
  entityData = {}
}) {
  useEffect(() => {
    // 1. Update Document Title
    const siteName = 'privatesector.ch';
    const pageTitle = title ? `${title} — ${siteName}` : siteName;
    document.title = pageTitle;

    // Helper to update meta tag
    const setMetaTag = (selector, attributeName, attributeValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content || '');
    };

    const currentUrl = url || window.location.href;
    const defaultDescription = 'Swiss Private Sector Intelligence — B2B company directory, market statistics, executive interviews, and talent portal.';
    const metaDescription = description || defaultDescription;
    const defaultImage = `${window.location.origin}/logo.png`;
    const metaImage = image || defaultImage;

    // 2. Standard Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', metaDescription);

    // 3. Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', metaDescription);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', metaImage);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type === 'news' || type === 'blog' ? 'article' : 'website');
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);

    // 4. Twitter Card Meta Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', metaDescription);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', metaImage);

    // 5. JSON-LD Schema Generation & Injection
    const existingSchema = document.getElementById('seo-jsonld-schema');
    if (existingSchema) existingSchema.remove();

    let jsonLdObj = null;

    if (schemaMarkup) {
      try {
        jsonLdObj = typeof schemaMarkup === 'string' ? JSON.parse(schemaMarkup) : schemaMarkup;
      } catch (e) {
        console.warn('Failed to parse custom schema_markup, generating dynamic schema instead.');
      }
    }

    if (!jsonLdObj) {
      if (type === 'news') {
        jsonLdObj = {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          'headline': title || entityData.title || '',
          'description': metaDescription,
          'image': metaImage,
          'datePublished': entityData.date_published || new Date().toISOString().split('T')[0],
          'dateModified': entityData.date_published || new Date().toISOString().split('T')[0],
          'author': {
            '@type': 'Person',
            'name': entityData.author_name || 'Editorial Team'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Private Sector Switzerland',
            'logo': {
              '@type': 'ImageObject',
              'url': defaultImage
            }
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': currentUrl
          }
        };
      } else if (type === 'blog') {
        jsonLdObj = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': title || entityData.title || '',
          'description': metaDescription,
          'image': metaImage,
          'datePublished': entityData.date_published || new Date().toISOString().split('T')[0],
          'author': {
            '@type': 'Person',
            'name': entityData.author_name || 'Editorial Team'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Private Sector Switzerland'
          }
        };
      } else if (type === 'business') {
        jsonLdObj = {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': title || entityData.name || '',
          'description': metaDescription,
          'image': metaImage,
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': entityData.canton || 'ZH',
            'addressCountry': 'CH'
          },
          'industry': entityData.industry || 'Business Services',
          'numberOfEmployees': {
            '@type': 'QuantitativeValue',
            'value': entityData.employees || 0
          }
        };
      } else if (type === 'profile') {
        jsonLdObj = {
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          'mainEntity': {
            '@type': 'Person',
            'name': title || entityData.name || '',
            'description': metaDescription,
            'image': metaImage,
            'worksFor': {
              '@type': 'EducationalOrganization',
              'name': entityData.university || 'Swiss University'
            }
          }
        };
      } else if (type === 'job') {
        jsonLdObj = {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          'title': title || entityData.title || '',
          'description': metaDescription,
          'datePosted': entityData.date_posted || new Date().toISOString().split('T')[0],
          'employmentType': entityData.type || 'FULL_TIME',
          'hiringOrganization': {
            '@type': 'Organization',
            'name': entityData.company_name || 'Swiss Enterprise'
          },
          'jobLocation': {
            '@type': 'Place',
            'address': {
              '@type': 'PostalAddress',
              'addressCountry': 'CH'
            }
          }
        };
      } else if (type === 'audio' || type === 'briefing') {
        jsonLdObj = {
          '@context': 'https://schema.org',
          '@type': 'PodcastEpisode',
          'name': title || 'PrivateSector Morning Briefing',
          'description': metaDescription,
          'datePublished': entityData.date || new Date().toISOString().split('T')[0],
          'associatedMedia': {
            '@type': 'AudioObject',
            'contentUrl': entityData.audio_url || ''
          },
          'partOfSeries': {
            '@type': 'PodcastSeries',
            'name': 'PrivateSector Daily Audio Intelligence',
            'url': 'https://privatesector.ch/'
          }
        };
      } else {
        // Generic WebPage / Organization Schema
        jsonLdObj = {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'Private Sector Switzerland',
          'url': currentUrl,
          'logo': defaultImage,
          'description': metaDescription
        };
      }
    }

    if (jsonLdObj) {
      const script = document.createElement('script');
      script.id = 'seo-jsonld-schema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(jsonLdObj, null, 2);
      document.head.appendChild(script);
    }
  }, [title, description, image, type, url, schemaMarkup, entityData]);

  return null;
}
